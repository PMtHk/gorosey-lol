import { Service } from 'typedi'
import Channel, { IChannel } from '../models/Channel'

@Service()
export class ChannelRepository {
  public create(guildId: string, channelId: string): Promise<IChannel> {
    return Channel.create({
      _id: guildId,
      textChannel: channelId,
      watchList: [],
    })
  }

  public read(guildId: string): Promise<IChannel> {
    return Channel.findById(guildId).lean()
  }

  public update(
    guildId: string,
    newWatchList?: string[],
    newTextChannel?: string,
  ): Promise<IChannel> {
    return Channel.findByIdAndUpdate(
      guildId,
      {
        ...(newTextChannel && { textChannel: newTextChannel }),
        ...(newWatchList && { watchList: newWatchList }),
        lastUpdatedAt: Date.now(),
      },
      { new: true },
    )
  }

  public findAll(): Promise<IChannel[]> {
    return Channel.find({}).lean()
  }

  public delete(guildId: string): Promise<IChannel> {
    return Channel.findByIdAndDelete(guildId)
  }
}
