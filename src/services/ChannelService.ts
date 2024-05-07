import BaseError from '../errors/BaseError'
import { IChannel } from '../models/channel.model'
import { channelRepository } from '../repositories/ChannelRepository'

class ChannelService {
  public async getWatchList(guildId: string): Promise<Array<string>> {
    const channel: IChannel = await channelRepository.read(guildId)

    if (!channel) {
      return []
    }

    return channel.watchList
  }

  public async addToWatchList(
    guildId: string,
    textChannelId: string,
    riotPuuidToAdd: string,
  ): Promise<Array<string>> {
    const channel: IChannel = await channelRepository.read(guildId)

    if (!channel) {
      await channelRepository.create(guildId, textChannelId)

      const updatedChannel: IChannel = await channelRepository.update(guildId, [
        riotPuuidToAdd,
      ])

      return updatedChannel.watchList
    }

    if (channel.watchList.includes(riotPuuidToAdd)) {
      throw new BaseError(400, '이미 등록된 소환사에요!')
    }

    if (channel.watchList.length >= 3) {
      throw new BaseError(
        400,
        '워치리스트가 가득찼어요! 최대 3명까지 등록할 수 있어요.',
      )
    }

    const newWatchList = [...channel.watchList, riotPuuidToAdd]

    const updatedChannel = await channelRepository.update(guildId, newWatchList)

    return updatedChannel.watchList
  }

  public async removeFromWatchList(
    guildId: string,
    riotPuuidToRemove: string,
  ): Promise<Array<string>> {
    const channel: IChannel = await channelRepository.read(guildId)

    if (!channel || channel.watchList.length === 0) {
      throw new BaseError(400, '워치리스트가 비어있어요!')
    }

    if (!channel.watchList.includes(riotPuuidToRemove)) {
      throw new BaseError(400, '잘못된 접근이에요!')
    }

    const newWatchList = channel.watchList.filter(
      (watchedPuuid) => watchedPuuid !== riotPuuidToRemove,
    )

    const updatedChannel: IChannel = await channelRepository.update(
      guildId,
      newWatchList,
    )

    return updatedChannel.watchList
  }

  public async getAllChannels(): Promise<Array<IChannel>> {
    const channels = await channelRepository.findAll()

    return channels
  }
}

export const channelService = new ChannelService()

export default ChannelService
