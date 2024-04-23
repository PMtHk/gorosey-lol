import { SlashCommand } from '../types/SlashCommand'

export const watchList: SlashCommand = {
  name: '워치리스트',
  description: '워치리스트를 조회합니다.',
  execute: async (_, interaction) => {
    const list = [
      '완도수산#차남친구',
      '검은머리숟가락#KR1',
      '완도수산전복도둑#KR1',
    ]

    const content = list.map((summoner, idx) => {
      return `${idx + 1}. \` ${summoner} \``
    })

    await interaction.followUp({
      ephemeral: true,
      content:
        `워치리스트에 등록된 소환사 목록입니다.\n\n` +
        content.join('\n') +
        '\n\n매일 **23:59**에 하루 전적을 요약해서 보내드립니다.\n' +
        `(KR 지역의 소환사 정보만 제공합니다.)`,
    })

    console.log(
      `[channelId : ${interaction.channelId}] /watchList 명령어를 사용했습니다.`,
    )
  },
}
