import DBError from '../../../errors/DBError'
import Summoner from '../../../models/summoner.model'
import { dbConnect } from '../../../mongoose'

interface CreateSummonerInput {
  riotPuuid: string
  gameName: string
  tagLine: string
  summonerId: string
  summonerLevel: number
  profileIconId: number
}

export const createSummoner = async ({
  riotPuuid,
  gameName,
  tagLine,
  summonerId,
  summonerLevel,
  profileIconId,
}: CreateSummonerInput) => {
  try {
    await dbConnect()

    await Summoner.create({
      _id: riotPuuid,
      gameName,
      tagLine,
      summonerId,
      summonerLevel,
      profileIconId,
      lastUpdatedAt: Date.now(),
    })
  } catch (error) {
    throw new DBError(500, 'createSummoner error')
  }
}
