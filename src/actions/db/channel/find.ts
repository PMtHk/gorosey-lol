import DBError from '../../../errors/DBError'
import Channel from '../../../models/channel.model'
import { dbConnect } from '../../../mongoose'

export const findChannel = async (guildId: string) => {
  try {
    await dbConnect()

    const channel = await Channel.findById(guildId).lean()

    return channel
  } catch (error) {
    throw new DBError(500, 'findChannel error')
  }
}
