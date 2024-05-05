import { EmbedBuilder } from 'discord.js'
import { IRankStat } from '../models/rankStat.model'
import { ISummoner } from '../models/summoner.model'
import { dbConnect } from '../mongoose'
import { rankStatRepository } from '../repositories/RankStatRepository'
import { summonerRepository } from '../repositories/SummonerRepository'
import { elapsedTime } from '../utils/elapsedTime'
import { riotService } from './RiotService'

export default class SummonerService {
  riotPuuid: string

  summoner: ISummoner

  rankStat: IRankStat

  constructor(riotPuuid: string) {
    this.riotPuuid = riotPuuid
  }

  async init(): Promise<void> {
    await dbConnect()

    this.summoner = await summonerRepository.read(this.riotPuuid)
    this.rankStat = await rankStatRepository.read(this.summoner.summonerId)

    if (!this.summoner) {
      // create new summoner
      const accountInfo = await riotService.fetchAccount(this.riotPuuid)
      const summonerInfo = await riotService.fetchSummoner(this.riotPuuid)

      this.summoner = await summonerRepository.create({
        riotPuuid: this.riotPuuid,
        gameName: accountInfo.gameName,
        tagLine: accountInfo.tagLine,
        summonerId: summonerInfo.id,
        summonerLevel: summonerInfo.summonerLevel,
        profileIconId: summonerInfo.profileIconId,
      })

      const leagueEntryInfo = await riotService.fetchLeagueEntry(
        this.summoner.summonerId,
      )

      const SOLO = leagueEntryInfo.find(
        (entry) => entry.queueType === 'RANKED_SOLO_5x5',
      )

      const FLEX = leagueEntryInfo.find(
        (entry) => entry.queueType === 'RANKED_FLEX_SR',
      )

      await rankStatRepository.create({
        summonerId: this.summoner.summonerId,
        RANKED_SOLO_5x5: SOLO
          ? {
              leagueId: SOLO.leagueId,
              tier: SOLO.tier,
              rank: SOLO.rank,
              leaguePoints: SOLO.leaguePoints,
              wins: SOLO.wins,
              losses: SOLO.losses,
            }
          : null,
        RANKED_FLEX_SR: FLEX
          ? {
              leagueId: FLEX.leagueId,
              tier: FLEX.tier,
              rank: FLEX.rank,
              leaguePoints: FLEX.leaguePoints,
              wins: FLEX.wins,
              losses: FLEX.losses,
            }
          : null,
      })
    }
  }

  public async refresh(): Promise<void> {
    const accountInfo = await riotService.fetchAccount(
      this.summoner.gameName,
      this.summoner.tagLine,
    )
    const summonerInfo = await riotService.fetchSummoner(this.riotPuuid)

    this.summoner = await summonerRepository.update(this.riotPuuid, {
      gameName: accountInfo.gameName,
      tagLine: accountInfo.tagLine,
      summonerId: summonerInfo.id,
      summonerLevel: summonerInfo.summonerLevel,
      profileIconId: summonerInfo.profileIconId,
    })
  }

  public buildEmbed(): EmbedBuilder {
    const { gameName, tagLine, summonerLevel, profileIconId, lastUpdatedAt } =
      this.summoner

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { RANKED_SOLO_5x5, RANKED_FLEX_SR } = this.rankStat

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`${gameName} ${tagLine} (Lv.${summonerLevel})`)
      .setURL(
        `https://lol.ps/summoner/${encodeURIComponent(`${gameName}_${tagLine}`)}?region=kr`,
      )
      .setThumbnail(
        `http://ddragon.leagueoflegends.com/cdn/11.16.1/img/profileicon/${profileIconId}.png`,
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
        text: `${gameName} ${tagLine} | ${elapsedTime(+lastUpdatedAt)}에 갱신됨`,
        iconURL: `http://ddragon.leagueoflegends.com/cdn/11.16.1/img/profileicon/${profileIconId}.png`,
      })
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
      ? `\`${rank.tier} ${rank.rank}\` - ${rank.leaguePoints}LP\n${rank.wins}승 ${rank.losses}패 (${Math.round(
          (rank.wins / (rank.wins + rank.losses)) * 100,
        )}%)`
      : '정보 없음'
  }
}
