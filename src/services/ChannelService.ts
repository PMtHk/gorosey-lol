import { Service } from 'typedi'
import { BadRequestError } from '../errors/BadReqeustError'
import { IChannel } from '../models/channel.model'
import ChannelRepository from '../repositories/ChannelRepository'

@Service()
export default class ChannelService {
  constructor(private channelRepository: ChannelRepository) {}

  public async getWatchList(guildId: string): Promise<Array<string>> {
    const channel: IChannel = await this.channelRepository.read(guildId)

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
    const channel: IChannel = await this.channelRepository.read(guildId)

    if (!channel) {
      await this.channelRepository.create(guildId, textChannelId)

      const updatedChannel: IChannel = await this.channelRepository.update(
        guildId,
        [riotPuuidToAdd],
      )

      return updatedChannel.watchList
    }

    if (channel.watchList.includes(riotPuuidToAdd))
      throw new BadRequestError(
        'ChannelService.addToWatchList() error: riotPuuidToAdd already exists in watchList.',
        '이미 워치리스트에 등록되어 있는 소환사입니다.',
      )

    if (channel.watchList.length >= 3)
      throw new BadRequestError(
        'ChannelService.addToWatchList() error: watchList is full.',
        '워치리스트가 가득 찼습니다. 최대 3명의 소환사를 등록할 수 있습니다.',
      )

    const newWatchList = [...channel.watchList, riotPuuidToAdd]
    const updatedChannel = await this.channelRepository.update(
      guildId,
      newWatchList,
    )

    return updatedChannel.watchList
  }

  public async removeFromWatchList(
    guildId: string,
    riotPuuidToRemove: string,
  ): Promise<Array<string>> {
    const channel: IChannel = await this.channelRepository.read(guildId)

    if (!channel || channel.watchList.length === 0)
      throw new BadRequestError(
        'ChannelService.removeFromWatchList() error: watchList is empty.',
        '워치리스트가 비어있습니다.',
      )

    if (!channel.watchList.includes(riotPuuidToRemove))
      throw new BadRequestError(
        'ChannelService.removeFromWatchList() error: riotPuuidToRemove does not exist in watchList.',
        '워치리스트에 등록되어 있지 않은 소환사입니다.',
      )

    const newWatchList = channel.watchList.filter(
      (watchedPuuid) => watchedPuuid !== riotPuuidToRemove,
    )
    const updatedChannel: IChannel = await this.channelRepository.update(
      guildId,
      newWatchList,
    )

    return updatedChannel.watchList
  }

  public async getAllChannels(): Promise<Array<IChannel>> {
    const channels = await this.channelRepository.findAll()

    return channels
  }

  public async createChannel(
    guildId: string,
    textChannelId: string,
  ): Promise<void> {
    const channel = await this.channelRepository.read(guildId)

    if (channel)
      throw new BadRequestError(
        'ChannelService.createChannel() error: channel already exists.',
        '이미 채널이 존재합니다.',
      )

    await this.channelRepository.create(guildId, textChannelId)
  }

  public async deleteChannel(guildId: string): Promise<void> {
    const deletedChannel = await this.channelRepository.delete(guildId)

    if (!deletedChannel)
      throw new BadRequestError(
        'ChannelService.deleteChannel() error: channel does not exist.',
        '해당 채널이 존재하지 않습니다.',
      )
  }

  public async updateTextChannel(
    guildId: string,
    textChannelId: string,
  ): Promise<void> {
    await this.channelRepository.update(guildId, undefined, textChannelId)
  }
}
