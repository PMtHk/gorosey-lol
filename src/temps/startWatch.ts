import cron from 'node-cron'
import { Client, TextChannel } from 'discord.js'
import { IChannel } from '../models/channel.model'
import { channelService } from '../services/ChannelService'
import { matchHistoryService } from '../services/MatchHistoryService'
import { rankStatService } from '../services/RankStatService'
import { summonerService } from '../services/SummonerService'
import { detailedSummonerView } from '../views/DetailedSummonerView'

export const startWatch = (client: Client<boolean>) => {
  cron.schedule(
    '0 1,10,18,23 * * *',
    async () => {
      try {
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
