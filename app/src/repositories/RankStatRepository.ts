import { Service } from 'typedi'
import RankStat, { IRankStat } from '../models/RankStat'

export interface RankStatParams {
  summonerId: string
  RANKED_SOLO_5x5: {
    leagueId: string
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  } | null
  RANKED_FLEX_SR: {
    leagueId: string
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  } | null
}

@Service()
export class RankStatRepository {
  public create({
    summonerId,
    RANKED_SOLO_5x5,
    RANKED_FLEX_SR,
  }: RankStatParams): Promise<IRankStat> {
    return RankStat.create({
      _id: summonerId,
      RANKED_SOLO_5x5,
      RANKED_FLEX_SR,
      lastUpdatedAt: Date.now(),
    })
  }

  public read(summonerId: string): Promise<IRankStat> {
    return RankStat.findById(summonerId).lean()
  }

  public update({
    summonerId,
    RANKED_SOLO_5x5,
    RANKED_FLEX_SR,
  }: RankStatParams): Promise<IRankStat> {
    return RankStat.findByIdAndUpdate(
      summonerId,
      {
        RANKED_SOLO_5x5,
        RANKED_FLEX_SR,
        lastUpdatedAt: Date.now(),
      },
      { new: true, upsert: true },
    )
  }
}
