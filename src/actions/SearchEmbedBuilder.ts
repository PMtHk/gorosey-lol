import { ColorResolvable, EmbedBuilder } from 'discord.js'
import { Lane } from '../types/lol.types'
import { champions } from '../constants/champions'
import { tierInfos } from '../constants/rank'
import { elapsedTime } from '../utils/elapsedTime'

export interface SearchEmbedBuilderData {
  gameName: string
  tagLine: string
  profileIconId: number
  summonerLevel: number
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
    summonerLevel,
    lastUpdatedAt,
    RANKED_SOLO_5x5: solo,
    RANKED_FLEX_SR: flex,
    matchHistories,
  } = data

  // match history
  const matchCount = matchHistories.length
  let wins = 0

  let winAndTypeField = ''
  let championField = ''
  let kdaAndTime = ''

  matchHistories.forEach((match) => {
    if (match.win) wins++

    const win = match.win ? '✅ 승' : '❌ 패'
    const type =
      match.gameType === 'RANKED_SOLO_5x5' ? '개인/2인랭크' : '자유랭크'

    const kda = `${match.kills}/${match.deaths}/${match.assists}`

    winAndTypeField += `${win}  ${type}\n`
    championField += `${champions[match.championName]}\n`
    kdaAndTime += `${kda.padEnd(12, '\u00A0')}${elapsedTime(match.gameEndTimestamp)}\n`
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
    .setTitle(`${gameName}#${tagLine} (Lv.${summonerLevel})`)
    .setURL(
      `https://lol.ps/summoner/${encodeURIComponent(`${gameName}_${tagLine}`)}?region=kr`,
    )
    .setDescription('랭크 정보와 24시간 내의 랭크 게임 플레이를 조회합니다.')
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
      text: `${gameName}#${tagLine} | ${lastUpdatedAt.toLocaleDateString(
        'ko-KR',
        {
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        },
      )}에 갱신됨`,
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
        value: kdaAndTime,
        inline: true,
      },
    )
  }

  return embed
}
