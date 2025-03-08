import { Service } from 'typedi'
import MatchHistory, { IMatchHistory } from '../models/MatchHistory'

const MAXIMUM_DURATION = 1000 * 60 * 60 * 24 * 3 // 최대 조회 기간 = 3일
const MAXIMUM_COUNT = 10 // 최대 조회 개수 = 10개

interface CreateMatchHistoryParams {
  riotPuuid: string
  matchId: string
  assists: number
  championName: string
  deaths: number
  gameEndTimestamp: number
  gameType: string
  kills: number
  position: string
  totalMinionsKilled: number
  visionScore: number
  win: boolean
}

@Service()
export class MatchHistoryRepository {
  public create(
    matchHistory: CreateMatchHistoryParams,
  ): Promise<IMatchHistory> {
    return MatchHistory.create(matchHistory)
  }

  public read(riotPuuid: string): Promise<IMatchHistory[]> {
    return MatchHistory.find({
      riotPuuid,
      gameEndTimestamp: { $gte: Date.now() - MAXIMUM_DURATION },
    })
      .limit(MAXIMUM_COUNT)
      .sort({ gameEndTimestamp: -1 })
      .lean()
  }

  public readOne(riotPuuid: string, matchId: string): Promise<IMatchHistory> {
    return MatchHistory.findOne({
      riotPuuid,
      matchId,
    }).lean()
  }
}
