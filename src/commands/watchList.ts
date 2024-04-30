import { ColorResolvable, EmbedBuilder } from 'discord.js'
import { findChannel } from '../actions/db/channel/find'
import { findRankStat } from '../actions/db/rankstat/find'
import { findSummoner } from '../actions/db/summoner/find'
import { dbConnect } from '../mongoose'
import { SlashCommand } from '../types/SlashCommand'
import { createChannel } from '../actions/db/channel/create'
import { tierInfos } from '../constants/rank'
import BaseError from '../errors/BaseError'

export const watchList: SlashCommand = {
  name: '워치리스트',
  description: '워치리스트를 조회합니다.',
  execute: async (_, interaction) => {
    try {
      await dbConnect()

      // get guildId
      const guildId = interaction.guildId
      const guildName = interaction.guild?.name

      // find channel from DB
      const channel = await findChannel(guildId)

      // if channel is not found
      if (!channel) {
        // create new channel and reply with empty watchList
        await createChannel(guildId)

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

      // if channel is found
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

      const puuids = channel.watchList

      const embeds = []

      for await (const riotPuuid of puuids) {
        const summonerInfo = await findSummoner(riotPuuid)
        const {
          summonerId,
          gameName,
          tagLine,
          profileIconId,
          summonerLevel,
          lastUpdatedAt,
        } = summonerInfo

        const rankStatInfo = await findRankStat(summonerId)
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { RANKED_SOLO_5x5, RANKED_FLEX_SR } = rankStatInfo

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
          .setDescription(`Lv.${summonerLevel}`)
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
            text: `최근 업데이트: ${new Date(lastUpdatedAt).toLocaleDateString(
              'ko-KR',
              {
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              },
            )}`,
            iconURL: `https://ddragon.leagueoflegends.com/cdn/14.8.1/img/profileicon/${profileIconId}.png`,
          })

        embeds.push(aSummoner)
      }

      const alertEmbed = new EmbedBuilder()
        .setColor('#FFCC65')
        .setTitle(`${guildName}의 고로시롤 워치리스트입니다.`)

      await interaction.editReply({
        embeds: [alertEmbed, ...embeds],
      })
    } catch (error) {
      if (error instanceof BaseError) {
        await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
        return
      }

      const unexpectedError = new BaseError(
        500,
        '[WATCHLIST|SLASH COMMAND] unexpected error',
      )

      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })
    }
  },
}
