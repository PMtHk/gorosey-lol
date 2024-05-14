import { Service } from 'typedi'
import SummonerRepository from '../repositories/SummonerRepository'
import RiotService from './RiotService'

@Service()
export default class SummonerService {
  constructor(
    private summonerRepository: SummonerRepository,
    private riotService: RiotService,
  ) {}

  public async read(riotPuuid: string) {
    const summoner = await this.summonerRepository.read(riotPuuid)

    if (!summoner) {
      const fetchedSummonerInfo = await this.getRecentSummoner(riotPuuid)

      const createdSummoner =
        await this.summonerRepository.create(fetchedSummonerInfo)

      return createdSummoner
    }

    return summoner
  }

  public async refresh(riotPuuid: string) {
    const fetchedSummonerInfo = await this.getRecentSummoner(riotPuuid)
    const updatedSummoner =
      await this.summonerRepository.update(fetchedSummonerInfo)

    return updatedSummoner
  }

  private async getRecentSummoner(riotPuuid: string) {
    const { gameName, tagLine } =
      await this.riotService.fetchAccountByPuuid(riotPuuid)

    const {
      id: summonerId,
      summonerLevel,
      profileIconId,
    } = await this.riotService.fetchSummoner(riotPuuid)

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
