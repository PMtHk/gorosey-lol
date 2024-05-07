import { EmbedBuilder } from 'discord.js'
import { channelService } from '../services/ChannelService'
import { SlashCommand } from '../types/SlashCommand'
import { summonerService } from '../services/SummonerService'
import { basicSummonerView } from '../views/BasicSummonerView'
import { rankStatService } from '../services/RankStatService'
import BaseError from '../errors/BaseError'
import { colors } from '../constants/colors'

export const watchList: SlashCommand = {
  name: '워치리스트',
  description: '이 채널의 워치리스트를 조회해요.',
  execute: async (_, interaction) => {
    try {
      const guildId = interaction.guildId
      const guildName = interaction.guild?.name

      const puuids = await channelService.getWatchList(guildId)

      if (puuids.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(colors.warning)
              .setDescription('워치리스트가 비어있어요.'),
          ],
        })
      }

      const embeds = []

      for await (const puuid of puuids) {
        const summoner = await summonerService.read(puuid)
        const summonerId = summoner.summonerId
        const rankStat = await rankStatService.read(summonerId)

        const embed = basicSummonerView.createEmbed({
          summoner,
          rankStat,
        })

        embeds.push(embed)
      }

      const descriptionEmbed = new EmbedBuilder()
        .setColor(colors.success)
        .setDescription(
          `\`${guildName}\` 채널의 워치리스트에요.\n워치리스트 내 소환사는 자동으로 갱신 및 조회가 이루어져요.`,
        )

      await interaction.editReply({
        embeds: [descriptionEmbed, ...embeds],
      })
    } catch (error) {
      if (error instanceof BaseError) {
        return await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
      }

      return await interaction.editReply({
        embeds: [new BaseError(500).generateEmbed()],
      })
    }
  },
}
