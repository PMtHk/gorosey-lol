import commands from '../commands'
import { SlashCommand } from '../types/SlashCommand'

export const guide: SlashCommand = {
  name: '도움말',
  description: '고로시롤의 모든 명령어를 확인합니다.',
  execute: async (_, interaction) => {
    const commandMessages = commands.map((command, idx) => {
      return `${idx + 1}. \`/${command.name}\` : ${command.description} \n`
    })

    await interaction.editReply({
      content:
        '현재 고로시롤에서 사용 가능한 명령어는 다음과 같습니다.\n\n' +
        commandMessages.join('') +
        '\n(KR 지역의 소환사 정보만 제공합니다.)',
    })

    console.log(
      `[channelId : ${interaction.channelId}] /guide 명령어를 사용했습니다.`,
    )
  },
}
