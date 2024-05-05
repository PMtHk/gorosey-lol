import { ColorResolvable, EmbedBuilder } from 'discord.js'
import { ISummoner } from '../models/summoner.model'
import { dbConnect } from '../mongoose'
import { summonerRepository } from '../repositories/SummonerRepository'
import { elapsedTime } from '../utils/elapsedTime'
import RankStatService from './RankStatService'
import { riotService } from './RiotService'
import { PATCH_VERSION } from '../constants/leagueoflegends'
import { tierInfos } from '../constants/rank'
import MatchHistoryService from './MatchHistoryService'
import { champions } from '../constants/champions'

export default class SummonerService {
  riotPuuid: string

  summoner: ISummoner

  rankStatService: RankStatService

  matchHistoryService: MatchHistoryService

  constructor(riotPuuid: string) {
    this.riotPuuid = riotPuuid
  }

  async init(): Promise<void> {
    await dbConnect()

    this.summoner = await summonerRepository.read(this.riotPuuid)

    if (!this.summoner) {
      // create new summoner
      const accountInfo = await riotService.fetchAccountByPuuid(this.riotPuuid)
      const summonerInfo = await riotService.fetchSummoner(this.riotPuuid)

      this.summoner = await summonerRepository.create({
        riotPuuid: this.riotPuuid,
        gameName: accountInfo.gameName,
        tagLine: accountInfo.tagLine,
        summonerId: summonerInfo.id,
        summonerLevel: summonerInfo.summonerLevel,
        profileIconId: summonerInfo.profileIconId,
      })
    }

    this.rankStatService = new RankStatService(this.summoner.summonerId)
    await this.rankStatService.init()

    this.matchHistoryService = new MatchHistoryService(this.riotPuuid)
    await this.matchHistoryService.read()
  }

  public async refresh(): Promise<void> {
    const accountInfo = await riotService.fetchAccountByPuuid(this.riotPuuid)
    const summonerInfo = await riotService.fetchSummoner(this.riotPuuid)

    this.summoner = await summonerRepository.update(this.riotPuuid, {
      gameName: accountInfo.gameName,
      tagLine: accountInfo.tagLine,
      summonerId: summonerInfo.id,
      summonerLevel: summonerInfo.summonerLevel,
      profileIconId: summonerInfo.profileIconId,
    })

    await this.rankStatService.refresh()
    await this.matchHistoryService.refresh()
  }

  buildEmbed(): EmbedBuilder {
    const { gameName, tagLine, summonerLevel, profileIconId, lastUpdatedAt } =
      this.summoner

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { RANKED_SOLO_5x5, RANKED_FLEX_SR } = this.rankStatService.rankStat

    const tier =
      RANKED_SOLO_5x5 &&
      RANKED_SOLO_5x5.tier &&
      RANKED_SOLO_5x5.tier !== 'UNRANKED'
        ? RANKED_SOLO_5x5.tier
        : RANKED_FLEX_SR &&
            RANKED_FLEX_SR.tier &&
            RANKED_FLEX_SR.tier !== 'UNRANKED'
          ? RANKED_FLEX_SR.tier
          : 'UNRANKED'

    const color = tierInfos.find((i) => i.id === tier)?.color as ColorResolvable

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${gameName} ${tagLine} (Lv.${summonerLevel})`)
      .setURL(
        `https://lol.ps/summoner/${encodeURIComponent(`${gameName}_${tagLine}`)}?region=kr`,
      )
      .setThumbnail(
        `http://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/img/profileicon/${profileIconId}.png`,
      )
      .setDescription('랭크게임 정보를 조회합니다.')
      .addFields(
        { name: '\n', value: '\n' },
        {
          name: '개인/2인랭크',
          value: this.buildRankField(RANKED_SOLO_5x5),
          inline: true,
        },
        {
          name: '자유랭크',
          value: this.buildRankField(RANKED_FLEX_SR),
          inline: true,
        },
        { name: '\n', value: '\n' },
      )
      .setFooter({
        text: `${gameName}#${tagLine} | ${elapsedTime(+lastUpdatedAt)}에 갱신됨`,
        iconURL: `http://ddragon.leagueoflegends.com/cdn/${PATCH_VERSION}/img/profileicon/${profileIconId}.png`,
      })

    if (this.matchHistoryService.matchHistories.length > 0) {
      let WIN_AND_TYPE = ''
      let CHAMPION = ''
      let KDA_AND_TIME = ''

      let rankedGameCount = 0
      let rankedGameWinCount = 0

      this.matchHistoryService.matchHistories.forEach((match) => {
        rankedGameCount++

        if (match.win) rankedGameWinCount++

        const KDA = `${match.kills}/${match.deaths}/${match.assists}`

        WIN_AND_TYPE += `${match.win ? '✅ 승' : '❌ 패'} ${match.gameType}\n`
        CHAMPION += `${champions[match.championName]}\n`
        KDA_AND_TIME += `${KDA.padEnd(12, '\u00A0')} (${elapsedTime(match.gameEndTimestamp)})\n`
      })

      if (rankedGameCount > 0) {
        embed.addFields({
          name: '랭크 게임 전적',
          value: `\`${rankedGameCount}전 ${rankedGameWinCount}승 ${rankedGameCount - rankedGameWinCount}패\` (${Math.round(
            (rankedGameWinCount / rankedGameCount) * 100,
          )}%)`,
        })
      }

      embed.addFields(
        {
          name: '최근 전적',
          value: WIN_AND_TYPE,
          inline: true,
        },
        {
          name: '\u200B',
          value: CHAMPION,
          inline: true,
        },
        {
          name: '\u200B',
          value: KDA_AND_TIME,
          inline: true,
        },
      )
    }

    return embed
  }

  private buildRankField(
    rank: {
      tier: string
      rank: string
      leaguePoints: number
      wins: number
      losses: number
    } | null,
  ) {
    return rank && rank.tier && rank.tier !== 'UNRANKED'
      ? `\`${tierInfos.find((elem) => elem.id === rank.tier).name} ${rank.rank}\` - ${rank.leaguePoints}LP\n${rank.wins}승 ${rank.losses}패 (${Math.round(
          (rank.wins / (rank.wins + rank.losses)) * 100,
        )}%)`
      : '정보 없음'
  }
}
