import { Service } from 'typedi'
import { DatabaseError } from '../errors/DatabaseError'
import Summoner, { ISummoner } from '../models/summoner.model'
import { dbConnect } from '../mongoose'

@Service()
export default class SummonerRepository {
  public async create({
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
      await dbConnect()

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
      throw new DatabaseError(
        'SummonerRepository.create() error: ' + error.message,
      )
    }
  }

  public async read(riotPuuid: string): Promise<ISummoner> {
    try {
      await dbConnect()

      const summoner = await Summoner.findById(riotPuuid).lean()
      return summoner
    } catch (error) {
      throw new DatabaseError(
        'SummonerRepository.read() error: ' + error.message,
      )
    }
  }

  public async update({
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
      await dbConnect()

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
      throw new DatabaseError(
        'SummonerRepository.update() error: ' + error.message,
      )
    }
  }
}
