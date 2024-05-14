import { Client, TextChannel } from 'discord.js'
import cron from 'node-cron'
import Container from 'typedi'
import { IChannel } from '../models/channel.model'
import ChannelService from '../services/ChannelService'
import MatchHistoryService from '../services/MatchHistoryService'
import RankStatService from '../services/RankStatService'
import SummonerService from '../services/SummonerService'
import { detailedSummonerView } from '../views/DetailedSummonerView'

export const startWatch = (client: Client<boolean>) => {
  cron.schedule(
    '55 12,23 * * *',
    async () => {
      try {
        // define services
        const channelService = Container.get(ChannelService)
        const summonerService = Container.get(SummonerService)
        const rankStatService = Container.get(RankStatService)
        const matchHistoryService = Container.get(MatchHistoryService)

        const channels: Array<IChannel> = await channelService.getAllChannels()

        for await (const channel of channels) {
          const { textChannel, watchList } = channel

          if (!watchList || watchList.length === 0) {
            continue
          }

          const targetTextChannel = (await client.channels.fetch(
            textChannel,
          )) as TextChannel

          const embedsToSend = []

          for await (const riotPuuid of watchList) {
            const summoner = await summonerService.refresh(riotPuuid)
            const summonerId = summoner.summonerId
            const rankStat = await rankStatService.refresh(summonerId)
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
