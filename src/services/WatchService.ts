import { Client, TextChannel } from 'discord.js'
import { Service } from 'typedi'
import cron from 'node-cron'

import { ChannelService } from './ChannelService'
import { LoLService } from './LoLService'
import { detailedSummonerView } from '../views'
import { ISchedulePopulated } from '../models'

interface ChannelInfo {
  textChannel: string
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
      '0 * * * *', // every hour
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
    try {
      const { textChannel, watchList } = channelInfo
      if (!this.isValidChannelInfo(channelInfo)) {
        return
      }

      const targetTextChannel = await this.fetchTextChannel(textChannel)
      const targetTextChannelName = targetTextChannel.name

      this.log(
        `Sending watchlist to ${targetTextChannelName} | ${watchList.length} summoners`,
      )

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
    } catch (error) {
      this.handleErrors(error)
    }
  }

  private async fetchTextChannel(textChannelId: string) {
    return (await this.client.channels.fetch(textChannelId)) as TextChannel
  }

  private isValidChannelInfo({ textChannel, watchList }: ChannelInfo) {
    return textChannel && watchList.length > 0
  }

  private extractChannelInfo(schedule: ISchedulePopulated) {
    return {
      textChannel: schedule.guildId?.textChannel,
      watchList: schedule.guildId?.watchList,
    }
  }

  private handleErrors(error: Error) {
    console.error(error)
  }

  private log(message: string) {
    const koTime = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
    })

    console.log(`[${koTime}] ${message}`)
  }
}
