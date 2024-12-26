import { EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types'
import { COLORS } from '../constants/colors'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'

export const ping: SlashCommand = {
  name: '핑',
  description: '봇의 핑 수치를 확인할 수 있어요.',
  execute: async (interaction) => {
    try {
      return await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.embedColor.primary)
            .setTitle(`🏓  ${interaction.client.ws.ping} ms`)
            .setTimestamp(),
        ],
      })
    } catch (error) {
      if (error instanceof CustomError) {
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
        })
      }

      return await interaction.editReply({
        embeds: [new UnexpectedError(error.message).createErrorEmbed()],
      })
    }
  },
}
