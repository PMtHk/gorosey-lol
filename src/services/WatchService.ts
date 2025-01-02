import { Client, DiscordAPIError, TextChannel } from 'discord.js'
import { Service } from 'typedi'
import cron from 'node-cron'

import { ChannelService } from './ChannelService'
import { LoLService } from './LoLService'
import { detailedSummonerView } from '../views'
import { ISchedulePopulated } from '../models'

interface ChannelInfo {
  guildId: string
  textChannelId: string
  watchList: string[]
}

@Service()
export class WatchService {
  private client: Client

  constructor(
    private readonly channelService: ChannelService,
    private readonly lolService: LoLService,
  ) {}

  public setClient(client: Client) {
    this.client = client
  }

  public startWatch(): void {
    if (!this.client) {
      // TODO: 에러 커스터마이징
      throw new Error('Client is not set')
    }

    cron.schedule(
      '25 * * * *', // every hour
      async (now) => {
        this.log("WatchService's cron job started")
        await this.processSchedules(now)
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul',
      },
    )
  }

  private async processSchedules(now: Date | 'manual' | 'init') {
    try {
      const currentHour = new Date(now).getHours().toString()
      const schedules = await this.channelService.getSchedules(currentHour)

      await Promise.all(
        schedules
          .map((schedule) => this.extractChannelInfo(schedule))
          .map((channelInfo) => this.sendWatchList(channelInfo)),
      )
    } catch (error) {
      console.error('cron error: ', error)
    }
  }

  private async sendWatchList(channelInfo: ChannelInfo) {
    const { guildId, textChannelId, watchList } = channelInfo
    if (!this.isValidChannelInfo(channelInfo)) {
      return
    }

    try {
      const targetTextChannel = await this.fetchTextChannel(textChannelId)
      const targetTextChannelName = targetTextChannel.name

      const embeds = await Promise.all(
        watchList.map(async (riotPuuid) => {
          const details =
            await this.lolService.refreshSummonerDetails(riotPuuid)

          return detailedSummonerView.createEmbed({
            summoner: details.refreshedSummonerProfile,
            rankStat: details.refreshedRankStats,
            matchHistories: details.refreshedMatchHistories,
          })
        }),
      )

      await targetTextChannel.send({ embeds })

      this.log(
        `send watchlist to ${targetTextChannelName} | ${watchList.length} summoners`,
      )
    } catch (error) {
      await this.handleErrors(error, guildId)
    }
  }

  private async fetchTextChannel(textChannelId: string) {
    return (await this.client.channels.fetch(textChannelId)) as TextChannel
  }

  private isValidChannelInfo({ textChannelId, watchList }: ChannelInfo) {
    return textChannelId && watchList.length > 0
  }

  private extractChannelInfo(schedule: ISchedulePopulated) {
    return {
      guildId: schedule.guildId?._id,
      textChannelId: schedule.guildId?.textChannel,
      watchList: schedule.guildId?.watchList,
    }
  }

  private handleErrors(error: Error, guildId: string) {
    const discordError = error as DiscordAPIError
    const PERMISSION_ERROR_CODES = [
      10003, // Unknown channel
      50001, // Missing Access
      50013, // Missing Permissions
    ]

    if (PERMISSION_ERROR_CODES.includes(discordError.code as number)) {
      return this.channelService.deleteChannel(guildId)
    }

    console.error('sendWatchList error: ', error)
  }

  private log(message: string) {
    const koTime = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    })

    console.log(`[${koTime}] ${message}`)
  }
}
