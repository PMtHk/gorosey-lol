import { EmbedBuilder } from 'discord.js'
import { Lane } from '../types/lol.types'
import { champions } from '../constants/champions'

export interface CustomEmbedData {
  gameName: string
  tagLine: string
  profileIconId: number
  lastUpdatedAt: Date
  matchHistories: {
    type: string
    championName: string
    kills: number
    deaths: number
    assists: number
    win: boolean
    position: Lane
    totalMinionsKilled: number
    visionScore: number
    gameEndTimestamp: number
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

export default function CustomEmbedBuilder(data: CustomEmbedData) {
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

  matchHistories.forEach((match) => {
    if (match.win) wins++

    const win = match.win ? '승리' : '패배'
    const type = match.type === 'RANKED_SOLO_5x5' ? '개인/2인랭크' : '자유랭크'
    const kda = `${match.kills}/${match.deaths}/${match.assists}`
    const score = ((match.kills + match.assists) / match.deaths).toFixed(2)

    historyString += `${win} \`|\` ${type} \`|\` ${champions[match.championName]} \`|\` ${kda} \`|\` ${score} 평점 \n`
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

  const embed = new EmbedBuilder()
    .setColor(0x00ff66)
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
      {
        name: '대전 기록',
        value: matchCount > 0 ? historyString : '최근 전적이 없습니다.',
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

  return embed
}
