import Channel, { IChannel } from '../models/channel.model'
import DBError from '../errors/DBError'

class ChannelRepository {
  async create(guildId: string, channelId: string): Promise<IChannel> {
    try {
      const createdChannel = await Channel.create({
        _id: guildId,
        textChannel: channelId,
        watchList: [],
      })

      return createdChannel
    } catch (error) {
      throw new DBError(500, '새로운 채널 생성 중 오류가 발생했습니다.')
    }
  }

  async find(guildId: string): Promise<IChannel> {
    try {
      const channel = await Channel.findById(guildId).lean()

      return channel
    } catch (error) {
      throw new DBError(500, '채널 조회 중 오류가 발생했습니다.')
    }
  }

  async update(
    guildId: string,
    newWatchList: string[],
    newTextChannel?: string,
  ): Promise<IChannel> {
    try {
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
      throw new DBError(500, '채널 갱신 중 오류가 발생했습니다.')
    }
  }

  async delete(guildId: string): Promise<void> {
    try {
      await Channel.findByIdAndDelete(guildId)
    } catch (error) {
      throw new DBError(500, '채널 삭제 중 오류가 발생했습니다.')
    }
  }

  async getWatchList(guildId: string): Promise<string[]> {
    try {
      const channel = await this.find(guildId)

      return channel.watchList
    } catch (error) {
      throw new DBError(
        500,
        '감시 중인 소환사 목록 조회 중 오류가 발생했습니다.',
      )
    }
  }
}

export const channelRepository = new ChannelRepository()

export default ChannelRepository
