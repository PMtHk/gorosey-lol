import { Guild } from 'discord.js'
import ChannelService from '../services/ChannelService'
import ChannelRepository from '../repositories/ChannelRepository'

export default async function guildDeleteListener(guild: Guild) {
  try {
    const { id: guildId } = guild

    const channelRepository = new ChannelRepository()
    const channelService = new ChannelService(channelRepository)

    await channelService.deleteChannel(guildId)
  } catch (error) {
    console.log('guildDeleteListener error: ', error)
  }
}
