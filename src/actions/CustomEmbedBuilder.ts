import { EmbedBuilder } from 'discord.js'

export interface CustomEmbedData {
  gameName: string
  tagLine: string
  profileIconId: number
  lastUpdatedAt: Date
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
  } = data

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
      { name: '24시간내 전적', value: '정보 없음' },
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
