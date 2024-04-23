import { ApplicationCommandOptionType } from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'

export const register: SlashCommand = {
  name: '등록',
  description: '워치리스트에 소환사를 등록합니다.',
  options: [
    {
      required: true,
      name: '소환사',
      description: '등록할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    const summoner = (interaction.options.get('소환사')?.value || '') as string

    await interaction.followUp({
      ephemeral: true,
      content: `\` ${summoner} \`님을 워치리스트에 등록했습니다.`,
    })

    console.log(
      `[channelId : ${interaction.channelId}] /register 명령어를 사용했습니다.`,
    )
  },
}
