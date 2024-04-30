import DBError from '../../../errors/DBError'
import Channel from '../../../models/channel.model'
import { dbConnect } from '../../../mongoose'

export const updateChannel = async (
  guildId: string,
  newWatchList: string[],
) => {
  try {
    await dbConnect()

    await Channel.findByIdAndUpdate(guildId, {
      watchList: newWatchList,
      lastUpdatedAt: Date.now(),
    })
  } catch (error) {
    throw new DBError(500, 'updateChannel error')
  }
}
