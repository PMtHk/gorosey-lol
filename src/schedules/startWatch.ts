import { Client, DiscordAPIError, TextChannel } from 'discord.js'
import cron from 'node-cron'
import Container from 'typedi'
import MatchHistoryService from '../services/MatchHistoryService'
import RankStatService from '../services/RankStatService'
import SummonerService from '../services/SummonerService'
import ScheduleService from '../services/schedule.service'
import { detailedSummonerView } from '../views/DetailedSummonerView'
import { ISchedulePopulated } from '../models/schedule.model'

const extractTextChannelIdAndWatchList = (schedule: ISchedulePopulated) => ({
  textChannel: schedule.guildId?.textChannel,
  watchList: schedule.guildId?.watchList,
})

export const startWatch = (client: Client) => {
  cron.schedule(
    '0 * * * *', // every hour
    async (now) => {
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

      const sendWatchList = async (channelInfo: {
        textChannel: string
        watchList: string[]
      }) => {
        try {
          const { textChannel, watchList } = channelInfo
          if (!textChannel || !watchList || watchList.length === 0) {
            return
          }

          const targetTextChannel = (await client.channels.fetch(
            textChannel,
          )) as TextChannel

          await targetTextChannel.send({
            embeds: await createEmbeds(watchList),
          })
        } catch (error) {
          const { code, message } = error as DiscordAPIError
          console.error(`[${code}] ${message}`)
          // TODO: 아래의 에러 코드 별 처리 필요
          // 10003: Unknown Channel
          // 50001: Missing Access
          // 50013: Missing Permissions
        }
      }

      try {
        const schedules = await scheduleService.getSchedules(
          new Date(now).getHours().toString(),
        )

        await Promise.all(
          schedules.map(extractTextChannelIdAndWatchList).map(sendWatchList),
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