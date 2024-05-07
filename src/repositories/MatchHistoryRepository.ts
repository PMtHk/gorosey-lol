import DBError from '../errors/DBError'
import MatchHistory, { IMatchHistory } from '../models/matchHistory.model'
import { dbConnect } from '../mongoose'

class MatchHistoryRepository {
  public async create(matchHistory: {
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
      await dbConnect()

      const createdMatchHistory = await MatchHistory.create(matchHistory)

      return createdMatchHistory
    } catch (error) {
      throw new DBError('매치 히스토리 생성 중 오류가 발생했습니다.')
    }
  }

  public async read(riotPuuid: string): Promise<IMatchHistory[]> {
    try {
      await dbConnect()

      const matchHistories = await MatchHistory.find({
        riotPuuid,
        gameEndTimestamp: { $gte: Date.now() - 1000 * 60 * 60 * 24 * 3 },
      })
        .limit(15)
        .sort({ gameEndTimestamp: -1 })
        .lean()

      return matchHistories
    } catch (error) {
      throw new DBError('매치 히스토리 조회 중 오류가 발생했습니다.')
    }
  }

  public async readOne(
    riotPuuid: string,
    matchId: string,
  ): Promise<IMatchHistory> {
    try {
      await dbConnect()

      const matchHistory = await MatchHistory.findOne({
        riotPuuid,
        matchId,
      }).lean()

      return matchHistory
    } catch (error) {
      throw new DBError('매치 히스토리 조회 중 오류가 발생했습니다.')
    }
  }
}

export const matchHistoryRepository = new MatchHistoryRepository()

export default MatchHistoryRepository
