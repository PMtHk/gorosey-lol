import DBError from '../../../errors/DB.error'
import Summoner from '../../../models/summoner.model'
import { dbConnect } from '../../../mongoose'

export const findSummoner = async (riotPuuid: string) => {
  try {
    await dbConnect()

    const summoner = await Summoner.findById(riotPuuid).lean()

    return summoner
  } catch (error) {
    throw new DBError(500, 'findSummoner error')
  }
}
