import commands from '.'
import BaseError from '../errors/BaseError'
import { SlashCommand } from '../types/SlashCommand'

export const guide: SlashCommand = {
  name: '도움말',
  description: '고로시롤의 모든 명령어를 확인할 수 있어요.',
  execute: async (_, interaction) => {
    try {
      const commandMessages = commands.map((command, idx) => {
        return `${idx + 1}. \`/${command.name}\` : ${command.description} \n`
      })

      await interaction.editReply({
        content:
          '현재 고로시롤에서 사용 가능한 명령어는 다음과 같습니다.\n\n' +
          commandMessages.join('') +
          '\n(KR 지역의 소환사 정보만 제공합니다.)',
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
        '[GUIDE|SLASH COMMAND] unexpected error',
      )

      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })
    }
  },
}
