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
      throw new BaseError(
        400,
        '이 채널의 워치리스트에 이미 등록된 소환사입니다.',
      )
    }

    if (channel.watchList.length >= 3) {
      throw new BaseError(
        400,
        '이 채널의 워치리스트는 이미 꽉 찼습니다.\n최대 3개까지 등록하실 수 있습니다.)',
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
      throw new BaseError(400, '이 채널의 워치리스트는 비어있습니다.')
    }

    if (!channel.watchList.includes(riotPuuidToRemove)) {
      throw new BaseError(400, '이 채널의 워치리스트에 해당 소환사가 없습니다.')
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
}

export const channelService = new ChannelService()

export default ChannelService
