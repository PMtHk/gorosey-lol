import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import Container from 'typedi'
import { ChannelService, LoLService } from '../services'
import { SlashCommand } from '../types'
import { COLORS } from '../constants/colors'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'

export const deregister: SlashCommand = {
  name: '해제',
  description: '특정 소환사를 워치리스트에서 제거할 수 있어요.',
  execute: async (interaction) => {
    try {
      const lolService = Container.get(LoLService)
      const channelService = Container.get(ChannelService)

      const guildId = interaction.guildId
      const watchList = await channelService.getWatchList(guildId)

      // check if watchlist is empty
      if (watchList.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.embedColor.warning)
              .setDescription('워치리스트가 비어있어요.'),
          ],
        })
      }

      // create view
      const descriptionEmbed = new EmbedBuilder()
        .setColor(COLORS.embedColor.primary)
        .setDescription('워치리스트에서 제거할 소환사를 선택해주세요.')

      const selectMenuForDeregister = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder('소환사를 선택해주세요.')
        .setMinValues(1)
        .setMaxValues(1)

      const summonerProfiles = await Promise.all(
        watchList.map((puuid) => lolService.getSummonerProfile(puuid)),
      )

      summonerProfiles.forEach((summonerProfile) => {
        selectMenuForDeregister.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${summonerProfile.gameName}#${summonerProfile.tagLine}`)
            .setValue(summonerProfile._id)
            .setDescription(
              `워치리스트에서 ${summonerProfile.gameName}#${summonerProfile.tagLine} 님을 제거해요.`,
            ),
        )
      })

      await interaction.editReply({
        embeds: [descriptionEmbed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenuForDeregister,
          ),
        ],
      })

      const userInteractions = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 30_000,
      })

      // remove selected summoner from watchlist
      const targetRiotPuuid = userInteractions.values[0]
      await channelService.removeFromWatchList(guildId, targetRiotPuuid)

      await userInteractions.update({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.embedColor.success)
            .setDescription('선택한 소환사를 워치리스트에서 해제했어요.'),
        ],
        components: [],
      })
    } catch (error) {
      if (error instanceof CustomError) {
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
        })
      }

      // interaction timeout
      if (
        error.code === 'InteractionCollectorError' &&
        error.message ===
          'Collector received no interactions before ending with reason: time'
      ) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.embedColor.warning)
              .setDescription('시간 초과로 해제 동작을 취소했어요.'),
          ],
          components: [],
        })
      }

      return await interaction.editReply({
        embeds: [new UnexpectedError(error.message).createErrorEmbed()],
      })
    }
  },
}
