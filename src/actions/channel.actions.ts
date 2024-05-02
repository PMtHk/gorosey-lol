import DBError from '../errors/DBError'
import Channel from '../models/channel.model'
import { dbConnect } from '../mongoose'

export const createChannel = async (guildId: string, channelId: string) => {
  try {
    await dbConnect()

    await Channel.create({
      _id: guildId,
      textChannel: channelId,
      watchList: [],
    })
  } catch (error) {
    throw new DBError(500, 'createChannel error')
  }
}

export const findChannel = async (guildId: string) => {
  try {
    await dbConnect()

    const channel = await Channel.findById(guildId).lean()

    return channel
  } catch (error) {
    throw new DBError(500, 'findChannel error')
  }
}

export const updateChannel = async (
  guildId: string,
  newWatchList: string[],
  newChannelId?: string,
) => {
  try {
    await dbConnect()

    await Channel.findByIdAndUpdate(guildId, {
      ...(newChannelId && { textChannel: newChannelId }),
      watchList: newWatchList,
      lastUpdatedAt: Date.now(),
    })
  } catch (error) {
    throw new DBError(500, 'updateChannel error')
  }
}
