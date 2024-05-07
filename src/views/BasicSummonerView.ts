import { ColorResolvable, EmbedBuilder } from 'discord.js'
import { PATCH_VERSION } from '../constants/leagueoflegends'
import { tierInfos } from '../constants/rank'
import { IRankStat } from '../models/rankStat.model'
import { elapsedTime } from '../utils/elapsedTime'
import SummonerView, { SummonerViewDto } from './SummonerView'

class BasicSummonerView implements SummonerView {
  createEmbed(dto: SummonerViewDto) {
    const { summoner, rankStat } = dto
    const { gameName, tagLine, summonerLevel, profileIconId, lastUpdatedAt } =
      summoner

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { RANKED_SOLO_5x5, RANKED_FLEX_SR } = rankStat
    const soloTier = RANKED_SOLO_5x5?.tier || 'UNRANKED'
    const flexTier = RANKED_FLEX_SR?.tier || 'UNRANKED'

    const tier =
      soloTier !== 'UNRANKED'
        ? soloTier
        : flexTier !== 'UNRANKED'
          ? flexTier
          : 'UNRANKED'

    const color = tierInfos.find((info) => info.id === tier)
      ?.color as ColorResolvable

    return new EmbedBuilder()
      .setColor(color)
      .setTitle(`${gameName}#${tagLine} (Lv. ${summonerLevel})`)
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
  }

  private buildRankField(
    rankStat: IRankStat['RANKED_SOLO_5x5'] | IRankStat['RANKED_FLEX_SR'],
  ) {
    if (!rankStat) return '정보 없음'

    const { tier, rank, leaguePoints, wins, losses } = rankStat

    return tier && tier !== 'UNRANKED'
      ? `\`${tierInfos.find((elem) => elem.id === tier).name} ${rank}\` - ${leaguePoints}LP\n${wins}승 ${losses}패 (${Math.round(
          (wins / (wins + losses)) * 100,
        )}%)`
      : '정보 없음'
  }
}

export const basicSummonerView = new BasicSummonerView()

export default BasicSummonerView
