import { dbConnect } from '../mongoose'
import { summonerRepository } from '../repositories/SummonerRepository'
import { riotService } from './RiotService'

class SummonerService {
  public async read(riotPuuid: string) {
    await dbConnect()

    const summoner = await summonerRepository.read(riotPuuid)

    if (!summoner) {
      const fetchedSummonerInfo = await this.getRecentSummoner(riotPuuid)

      const createdSummoner =
        await summonerRepository.create(fetchedSummonerInfo)

      return createdSummoner
    }

    return summoner
  }

  public async refresh(riotPuuid: string) {
    const fetchedSummonerInfo = await this.getRecentSummoner(riotPuuid)
    const updatedSummoner = await summonerRepository.update(fetchedSummonerInfo)

    return updatedSummoner
  }

  private async getRecentSummoner(riotPuuid: string) {
    const { gameName, tagLine } =
      await riotService.fetchAccountByPuuid(riotPuuid)
    const {
      id: summonerId,
      summonerLevel,
      profileIconId,
    } = await riotService.fetchSummoner(riotPuuid)

    return {
      riotPuuid,
      gameName,
      tagLine,
      summonerId,
      summonerLevel,
      profileIconId,
    }
  }
}

export const summonerService = new SummonerService()

export default SummonerService
