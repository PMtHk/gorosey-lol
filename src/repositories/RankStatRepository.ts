import { DatabaseError } from '../errors/DatabaseError'
import RankStat, { IRankStat } from '../models/rankStat.model'
import { dbConnect } from '../mongoose'

class RankStatRepository {
  public async create({
    summonerId,
    RANKED_SOLO_5x5,
    RANKED_FLEX_SR,
  }: {
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
  }): Promise<IRankStat> {
    try {
      await dbConnect()

      const createdRankStat = await RankStat.create({
        _id: summonerId,
        RANKED_SOLO_5x5,
        RANKED_FLEX_SR,
        lastUpdatedAt: Date.now(),
      })

      return createdRankStat
    } catch (error) {
      throw new DatabaseError(
        'RankStatRepository.create() error: ' + error.message,
      )
    }
  }

  public async read(summonerId: string): Promise<IRankStat> {
    try {
      await dbConnect()

      const rankStat = await RankStat.findById(summonerId).lean()

      return rankStat
    } catch (error) {
      throw new DatabaseError(
        'RankStatRepository.read() error: ' + error.message,
      )
    }
  }

  public async update(
    summonerId: string,
    {
      RANKED_SOLO_5x5,
      RANKED_FLEX_SR,
    }: {
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
    },
  ): Promise<IRankStat> {
    try {
      await dbConnect()

      const updatedRankStat = await RankStat.findByIdAndUpdate(
        summonerId,
        {
          RANKED_SOLO_5x5,
          RANKED_FLEX_SR,
          lastUpdatedAt: Date.now(),
        },
        { new: true },
      )

      return updatedRankStat
    } catch (error) {
      throw new DatabaseError(
        'RankStatRepository.update() error: ' + error.message,
      )
    }
  }

  public async delete(summonerId: string): Promise<void> {
    try {
      await dbConnect()

      const deletedRankStat = await RankStat.findByIdAndDelete(summonerId)

      return deletedRankStat
    } catch (error) {
      throw new DatabaseError(
        'RankStatRepository.delete() error: ' + error.message,
      )
    }
  }
}

export const rankStatRepository = new RankStatRepository()

export default RankStatRepository
