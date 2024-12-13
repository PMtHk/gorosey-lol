import { Client, DiscordAPIError, TextChannel } from 'discord.js'
import cron from 'node-cron'
import Container from 'typedi'
import MatchHistoryService from '../services/MatchHistoryService'
import RankStatService from '../services/RankStatService'
import SummonerService from '../services/SummonerService'
import ScheduleService from '../services/schedule.service'
import { detailedSummonerView } from '../views/DetailedSummonerView'
import { ISchedulePopulated } from '../models/schedule.model'

interface ChannelInfo {
  textChannel: string
  watchList: string[]
}

const isValidChannelInfo = ({ textChannel, watchList }: ChannelInfo) =>
  Boolean(textChannel && watchList && watchList.length > 0)

const extractChannelInfo = (schedule: ISchedulePopulated) => ({
  textChannel: schedule.guildId?.textChannel,
  watchList: schedule.guildId?.watchList,
})

const handleDiscordError = (error: DiscordAPIError): void => {
  const { code, message } = error
  console.error(`[${code}] ${message}`)
  // TODO: 아래의 에러 코드 별 처리 필요
  // 10003: Unknown Channel
  // 50001: Missing Access
  // 50013: Missing Permissions
}

const fetchTextChannel = async (client: Client, textChannelId: string) =>
  (await client.channels.fetch(textChannelId)) as TextChannel

const fetchSummonerDetails = async (riotPuuid: string) => {
  const summonerService = Container.get(SummonerService)
  const rankStatService = Container.get(RankStatService)
  const matchHistoryService = Container.get(MatchHistoryService)

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

const sendWatchList = async (client: Client, channelInfo: ChannelInfo) => {
  try {
    const { textChannel, watchList } = channelInfo
    if (!isValidChannelInfo(channelInfo)) {
      return
    }

    const targetTextChannel = await fetchTextChannel(client, textChannel)

    await targetTextChannel.send({
      embeds: await createEmbeds(watchList),
    })
  } catch (error) {
    handleDiscordError(error as DiscordAPIError)
  }
}

const processSchedules = async (
  client: Client,
  now: Date | 'manual' | 'init',
) => {
  try {
    const scheduleService = Container.get(ScheduleService)

    const currentHour = new Date(now).getHours().toString()
    const schedules = await scheduleService.getSchedules(currentHour)

    await Promise.all(
      schedules
        .map(extractChannelInfo)
        .map((channelInfo) => sendWatchList(client, channelInfo)),
    )
  } catch (error) {
    console.error('cron error: ', error)
  }
}

export const startWatch = (client: Client) => {
  cron.schedule(
    '0 * * * *', // every hour
    async (now) => {
      await processSchedules(client, now)
    },
    {
      scheduled: true,
      timezone: 'Asia/Seoul',
    },
  )
}
