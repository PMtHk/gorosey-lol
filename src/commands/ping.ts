import { SlashCommand } from '../types/SlashCommand'

export const ping: SlashCommand = {
  name: '핑',
  description: '퐁으로 응답합니다.',
  execute: async (_, interaction) => {
    await interaction.editReply('Pong!')

    console.log(
      `[channelId : ${interaction.channelId}] /ping 명령어를 사용했습니다.`,
    )
  },
}
