import {
  ActionRowBuilder,
  ChannelType,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import Container from 'typedi'
import { ChannelService } from '../services'
import { COLORS } from '../constants/colors'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'
import { SlashCommand } from '../types'

export const changeChannel: SlashCommand = {
  name: '채널변경',
  description: '워치리스트 알림 채널을 변경할 수 있어요.',
  execute: async (interaction) => {
    try {
      const channelService = Container.get(ChannelService)

      const guildId = interaction.guildId
      const textChannels = interaction.guild.channels.cache
        .filter((channel) => channel.type === ChannelType.GuildText)
        .map((elem) => {
          return {
            name: elem.name,
            id: elem.id,
          }
        })

      const descriptionEmbed = new EmbedBuilder()
        .setColor(COLORS.embedColor.primary)
        .setDescription('워치리스트 알림을 받을 채널을 선택해주세요.')

      const channelSelectMenu = new StringSelectMenuBuilder()
        .setCustomId('change_channel')
        .setPlaceholder('채널을 선택해주세요.')
        .setMinValues(1)
        .setMaxValues(1)

      textChannels.forEach((channel) => {
        channelSelectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(channel.name)
            .setValue(channel.id)
            .setDescription(
              `워치리스트 알림을 \`${channel.name}\` 채널로 보낼게요.`,
            ),
        )
      })

      await interaction.editReply({
        embeds: [descriptionEmbed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            channelSelectMenu,
          ),
        ],
      })

      const userInteraction = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === 'change_channel',
        time: 30_000,
      })

      const selectedChannelId = userInteraction.values[0]
      const selectedChannelName = textChannels.find(
        ({ id }) => id === selectedChannelId,
      ).name

      // update channel
      await channelService.updateTextChannel(guildId, selectedChannelId)

      return await userInteraction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.embedColor.success)
            .setDescription(
              `워치리스트 알림 채널이 \`${selectedChannelName}\` 로 변경되었어요.`,
            ),
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
