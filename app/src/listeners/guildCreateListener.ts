import { Channel, ChannelType, Guild } from 'discord.js'
import Container from 'typedi'

import { ChannelService } from '../services'

export async function guildCreateListener(guild: Guild) {
  const channelService = Container.get(ChannelService)

  try {
    const isTextChannel = (channel: Channel) =>
      channel.type === ChannelType.GuildText

    const defaultTextChannel = guild.channels.cache.find(isTextChannel)
    if (!defaultTextChannel) {
      console.error('해당 채널에 텍스트 채널이 존재하지 않습니다.')
      await guild.leave()
      return
    }

    await Promise.all([
      channelService.createChannel(guild.id, defaultTextChannel.id),
      channelService.createSchedules([{ guildId: guild.id, time: '0' }]),
    ])
  } catch (error) {
    console.error('[GuildCreate] ', error)
  }
}
