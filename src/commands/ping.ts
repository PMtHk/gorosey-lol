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
            .setTitle(`🏓  ${interaction.client.ws.ping} ms`)
            .setTimestamp(),
        ],
      })

      return
    } catch (error) {
      const unexpectedError = new BaseError(
        500,
        '🛠️ 왜 아픈지 모르겠어요... 열심히 고쳐볼게요.',
      )
      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })

      // TODO: 에러 로그 전송
    }
  },
}
