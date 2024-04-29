import DBError from '../../../errors/DB.error'
import RankStat from '../../../models/rankstat.model'
import { dbConnect } from '../../../mongoose'

interface UpdateRankStatInput {
  summonerId: string
  RANKED_SOLO_5x5: {
    leagueId: string
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  }
  RANKED_FLEX_SR: {
    leagueId: string
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  }
}

export const updateRankStat = async ({
  summonerId,
  RANKED_SOLO_5x5,
  RANKED_FLEX_SR,
}: UpdateRankStatInput) => {
  try {
    await dbConnect()

    await RankStat.findByIdAndUpdate(summonerId, {
      RANKED_SOLO_5x5,
      RANKED_FLEX_SR,
      lastUpdatedAt: Date.now(),
    })
  } catch (error) {
    throw new DBError(500, 'updateRankStat error')
  }
}
