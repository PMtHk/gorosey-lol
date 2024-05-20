import { ChannelType, Guild } from 'discord.js'
import ChannelRepository from '../repositories/ChannelRepository'
import ChannelService from '../services/ChannelService'

export default async function guildCreateListener(guild: Guild) {
  try {
    const { id: guildId } = guild

    const textChannels = guild.channels.cache
      .filter((channel) => channel.type === ChannelType.GuildText)
      .map((elem) => {
        return {
          name: elem.name,
          id: elem.id,
        }
      })

    const channelRepository = new ChannelRepository()
    const channelService = new ChannelService(channelRepository)

    await channelService.createChannel(guildId, textChannels[0].id)
  } catch (error) {
    console.log('guildCreateListener error: ', error)
  }
}
