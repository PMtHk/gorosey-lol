import { Channel, ChannelType, Guild } from 'discord.js'
import ChannelService from '../services/ChannelService'
import Container from 'typedi'
import ScheduleService from '../services/schedule.service'

export async function guildCreateListener(guild: Guild) {
  const channelService = Container.get(ChannelService)
  const scheduleService = Container.get(ScheduleService)

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
      scheduleService.createSchedules([{ guildId: guild.id, time: '0' }]),
    ])
  } catch (error) {
    console.error('[GuildCreate] ', error)
  }
}
