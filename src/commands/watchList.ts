import { ColorResolvable, EmbedBuilder } from 'discord.js'
import Channel from '../models/channel.model'
import { dbConnect } from '../mongoose'
import { SlashCommand } from '../types/SlashCommand'
import { fetchSummonerByPuuid } from '../actions/fetchSummoner'
import { tierInfos } from '../constants/rank'

export const watchList: SlashCommand = {
  name: '워치리스트',
  description: '워치리스트를 조회합니다.',
  execute: async (_, interaction) => {
    try {
      // 1. db connection
      await dbConnect()

      // get guildId
      const guildId = interaction.guildId

      // 2. find channel
      const channel = await Channel.findById(guildId)

      // 3. if channel is not found
      if (!channel) {
        await Channel.create({
          _id: guildId,
          watchList: [],
        })

        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle('워치리스트')
              .setDescription('워치리스트가 비어있습니다.'),
          ],
        })

        return
      } else {
        if (channel.watchList.length === 0) {
          await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('워치리스트')
                .setDescription('워치리스트가 비어있습니다.'),
            ],
          })

          return
        }

        const summoners = channel.watchList
        const embeds = []

        // get summoner info
        for await (const puuid of summoners) {
          const summonerInfo = await fetchSummonerByPuuid(puuid)

          if (!summonerInfo) {
            continue
          }

          const {
            gameName,
            tagLine,
            profileIconId,
            lastUpdatedAt,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            RANKED_SOLO_5x5,
            RANKED_FLEX_SR,
          } = summonerInfo

          const soloRank = RANKED_SOLO_5x5
            ? `\`${RANKED_SOLO_5x5.tier} ${RANKED_SOLO_5x5.rank}\`
            ${RANKED_SOLO_5x5.wins}승 ${RANKED_SOLO_5x5.losses}패 (${Math.round(
              (RANKED_SOLO_5x5.wins /
                (RANKED_SOLO_5x5.wins + RANKED_SOLO_5x5.losses)) *
                100,
            )}%)`
            : '`정보없음`'

          const flexRank = RANKED_FLEX_SR
            ? `\`${RANKED_FLEX_SR.tier} ${RANKED_FLEX_SR.rank}\`
            ${RANKED_FLEX_SR.wins}승 ${RANKED_FLEX_SR.losses}패 (${Math.round(
              (RANKED_FLEX_SR.wins /
                (RANKED_FLEX_SR.wins + RANKED_FLEX_SR.losses)) *
                100,
            )}%)`
            : '`정보없음`'

          const tier = RANKED_SOLO_5x5
            ? RANKED_SOLO_5x5.tier
            : RANKED_FLEX_SR.tier
              ? RANKED_FLEX_SR.tier
              : 'UNRANKED'

          const color = tierInfos.find((i) => i.id === tier)
            ?.color as ColorResolvable

          const aSummoner = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${gameName}#${tagLine}`)
            .setURL(
              `https://lol.ps/summoner/${encodeURIComponent(`${gameName}_${tagLine}`)}?region=kr`,
            )
            .setDescription(`${gameName}#${tagLine}님의 정보입니다.`)
            .setThumbnail(
              `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
            )
            .addFields(
              {
                name: '\n',
                value: '\n',
              },
              {
                name: '개인/2인 랭크',
                value: soloRank,
                inline: true,
              },
              {
                name: '자유랭크',
                value: flexRank,
                inline: true,
              },
              {
                name: '\n',
                value: '\n',
              },
            )
            .setFooter({
              text: `최근 업데이트: ${new Date(
                lastUpdatedAt,
              ).toLocaleDateString('ko-KR', {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}`,
              iconURL: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
            })

          embeds.push(aSummoner)
        }

        const alertEmbed = new EmbedBuilder()
          .setColor('#FFCC65')
          .setTitle('이 채널의 고로시롤 워치리스트입니다.')

        await interaction.editReply({
          embeds: [alertEmbed, ...embeds],
        })
      }
    } catch (e) {
      console.error(e)
      await interaction.editReply({
        content: '워치리스트 조회에 실패했습니다.',
      })
      return
    }

    console.log(
      `[channelId : ${interaction.channelId}] /watchList 명령어를 사용했습니다.`,
    )
  },
}
