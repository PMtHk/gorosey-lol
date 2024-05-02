import { Client, TextChannel } from 'discord.js'
import cron from 'node-cron'
import Channel from '../models/channel.model'
import { dbConnect } from '../mongoose'

import { findRankStat } from './db/rankStat/find'
import { findSummoner } from './db/summoner/find'
import SearchEmbedBuilder, {
  SearchEmbedBuilderData,
} from './SearchEmbedBuilder'
import { fetchRankMatchesDto } from './riot/fetchMatchesDto'
import { fetchMatchHistory } from './riot/fetchMatchDto'

// 21시 00시 자동으로 워치리스트 조회 후 발송

export const startWatch = (client: Client<boolean>) => {
  cron.schedule(
    '0 1,21,23 * * *',
    async () => {
      try {
        await dbConnect()

        const channels = await Channel.find({}).lean()

        for await (const channel of channels) {
          const { textChannel, watchList } = channel
          const targetChannel = (await client.channels.fetch(
            textChannel,
          )) as TextChannel

          const embedsToSend = []

          for await (const riotPuuid of watchList) {
            const summonerInfo = await findSummoner(riotPuuid)
            const {
              summonerId,
              gameName,
              tagLine,
              profileIconId,
              summonerLevel,
              lastUpdatedAt,
            } = summonerInfo

            const rankStatInfo = await findRankStat(summonerId)
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const { RANKED_SOLO_5x5, RANKED_FLEX_SR } = rankStatInfo

            const matchIds = await fetchRankMatchesDto(riotPuuid)

            const matchHistories = []

            for await (const matchId of matchIds) {
              const matchHistory = await fetchMatchHistory(matchId, riotPuuid)
              matchHistories.push(matchHistory)
            }

            const data: SearchEmbedBuilderData = {
              gameName,
              tagLine,
              profileIconId,
              summonerLevel,
              lastUpdatedAt,
              RANKED_SOLO_5x5,
              RANKED_FLEX_SR,
              matchHistories,
            }

            embedsToSend.push(SearchEmbedBuilder(data))
          }

          targetChannel.send({
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

// 1232210102862221325
