import { IMatchHistory } from '../models/matchHistory.model'
import { matchHistoryRepository } from '../repositories/MatchHistoryRepository'
import { Lane } from '../types/lol.types'
import { MatchDto } from '../types/riot.dtos'
import { riotService } from './RiotService'

export default class MatchHistoryService {
  riotPuuid: string

  matchHistories: Array<IMatchHistory>

  constructor(riotPuuid: string) {
    this.riotPuuid = riotPuuid
  }

  // 하루동안의 매치 히스토리를 불러와 DB에 저장
  async refresh(): Promise<void> {
    const startTime = Date.parse(
      new Date(new Date().setHours(0, 0, 0, 0)).toString(),
    )

    // 개인/2인 랭크(420)게임 갱신
    const MATCHES_420 = await riotService.fetchMatches(this.riotPuuid, {
      startTime: startTime / 1000,
      // epochTime이지만, millisecond 단위가 아닌 second 단위로 변환해야 함
      queue: 420,
      count: 100,
    })

    for await (const matchId of MATCHES_420) {
      const alreadyExist = await matchHistoryRepository.readOne(
        this.riotPuuid,
        matchId,
      )

      if (alreadyExist) continue

      const matchDto = await riotService.fetchMatchData(matchId)
      const createdHistory = await matchHistoryRepository.create({
        riotPuuid: this.riotPuuid,
        matchId,
        ...this.extractInfos(matchDto),
        gameType: 'RANKED_SOLO_5x5',
      })

      this.matchHistories.push(createdHistory)
    }

    // 자유 랭크(440)게임 갱신
    const MATCHES_440 = await riotService.fetchMatches(this.riotPuuid, {
      startTime,
      queue: 440,
      count: 100,
    })

    for await (const matchId of MATCHES_440) {
      const alreadyExist = await matchHistoryRepository.readOne(
        this.riotPuuid,
        matchId,
      )

      if (alreadyExist) continue

      const matchDto = await riotService.fetchMatchData(matchId)
      const createdHistory = await matchHistoryRepository.create({
        riotPuuid: this.riotPuuid,
        matchId,
        ...this.extractInfos(matchDto),
        gameType: 'RANKED_FLEX_SR',
      })

      this.matchHistories.push(createdHistory)
    }

    this.matchHistories.sort((a, b) => b.gameEndTimestamp - a.gameEndTimestamp)
  }

  // 하루동안의 매치 히스토리를 불러옴
  async read(): Promise<void> {
    const matchHistories = await matchHistoryRepository.read(
      this.riotPuuid,
      Date.parse(new Date(new Date().setHours(0, 0, 0, 0)).toString()),
    )

    this.matchHistories = matchHistories
  }

  private extractInfos(matchDto: MatchDto): {
    assists: number
    championName: string
    deaths: number
    gameEndTimestamp: number
    gameType: string
    kills: number
    position: Lane
    totalMinionsKilled: number
    visionScore: number
    win: boolean
  } {
    const {
      info: { participants, gameEndTimestamp, gameType },
    } = matchDto

    const targetPlayer = participants.find(
      (participant) => participant.puuid === this.riotPuuid,
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
      assists,
      championName,
      deaths,
      gameEndTimestamp,
      gameType,
      kills,
      position,
      totalMinionsKilled,
      visionScore,
      win,
    }
  }
}
