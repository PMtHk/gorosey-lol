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
    const startTime = Math.round(new Date().setHours(0, 0, 0, 0) / 1000)

    const MATCHES_420 = await riotService.fetchMatches(this.riotPuuid, {
      startTime,
      queue: 25, // 개인/2인 랭크 게임
      count: 100,
    })

    const MATCHES_440 = await riotService.fetchMatches(this.riotPuuid, {
      startTime,
      queue: 420, // 솔로 랭크 게임
      count: 100,
    })

    const matchIds = [...MATCHES_420, ...MATCHES_440]

    for await (const matchId of matchIds) {
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
      })

      this.matchHistories.push(createdHistory)
    }
  }

  // 하루동안의 매치 히스토리를 불러옴
  async read(): Promise<void> {
    const matchHistories = await matchHistoryRepository.read(this.riotPuuid)

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
