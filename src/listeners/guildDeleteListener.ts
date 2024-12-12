import { Guild } from 'discord.js'
import ChannelService from '../services/ChannelService'
import Container from 'typedi'
import ScheduleService from '../services/schedule.service'

export async function guildDeleteListener(guild: Guild) {
  const channelService = Container.get(ChannelService)
  const scheduleService = Container.get(ScheduleService)

  try {
    await Promise.all([
      channelService.deleteChannel(guild.id),
      scheduleService.deleteSchedules(guild.id),
    ])
  } catch (error) {
    console.error('[GuildDelete] ', error)
  }
}
