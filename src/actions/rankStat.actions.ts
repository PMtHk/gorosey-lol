import DBError from '../errors/DBError'
import RankStat from '../models/rankStat.model'
import { dbConnect } from '../mongoose'

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

export const findRankStat = async (summonerId: string) => {
  try {
    await dbConnect()

    const rankStat = await RankStat.findById(summonerId).lean()

    return rankStat
  } catch (error) {
    throw new DBError(500, 'findRankStat error')
  }
}

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
