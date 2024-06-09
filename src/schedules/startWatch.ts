import { Client, TextChannel } from 'discord.js'
import cron from 'node-cron'
import Container from 'typedi'

import MatchHistoryService from '../services/MatchHistoryService'
import RankStatService from '../services/RankStatService'
import SummonerService from '../services/SummonerService'
import ScheduleService from '../services/schedule.service'

import { detailedSummonerView } from '../views/DetailedSummonerView'
import { dbConnect } from '../mongoose'

export const startWatch = (client: Client<boolean>) => {
  cron.schedule(
    '0 * * * *', // every hour
    async (now) => {
      let counter = 0
      try {
        // define services
        const summonerService = Container.get(SummonerService)
        const rankStatService = Container.get(RankStatService)
        const matchHistoryService = Container.get(MatchHistoryService)
        const scheduleService = Container.get(ScheduleService)

        // db connection (sechdule 서비스 생성 후 제거할 예정)
        await dbConnect()

        const hour = new Date(now).getHours()

        const schedules = await scheduleService.getSchedules(hour.toString())

        const channelInfos = schedules.map((schedule) => {
          return {
            textChannel: schedule.guildId.textChannel,
            watchList: schedule.guildId.watchList,
          }
        })

        for await (const channelInfo of channelInfos) {
          const { textChannel, watchList } = channelInfo

          if (!watchList || watchList.length === 0) continue
          counter += watchList.length

          const targetTextChannel = (await client.channels.fetch(
            textChannel,
          )) as TextChannel

          const {
            guild: { name: guildName },
            name: channelName,
          } = targetTextChannel

          console.log(
            `[INFO][${new Date().toLocaleString()}] ${guildName}|${channelName} request ${watchList.length} refreshment`,
          )

          const embedsToSend = []

          for await (const riotPuuid of watchList) {
            const summoner = await summonerService.refresh(riotPuuid)
            const rankStat = await rankStatService.refresh(summoner.summonerId)
            const matchHistories = await matchHistoryService.refresh(riotPuuid)

            embedsToSend.push(
              detailedSummonerView.createEmbed({
                summoner,
                rankStat,
                matchHistories,
              }),
            )
          }

          await targetTextChannel.send({
            embeds: embedsToSend,
          })

          console.log(
            `[INFO][${new Date().toLocaleString()}] total ${counter} refreshed`,
          )
        }
      } catch (error) {
        console.log(error)
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Seoul',
    },
  )
}
