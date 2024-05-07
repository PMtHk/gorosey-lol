import { CacheType, Client, CommandInteraction, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'
import BaseError from '../errors/BaseError'
import { colors } from '../constants/colors'

export const ping: SlashCommand = {
  name: '핑',
  description: '봇의 핑 수치를 확인할 수 있어요.',
  execute: async (
    _: Client<boolean>,
    interaction: CommandInteraction<CacheType>,
  ) => {
    try {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.primary)
            .setTitle(`🏓  ${interaction.client.ws.ping} ms`)
            .setTimestamp(),
        ],
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
