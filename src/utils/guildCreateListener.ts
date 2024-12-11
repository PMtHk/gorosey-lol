import { ChannelType, Guild } from 'discord.js'
import ChannelService from '../services/ChannelService'
import Container from 'typedi'
import ScheduleService from '../services/schedule.service'

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

    const channelService = Container.get(ChannelService)
    const scheduleService = Container.get(ScheduleService)

    await channelService.createChannel(guildId, textChannels[0].id)
    await scheduleService.createSchedules([{ guildId, time: '0' }])
  } catch (error) {
    console.error('guildCreateListener error: ', error)
  }
}
