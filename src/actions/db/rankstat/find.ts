import DBError from '../../../errors/DBError'
import RankStat from '../../../models/rankStat.model'
import { dbConnect } from '../../../mongoose'

export const findRankStat = async (summonerId: string) => {
  try {
    await dbConnect()

    const rankStat = await RankStat.findById(summonerId).lean()

    return rankStat
  } catch (error) {
    throw new DBError(500, 'findRankStat error')
  }
}
