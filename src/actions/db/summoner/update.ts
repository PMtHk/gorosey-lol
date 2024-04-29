import DBError from '../../../errors/DB.error'
import Summoner from '../../../models/summoner.model'
import { dbConnect } from '../../../mongoose'

interface UpdateSumonnerInput {
  riotPuuid: string
  gameName: string
  tagLine: string
  summonerId: string
  summonerLevel: number
  profileIconId: number
}

export const updateSummoner = async ({
  riotPuuid,
  gameName,
  tagLine,
  summonerId,
  summonerLevel,
  profileIconId,
}: UpdateSumonnerInput) => {
  try {
    await dbConnect()

    await Summoner.findByIdAndUpdate(riotPuuid, {
      gameName,
      tagLine,
      summonerId,
      summonerLevel,
      profileIconId,
      lastUpdatedAt: Date.now(),
    })
  } catch (error) {
    throw new DBError(500, 'updateSummoner error')
  }
}
