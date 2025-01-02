import { EmbedBuilder } from 'discord.js'
import Container from 'typedi'
import { ChannelService, LoLService } from '../services'
import { basicSummonerView } from '../views'
import { COLORS } from '../constants/colors'
import { SlashCommand } from '../types'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'

export const watchList: SlashCommand = {
  name: '워치리스트',
  description: '이 채널의 워치리스트를 조회해요.',
  execute: async (interaction) => {
    try {
      const channelService = Container.get(ChannelService)
      const lolService = Container.get(LoLService)

      const guildId = interaction.guildId
      const guildName = interaction.guild?.name

      const puuids = await channelService.getWatchList(guildId)

      if (puuids.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.embedColor.warning)
              .setDescription('워치리스트가 비어있어요.'),
          ],
        })
      }

      const embeds = await Promise.all(
        puuids.map(async (puuid) => {
          const summoner = await lolService.getSummonerProfile(puuid)
          const summonerId = summoner.summonerId
          const rankStat = await lolService.getSummonerRankStats(summonerId)

          return basicSummonerView.createEmbed({
            summoner,
            rankStat,
          })
        }),
      )

      const descriptionEmbed = new EmbedBuilder()
        .setColor(COLORS.embedColor.success)
        .setDescription(
          `\`${guildName}\` 채널의 워치리스트에요.\n워치리스트 내 소환사는 자동으로 갱신 및 조회가 이루어져요.`,
        )

      await interaction.editReply({
        embeds: [descriptionEmbed, ...embeds],
      })
    } catch (error) {
      if (error instanceof CustomError)
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
        })

      return await interaction.editReply({
        embeds: [new UnexpectedError(error.message).createErrorEmbed()],
      })
    }
  },
}
