import { CacheType, Client, CommandInteraction, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'
import BaseError from '../errors/BaseError'

export const ping: SlashCommand = {
  name: '핑',
  description: '퐁으로 응답합니다.',
  execute: async (
    _: Client<boolean>,
    interaction: CommandInteraction<CacheType>,
  ) => {
    try {
      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0299FF')
            .setTitle(`🏓  ${interaction.client.ws.ping} ms`)
            .setTimestamp(),
        ],
      })
    } catch (error) {
      const unexpectedError = new BaseError(
        500,
        '[PING|SLASH COMMAND] unexpected error',
      )
      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })
    }
  },
}
