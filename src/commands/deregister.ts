import {
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import BaseError from '../errors/BaseError'
import { ISummoner } from '../models/summoner.model'
import { channelService } from '../services/ChannelService'
import { summonerService } from '../services/SummonerService'
import { SlashCommand } from '../types/SlashCommand'
import { colors } from '../constants/colors'

export const deregister: SlashCommand = {
  name: '해제',
  description: '특정 소환사를 워치리스트에서 제거할 수 있어요.',
  execute: async (_, interaction) => {
    try {
      const guildId = interaction.guildId
      const watchList = await channelService.getWatchList(guildId)

      // create view
      const descriptionEmbed = new EmbedBuilder()
        .setColor(colors.primary)
        .setDescription('워치리스트에서 제거할 소환사를 선택해주세요.')

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder('소환사를 선택해주세요.')
        .setMinValues(1)
        .setMaxValues(1)

      for await (const puuid of watchList) {
        const summoner: ISummoner = await summonerService.read(puuid)

        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${summoner.gameName}#${summoner.tagLine}`)
            .setValue(summoner._id) // riotPuuid
            .setDescription(
              `워치리스트에서 ${summoner.gameName}#${summoner.tagLine} 님을 제거합니다.`,
            ),
        )
      }

      await interaction.editReply({
        embeds: [descriptionEmbed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
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
            .setColor(colors.success)
            .setDescription('선택한 소환사를 워치리스트에서 해제했어요.'),
        ],
        components: [],
      })
    } catch (error) {
      console.log('error', error)
      if (error instanceof BaseError) {
        return await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
      }

      // interaction timeout -> delete refresh button
      if (
        error.code === 'InteractionCollectorError' &&
        error.message ===
          'Collector received no interactions before ending with reason: time'
      ) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(colors.warning)
              .setDescription('시간 초과로 해제 동작을 취소했어요.'),
          ],
          components: [],
        })
      }

      return await interaction.editReply({
        embeds: [new BaseError(500).generateEmbed()],
      })
    }
  },
}
