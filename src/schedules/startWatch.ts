import { Client, TextChannel } from 'discord.js'
import cron from 'node-cron'
import Container from 'typedi'

import MatchHistoryService from '../services/MatchHistoryService'
import RankStatService from '../services/RankStatService'
import SummonerService from '../services/SummonerService'
import ScheduleService from '../services/schedule.service'

import { detailedSummonerView } from '../views/DetailedSummonerView'
import { dbConnect } from '../mongoose'
import { ISchedulePopulated } from '../models/schedule.model'

const extractTextChannelIdAndWatchList = (schedule: ISchedulePopulated) => ({
  textChannel: schedule.guildId?.textChannel,
  watchList: schedule.guildId?.watchList,
})

export const startWatch = (client: Client) => {
  cron.schedule(
    '0 * * * *', // every hour
    async (now) => {
      let guildCounter = 0
      let summonerCounter = 0

      const summonerService = Container.get(SummonerService)
      const rankStatService = Container.get(RankStatService)
      const matchHistoryService = Container.get(MatchHistoryService)
      const scheduleService = Container.get(ScheduleService)

      const fetchSummonerDetails = async (riotPuuid: string) => {
        const summoner = await summonerService.refresh(riotPuuid)
        const [rankStat, matchHistories] = await Promise.all([
          rankStatService.refresh(summoner.summonerId),
          matchHistoryService.refresh(riotPuuid),
        ])

        return { summoner, rankStat, matchHistories }
      }

      const createEmbeds = (watchList: string[]) =>
        Promise.all(
          watchList.map(async (riotPuuid) => {
            const details = await fetchSummonerDetails(riotPuuid)
            return detailedSummonerView.createEmbed(details)
          }),
        )

      try {
        const schedules = await scheduleService.getSchedules(
          new Date(now).getHours().toString(),
        )

        const channelInfos = schedules.map(extractTextChannelIdAndWatchList)

        for (const channelInfo of channelInfos) {
          guildCounter += 1

          try {
            const { textChannel, watchList } = channelInfo
            if (!textChannel || !watchList || watchList.length === 0) {
              continue
            }

            summonerCounter += watchList.length

            const targetTextChannel = (await client.channels.fetch(
              textChannel,
            )) as TextChannel

            await targetTextChannel.send({
              embeds: await createEmbeds(watchList),
            })

            const { guild, name: channelName } = targetTextChannel

            console.info(
              `[${new Date().toLocaleString()}] ${guild.name}|${channelName}|${watchList.length}-summoner`,
            )
          } catch (error) {
            console.error('channel error: ', error)
          }
        }

        console.info(
          `[${new Date().toLocaleString()}] ${guildCounter}-guild|${summonerCounter}-summoner`,
        )
      } catch (error) {
        console.error('cron error: ', error)
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Seoul',
    },
  )
}
