import { Guild } from 'discord.js'
import Container from 'typedi'

import { ChannelService } from '../services/ChannelService'

export async function guildDeleteListener(guild: Guild) {
  const channelService = Container.get(ChannelService)

  try {
    await channelService.deleteChannel(guild.id)
  } catch (error) {
    console.error('[GuildDelete] ', error)
  }
}
