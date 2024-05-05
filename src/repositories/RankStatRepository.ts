import DBError from '../errors/DBError'
import RankStat, { IRankStat } from '../models/rankStat.model'

class RankStatRepository {
  async create({
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
      const createdRankStat = await RankStat.create({
        _id: summonerId,
        RANKED_SOLO_5x5,
        RANKED_FLEX_SR,
        lastUpdatedAt: Date.now(),
      })

      return createdRankStat
    } catch (error) {
      throw new DBError(500, '랭크 정보 생성 중 오류가 발생했습니다.')
    }
  }

  async read(summonerId: string): Promise<IRankStat> {
    try {
      const rankStat = await RankStat.findById(summonerId).lean()

      return rankStat
    } catch (error) {
      throw new DBError(500, '랭크 정보 조회 중 오류가 발생했습니다.')
    }
  }

  async update(
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
      throw new DBError(500, '랭크 정보 갱신 중 오류가 발생했습니다.')
    }
  }

  async delete(summonerId: string): Promise<void> {
    try {
      await RankStat.findByIdAndDelete(summonerId)
    } catch (error) {
      throw new DBError(500, '랭크 정보 삭제 중 오류가 발생했습니다.')
    }
  }
}

export const rankStatRepository = new RankStatRepository()

export default RankStatRepository
