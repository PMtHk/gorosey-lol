import { Guild } from 'discord.js'
import ChannelService from '../services/ChannelService'
import Container from 'typedi'
import ScheduleService from '../services/schedule.service'

export default async function guildDeleteListener(guild: Guild) {
  try {
    const { id: guildId } = guild

    const channelService = Container.get(ChannelService)
    const scheduleService = Container.get(ScheduleService)

    await channelService.deleteChannel(guildId)
    await scheduleService.deleteSchedules(guildId)
  } catch (error) {
    console.log('guildDeleteListener error: ', error)
  }
}
