import DBError from '../errors/DBError'
import MatchHistory, { IMatchHistory } from '../models/matchHistory.model'

class MatchHistoryRepository {
  async create(matchHistory: {
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
  }): Promise<IMatchHistory> {
    try {
      const createdMatchHistory = await MatchHistory.create(matchHistory)

      return createdMatchHistory
    } catch (error) {
      throw new DBError(500, '매치 히스토리 생성 중 오류가 발생했습니다.')
    }
  }

  async read(riotPuuid: string, start?: number): Promise<IMatchHistory[]> {
    try {
      const matchHistories = await MatchHistory.find({
        riotPuuid,
        ...(start && { gameEndTimestamp: { $gte: start } }),
      })
        .sort({ gameEndTimestamp: -1 })
        .lean()

      return matchHistories
    } catch (error) {
      console.log(error)
      throw new DBError(500, '매치 히스토리 조회 중 오류가 발생했습니다.')
    }
  }

  async readOne(riotPuuid: string, matchId: string): Promise<IMatchHistory> {
    try {
      const matchHistory = await MatchHistory.findOne({
        riotPuuid,
        matchId,
      }).lean()

      return matchHistory
    } catch (error) {
      throw new DBError(500, '매치 히스토리 조회 중 오류가 발생했습니다.')
    }
  }
}

export const matchHistoryRepository = new MatchHistoryRepository()

export default MatchHistoryRepository
