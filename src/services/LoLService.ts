import { Service } from 'typedi'
import { Lane, MatchDto, Queue, QueueType, RiotService } from '../libs/riot'
import {
  MatchHistoryRepository,
  RankStatRepository,
  SummonerRepository,
} from '../repositories'

const MAXIMUM_DURATION = 1000 * 60 * 60 * 24 * 3 // 최대 조회 기간 = 3일

@Service()
export class LoLService {
  constructor(
    private summonerRepo: SummonerRepository,
    private rankStatRepo: RankStatRepository,
    private matchHistoryRepo: MatchHistoryRepository,
    private riotService: RiotService,
  ) {}

  // 계정 관련
  public async getAccount(gameName: string, tagLine: string = 'KR1') {
    return this.riotService.fetchAccount(gameName, tagLine)
  }

  // 통합 (소환사, 랭크, 전적) 조회
  public async getSummonerDetails(riotPuuid: string) {
    const [summonerProfile, rankStats, matchHistories] = await Promise.all([
      this.getSummonerProfile(riotPuuid),
      this.getSummonerRankStats(riotPuuid),
      this.getMatchHistories(riotPuuid),
    ])

    return { summonerProfile, rankStats, matchHistories }
  }

  public async refreshSummonerDetails(riotPuuid: string) {
    const [
      refreshedSummonerProfile,
      refreshedRankStats,
      refreshedMatchHistories,
    ] = await Promise.all([
      this.refreshSummonerProfile(riotPuuid),
      this.refreshSummonerRankStats(riotPuuid),
      this.refreshMatchHistories(riotPuuid),
    ])

    return {
      refreshedSummonerProfile,
      refreshedRankStats,
      refreshedMatchHistories,
    }
  }

  // 소환사 관련
  public async getSummonerProfile(riotPuuid: string) {
    const summonerProfile = await this.summonerRepo.read(riotPuuid)
    if (!summonerProfile) {
      const fetchedSummonerProfile = await this.fetchSummonerProfile(riotPuuid)
      return await this.summonerRepo.create(fetchedSummonerProfile)
    }

    return summonerProfile
  }

  public async refreshSummonerProfile(riotPuuid: string) {
    const fetchedSummonerProfile = await this.fetchSummonerProfile(riotPuuid)
    return await this.summonerRepo.update(fetchedSummonerProfile)
  }

  // 랭크 관련
  public async getSummonerRankStats(riotPuuid: string) {
    const summonerId = await this.getSummonerId(riotPuuid)

    const rankStats = await this.rankStatRepo.read(summonerId)
    if (!rankStats) {
      const fetchedRankStats = await this.fetchRankStats(summonerId)
      return await this.rankStatRepo.create(fetchedRankStats)
    }

    return rankStats
  }

  public async refreshSummonerRankStats(riotPuuid: string) {
    const summonerId = await this.getSummonerId(riotPuuid)

    const fetchedRankStats = await this.fetchRankStats(summonerId)

    return await this.rankStatRepo.update(fetchedRankStats)
  }

  // 전적 관련
  public async getMatchHistories(riotPuuid: string) {
    return this.matchHistoryRepo.read(riotPuuid)
  }

  public async refreshMatchHistories(riotPuuid: string) {
    const [soloMatchInfos, flexMatchInfos] = await Promise.all([
      this.fetchMatchHistories(riotPuuid, 'RANKED_SOLO_5x5'),
      this.fetchMatchHistories(riotPuuid, 'RANKED_FLEX_SR'),
    ])

    const matchInfos = soloMatchInfos.concat(flexMatchInfos)

    await Promise.all(
      matchInfos.map((matchInfo) => this.matchHistoryRepo.create(matchInfo)),
    )

    return this.matchHistoryRepo.read(riotPuuid)
  }

  private async getSummonerId(riotPuuid: string) {
    const summonerProfile = await this.getSummonerProfile(riotPuuid)
    return summonerProfile.summonerId
  }

  private async fetchSummonerProfile(riotPuuid: string) {
    const [accountInfo, summonerInfo] = await Promise.all([
      this.riotService.fetchAccountByPuuid(riotPuuid),
      this.riotService.fetchSummoner(riotPuuid),
    ])

    return {
      riotPuuid,
      gameName: accountInfo.gameName,
      tagLine: accountInfo.tagLine,
      summonerId: summonerInfo.id,
      summonerLevel: summonerInfo.summonerLevel,
      profileIconId: summonerInfo.profileIconId,
    }
  }

  private async fetchRankStats(summonerId: string) {
    const leagueEntries = await this.riotService.fetchLeagueEntry(summonerId)

    const soloRank = leagueEntries.find(
      (entry) => entry.queueType === 'RANKED_SOLO_5x5',
    )
    const flexRank = leagueEntries.find(
      (entry) => entry.queueType === 'RANKED_FLEX_SR',
    )

    return {
      summonerId,
      RANKED_SOLO_5x5: soloRank
        ? {
            leagueId: soloRank.leagueId,
            tier: soloRank.tier,
            rank: soloRank.rank,
            leaguePoints: soloRank.leaguePoints,
            wins: soloRank.wins,
            losses: soloRank.losses,
          }
        : null,
      RANKED_FLEX_SR: flexRank
        ? {
            leagueId: flexRank.leagueId,
            tier: flexRank.tier,
            rank: flexRank.rank,
            leaguePoints: flexRank.leaguePoints,
            wins: flexRank.wins,
            losses: flexRank.losses,
          }
        : null,
    }
  }

  private async fetchMatchHistories(riotPuuid: string, queue: QueueType) {
    const matchIds = await this.riotService.fetchMatches(riotPuuid, {
      startTime: Math.round(
        (Date.parse(new Date(new Date().setHours(0, 0, 0, 0)).toString()) -
          MAXIMUM_DURATION) /
          1000,
      ),
      queue: Queue[queue],
    })

    const result = await Promise.all(
      matchIds.map(async (matchId) => {
        const alreadyExist = await this.matchHistoryRepo.readOne(
          riotPuuid,
          matchId,
        )

        if (alreadyExist) {
          return
        }

        const rawMatchData = await this.riotService.fetchMatch(matchId)

        return {
          ...this.extractMatchInfo(riotPuuid, rawMatchData),
          gameType: queue,
        }
      }),
    )

    return result.filter((matchInfo) => matchInfo)
  }

  private extractMatchInfo(riotPuuid: string, rawMatchData: MatchDto) {
    const {
      info: { participants, gameEndTimestamp },
      metadata: { matchId },
    } = rawMatchData

    const targetPlayer = participants.find(
      (participant) => participant.puuid === riotPuuid,
    )

    const {
      assists,
      championName,
      deaths,
      individualPosition,
      kills,
      teamPosition,
      totalMinionsKilled,
      visionScore,
      win,
    } = targetPlayer

    const position = (teamPosition || individualPosition) as Lane

    return {
      riotPuuid,
      matchId,
      assists,
      championName,
      deaths,
      gameEndTimestamp,
      kills,
      position,
      totalMinionsKilled,
      visionScore,
      win,
    }
  }
}
