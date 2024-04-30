import { ColorResolvable, EmbedBuilder } from 'discord.js'
import { Lane } from '../types/lol.types'
import { champions } from '../constants/champions'
import { tierInfos } from '../constants/rank'

export interface SearchEmbedBuilderData {
  gameName: string
  tagLine: string
  profileIconId: number
  lastUpdatedAt: Date
  matchHistories: {
    assists: number
    championName: string
    deaths: number
    gameEndTimestamp: number
    gameType: string
    kills: number
    position: Lane
    totalMinionsKilled: number
    win: boolean
    visionScore: number
  }[]
  RANKED_SOLO_5x5: {
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  }
  RANKED_FLEX_SR: {
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  }
}

export default function SearchEmbedBuilder(data: SearchEmbedBuilderData) {
  const {
    gameName,
    tagLine,
    profileIconId,
    lastUpdatedAt,
    RANKED_SOLO_5x5: solo,
    RANKED_FLEX_SR: flex,
    matchHistories,
  } = data

  // match history
  const matchCount = matchHistories.length
  let wins = 0
  let historyString = ''

  let winAndTypeField = ''
  let championField = ''
  let kdaAndScoreField = ''

  matchHistories.forEach((match) => {
    if (match.win) wins++

    const win = match.win ? '✅ 승' : '❌ 패'
    const type =
      match.gameType === 'RANKED_SOLO_5x5' ? '개인/2인랭크' : '자유랭크'

    const kda = `${match.kills}/${match.deaths}/${match.assists}`
    const score =
      match.deaths === 0
        ? 'Perfect'
        : ((match.kills + match.assists) / match.deaths).toFixed(1)

    historyString +=
      `${win}${type.padStart(4, '\u00A0')}` +
      `${champions[match.championName].padStart(12, '\u00A0')}${kda.padStart(18, '\u00A0')}  ${score.padStart(24, '\u00A0')} 평점 \n`

    winAndTypeField += `${win} ${type}\n`
    championField += `${champions[match.championName]}\n`
    kdaAndScoreField += `${kda.padEnd(12, '\u00A0')}${score}\n`
  })

  const SOLO =
    solo && solo.tier && solo.tier !== 'UNRANKED'
      ? `\`${solo.tier} ${solo.rank}\` - ${solo.leaguePoints}LP\n${solo.wins}승 ${solo.losses}패 (${Math.round(
          (solo.wins / (solo.wins + solo.losses)) * 100,
        )}%)`
      : '정보 없음'

  const FLEX =
    flex && flex.tier && flex.tier !== 'UNRANKED'
      ? `\`${flex.tier} ${flex.rank}\` - ${flex.leaguePoints}LP\n${flex.wins}승 ${flex.losses}패 (${Math.round(
          (flex.wins / (flex.wins + flex.losses)) * 100,
        )}%)`
      : '정보 없음'

  const tier =
    solo && solo.tier && solo.tier !== 'UNRANKED'
      ? solo.tier
      : flex && flex.tier && flex.tier !== 'UNRANKED'
        ? flex.tier
        : 'UNRANKED'

  const color = tierInfos.find((i) => i.id === tier)?.color as ColorResolvable

  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(`${gameName}#${tagLine}`)
    .setURL(
      `https://lol.ps/summoner/${encodeURIComponent(`${gameName}_${tagLine}`)}?region=kr`,
    )
    .setDescription('소환사의 랭크 지표와 24시간 내 랭크 전적을 조회합니다.')
    .setThumbnail(
      `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
    )
    .addFields(
      { name: '\n', value: '\n' },
      { name: '개인/2인랭크', value: SOLO, inline: true },
      { name: '자유랭크', value: FLEX, inline: true },
      { name: '\n', value: '\n' },
    )
    .addFields(
      {
        name: '최근 전적',
        value: `\`${matchCount}전 ${wins}승 ${matchCount - wins}패\`\n`,
      },
      { name: '\n', value: '\n' },
    )
    .setFooter({
      text: `최근 업데이트: ${lastUpdatedAt.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })}`,
      iconURL: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
    })

  if (matchCount > 0) {
    embed.addFields(
      {
        name: '대전 기록',
        value: winAndTypeField,
        inline: true,
      },
      {
        name: '\u200B',
        value: championField,
        inline: true,
      },
      {
        name: '\u200B',
        value: kdaAndScoreField,
        inline: true,
      },
    )
  }

  return embed
}
