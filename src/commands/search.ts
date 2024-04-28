import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'
import { fetchSummoner } from '../actions/fetchSummoner'

export const search: SlashCommand = {
  name: '조회',
  description: '소환사의 24시간 내 전적을 조회합니다. (솔로랭크, 자유랭크)',
  options: [
    {
      required: true,
      name: '소환사',
      description: '조회할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    const input = (interaction.options.get('소환사')?.value || '') as string

    if (!input.includes('#')) {
      await interaction.followUp({
        ephemeral: true,
        content: '소환사명과 태그를 입력해주세요. (예시: 완도수산전복도둑#KR1)',
      })

      return
    }

    const [inputGameName, inputTagLine] = input.split('#')

    if (!inputGameName || !inputTagLine) {
      await interaction.followUp({
        ephemeral: true,
        content: '소환사명과 태그를 입력해주세요. (예시: 완도수산전복도둑#KR1)',
      })

      return
    }

    const summoner = await fetchSummoner(inputGameName, inputTagLine)

    const { gameName, tagLine, profileIconId, lastUpdatedAt, summonerId } =
      summoner

    console.log(summoner)

    const rank = {
      SOLO: summonerId.RANKED_SOLO_5x5
        ? `\`${summonerId.RANKED_SOLO_5x5.tier} ${summonerId.RANKED_SOLO_5x5.rank}\` - ${summonerId.RANKED_SOLO_5x5.leaguePoints}LP\n${summonerId.RANKED_SOLO_5x5.wins}승 ${summonerId.RANKED_SOLO_5x5.losses}패 (${Math.round(
            (summonerId.RANKED_SOLO_5x5.wins /
              (summonerId.RANKED_SOLO_5x5.wins +
                summonerId.RANKED_SOLO_5x5.losses)) *
              100,
          )}%)`
        : '정보 없음',
      FLEX: summonerId.RANKED_FLEX_SR
        ? `\`${summonerId.RANKED_FLEX_SR.tier} ${summonerId.RANKED_FLEX_SR.rank}\` - ${summonerId.RANKED_FLEX_SR.leaguePoints}LP\n${summonerId.RANKED_FLEX_SR.wins}승 ${summonerId.RANKED_FLEX_SR.losses}패 (${Math.round(
            (summonerId.RANKED_FLEX_SR.wins /
              (summonerId.RANKED_FLEX_SR.wins +
                summonerId.RANKED_FLEX_SR.losses)) *
              100,
          )}%)`
        : '정보 없음',
    }

    const DATE_OPTIONS = {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff66)
      .setTitle(`${gameName}#${tagLine}`)
      .setURL(`https://lol.ps/summoner/${gameName}_${tagLine}?region=kr`)
      .setDescription('소환사의 랭크 지표와 24시간 내 랭크 전적을 조회합니다.')
      .setThumbnail(
        `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
      )
      .addFields(
        { name: '\n', value: '\n' },
        { name: '개인/2인랭크', value: rank.SOLO, inline: true },
        { name: '자유랭크', value: rank.FLEX, inline: true },
        { name: '\n', value: '\n' },
      )
      .addFields(
        { name: '24시간내 전적', value: '정보 없음' },
        { name: '\n', value: '\n' },
      )
      .setFooter({
        text: `최근 업데이트: ${lastUpdatedAt.toLocaleDateString('ko-KR', DATE_OPTIONS)}`,
        iconURL: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
      })

    await interaction.reply({
      embeds: [embed],
    })

    console.log(
      `[channelId : ${interaction.channelId}] /search 명령어를 사용했습니다.`,
    )
  },
}
