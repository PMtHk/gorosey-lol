import DBError from '../../../errors/DBError'
import Channel from '../../../models/channel.model'
import { dbConnect } from '../../../mongoose'

export const createChannel = async (guildId: string, channelId: string) => {
  try {
    await dbConnect()

    await Channel.create({
      _id: guildId,
      channelId,
      watchList: [],
    })
  } catch (error) {
    throw new DBError(500, 'createChannel error')
  }
}
