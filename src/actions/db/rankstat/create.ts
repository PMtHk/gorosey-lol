import DBError from '../../../errors/DBError'
import RankStat from '../../../models/rankStat.model'
import { dbConnect } from '../../../mongoose'

interface CreateRankStatInput {
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

export const createRankStat = async ({
  summonerId,
  RANKED_SOLO_5x5,
  RANKED_FLEX_SR,
}: CreateRankStatInput) => {
  try {
    await dbConnect()

    await RankStat.create({
      _id: summonerId,
      RANKED_SOLO_5x5,
      RANKED_FLEX_SR,
      lastUpdatedAt: Date.now(),
    })
  } catch (error) {
    throw new DBError(500, 'createRankStat error')
  }
}
