import { ApplicationCommandOptionType } from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'
import { fetchSummoner } from '../actions/fetchSummoner'

export const search: SlashCommand = {
  name: '조회',
  description: '소환사의 24시간 내 전적을 조회합니다. (솔로랭크, 자유랭크)',
  options: [
    {
      required: true,
      name: '소환사',
      description: '조회할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    const input = (interaction.options.get('소환사')?.value || '') as string

    if (!input.includes('#')) {
      await interaction.followUp({
        ephemeral: true,
        content: '소환사명과 태그를 입력해주세요. (예시: 완도수산전복도둑#KR1)',
      })

      return
    }

    const [inputGameName, inputTagLine] = input.split('#')

    if (!inputGameName || !inputTagLine) {
      await interaction.followUp({
        ephemeral: true,
        content: '소환사명과 태그를 입력해주세요. (예시: 완도수산전복도둑#KR1)',
      })

      return
    }

    const summoner = await fetchSummoner(inputGameName, inputTagLine)

    console.log(summoner)

    await interaction.followUp({
      ephemeral: true,
      content: `\` ${summoner.gameName}#${summoner.tagLine} \`님을 조회했습니다.`,
    })

    console.log(
      `[channelId : ${interaction.channelId}] /search 명령어를 사용했습니다.`,
    )
  },
}
