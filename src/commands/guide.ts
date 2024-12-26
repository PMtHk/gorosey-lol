import { commands } from '.'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'
import { SlashCommand } from '../types'

export const guide: SlashCommand = {
  name: '도움말',
  description: '고로시롤의 모든 명령어를 확인할 수 있어요.',
  execute: async (interaction) => {
    try {
      const commandMessages = commands.map((command, idx) => {
        return `${idx + 1}. \`/${command.name}\` : ${command.description} \n`
      })

      await interaction.editReply({
        content:
          '현재 고로시롤에서 사용 가능한 명령어에요.\n\n' +
          commandMessages.join('') +
          '\n(KR 지역의 소환사 정보만 제공하고 있어요.)',
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
