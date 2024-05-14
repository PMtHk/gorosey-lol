import { Service } from 'typedi'
import { DatabaseError } from '../errors/DatabaseError'
import Channel, { IChannel } from '../models/channel.model'
import { dbConnect } from '../mongoose'

@Service()
export default class ChannelRepository {
  public async create(guildId: string, channelId: string): Promise<IChannel> {
    try {
      await dbConnect()

      const createdChannel = await Channel.create({
        _id: guildId,
        textChannel: channelId,
        watchList: [],
      })

      return createdChannel
    } catch (error) {
      throw new DatabaseError(
        'ChannelRepository.create() error: ' + error.message,
      )
    }
  }

  public async read(guildId: string): Promise<IChannel> {
    try {
      await dbConnect()

      const channel = await Channel.findById(guildId).lean()

      return channel
    } catch (error) {
      throw new DatabaseError(
        'ChannelRepository.read() error: ' + error.message,
      )
    }
  }

  public async update(
    guildId: string,
    newWatchList: string[],
    newTextChannel?: string,
  ): Promise<IChannel> {
    try {
      await dbConnect()

      const updatedChannel = await Channel.findByIdAndUpdate(
        guildId,
        {
          ...(newTextChannel && { textChannel: newTextChannel }),
          watchList: newWatchList,
          lastUpdatedAt: Date.now(),
        },
        { new: true },
      )

      return updatedChannel
    } catch (error) {
      throw new DatabaseError(
        'ChannelRepository.update() error: ' + error.message,
      )
    }
  }

  public async findAll(): Promise<IChannel[]> {
    try {
      await dbConnect()

      const channels = await Channel.find({}).lean()

      return channels
    } catch (error) {
      throw new DatabaseError(
        'ChannelRepository.findAll() error: ' + error.message,
      )
    }
  }
}
