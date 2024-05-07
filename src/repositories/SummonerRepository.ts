import DBError from '../errors/DBError'
import Summoner, { ISummoner } from '../models/summoner.model'

class SummonerRepository {
  async create({
    riotPuuid,
    gameName,
    tagLine,
    summonerId,
    summonerLevel,
    profileIconId,
  }: {
    riotPuuid: string
    gameName: string
    tagLine: string
    summonerId: string
    summonerLevel: number
    profileIconId: number
  }): Promise<ISummoner> {
    try {
      const createdSummoner = await Summoner.create({
        _id: riotPuuid,
        gameName,
        tagLine,
        summonerId,
        summonerLevel,
        profileIconId,
        lastUpdatedAt: Date.now(),
      })
      return createdSummoner
    } catch (error) {
      throw new DBError(500, '새로운 소환사 생성 중 오류가 발생했습니다.')
    }
  }

  async read(riotPuuid: string): Promise<ISummoner> {
    try {
      const summoner = await Summoner.findById(riotPuuid).lean()
      return summoner
    } catch (error) {
      throw new DBError(500, '소환사 조회 중 오류가 발생했습니다.')
    }
  }

  async update({
    riotPuuid,
    gameName,
    tagLine,
    summonerId,
    summonerLevel,
    profileIconId,
  }: {
    riotPuuid: string
    gameName: string
    tagLine: string
    summonerId: string
    summonerLevel: number
    profileIconId: number
  }): Promise<ISummoner> {
    try {
      const updatedSummoner = await Summoner.findByIdAndUpdate(
        riotPuuid,
        {
          gameName,
          tagLine,
          summonerId,
          summonerLevel,
          profileIconId,
          lastUpdatedAt: Date.now(),
        },
        { new: true },
      )
      return updatedSummoner
    } catch (error) {
      throw new DBError(500, '소환사 갱신 중 오류가 발생했습니다.')
    }
  }

  async delete(riotPuuid: string): Promise<void> {
    try {
      await Summoner.findByIdAndDelete(riotPuuid)
    } catch (error) {
      throw new DBError(500, '소환사 삭제 중 오류가 발생했습니다.')
    }
  }
}

export const summonerRepository = new SummonerRepository()

export default SummonerRepository
