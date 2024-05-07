import Channel, { IChannel } from '../models/channel.model'
import DBError from '../errors/DBError'
import { dbConnect } from '../mongoose'

class ChannelRepository {
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
      throw new DBError('새로운 채널 생성 중 오류가 발생했습니다.')
    }
  }

  public async read(guildId: string): Promise<IChannel> {
    try {
      await dbConnect()

      const channel = await Channel.findById(guildId).lean()

      return channel
    } catch (error) {
      throw new DBError('채널 조회 중 오류가 발생했습니다.')
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
      throw new DBError('채널 갱신 중 오류가 발생했습니다.')
    }
  }

  public async delete(guildId: string): Promise<void> {
    try {
      await dbConnect()

      await Channel.findByIdAndDelete(guildId)
    } catch (error) {
      throw new DBError('채널 삭제 중 오류가 발생했습니다.')
    }
  }

  public async findAll(): Promise<IChannel[]> {
    try {
      await dbConnect()

      const channels = await Channel.find({}).lean()

      return channels
    } catch (error) {
      throw new DBError('채널 목록 조회 중 오류가 발생했습니다.')
    }
  }
}

export const channelRepository = new ChannelRepository()

export default ChannelRepository
