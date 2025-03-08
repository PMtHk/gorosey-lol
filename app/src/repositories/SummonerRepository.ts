import { Service } from 'typedi'
import Summoner, { ISummoner } from '../models/Summoner'

export interface CreateSummonerParams {
  riotPuuid: string
  gameName: string
  tagLine: string
  summonerId: string
  summonerLevel: number
  profileIconId: number
}

export interface UpdateSummonerParams {
  riotPuuid: string
  gameName: string
  tagLine: string
  summonerId: string
  summonerLevel: number
  profileIconId: number
}

@Service()
export class SummonerRepository {
  public create({
    riotPuuid,
    gameName,
    tagLine,
    summonerId,
    summonerLevel,
    profileIconId,
  }: CreateSummonerParams): Promise<ISummoner> {
    return Summoner.create({
      _id: riotPuuid,
      gameName,
      tagLine,
      summonerId,
      summonerLevel,
      profileIconId,
      lastUpdatedAt: Date.now(),
    })
  }

  public read(riotPuuid: string): Promise<ISummoner> {
    return Summoner.findById(riotPuuid).lean()
  }

  public update({
    riotPuuid,
    gameName,
    tagLine,
    summonerId,
    summonerLevel,
    profileIconId,
  }: UpdateSummonerParams): Promise<ISummoner> {
    return Summoner.findByIdAndUpdate(
      riotPuuid,
      {
        gameName,
        tagLine,
        summonerId,
        summonerLevel,
        profileIconId,
        lastUpdatedAt: Date.now(),
      },
      { new: true, upsert: true },
    )
  }

  public upsert({
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
    return Summoner.findByIdAndUpdate(
      riotPuuid,
      {
        gameName,
        tagLine,
        summonerId,
        summonerLevel,
        profileIconId,
        lastUpdatedAt: Date.now(),
      },
      { new: true, upsert: true },
    )
  }
}
