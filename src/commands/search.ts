import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'
import { fetchSummoner } from '../actions/fetchSummoner'
import CustomEmbedBuilder, {
  CustomEmbedData,
} from '../actions/CustomEmbedBuilder'
import { updateSummoner } from '../actions/updateSummoner'

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

    const { gameName, tagLine, profileIconId, lastUpdatedAt, summonerId } =
      summoner

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { RANKED_SOLO_5x5, RANKED_FLEX_SR } = summonerId

    const data: CustomEmbedData = {
      gameName,
      tagLine,
      profileIconId,
      lastUpdatedAt,
      RANKED_SOLO_5x5,
      RANKED_FLEX_SR,
    }

    const embed = CustomEmbedBuilder(data)

    // disable refresh button if last updated at is less than 30 mins
    const isRefreshDisabled =
      Date.now() - lastUpdatedAt.getTime() < 30 * 60 * 1000

    const refreshButton = new ButtonBuilder()
      .setCustomId('refresh')
      .setLabel(
        isRefreshDisabled
          ? '30분이 지난 전적만 갱신이 가능합니다.'
          : '전적 갱신하기',
      )
      .setStyle(isRefreshDisabled ? ButtonStyle.Secondary : ButtonStyle.Primary)
      .setDisabled(isRefreshDisabled)

    const response = await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder<ButtonBuilder>({
          components: [refreshButton],
        }),
      ],
    })

    const collectorFilter = (i) => i.user.id === interaction.user.id

    try {
      const userInteraction = await response.awaitMessageComponent({
        filter: collectorFilter,
      })

      if (userInteraction.customId === 'refresh') {
        await userInteraction.update({
          components: [
            new ActionRowBuilder<ButtonBuilder>({
              components: [
                refreshButton
                  .setDisabled(true)
                  .setLabel('갱신 중...')
                  .setStyle(ButtonStyle.Secondary),
              ],
            }),
          ],
        })
        await updateSummoner(inputGameName, inputTagLine)

        const updatedSummoner = await fetchSummoner(inputGameName, inputTagLine)

        const updatedData: CustomEmbedData = {
          gameName: updatedSummoner.gameName,
          tagLine: updatedSummoner.tagLine,
          profileIconId: updatedSummoner.profileIconId,
          lastUpdatedAt: updatedSummoner.lastUpdatedAt,
          RANKED_SOLO_5x5: updatedSummoner.summonerId.RANKED_SOLO_5x5,
          RANKED_FLEX_SR: updatedSummoner.summonerId.RANKED_FLEX_SR,
        }

        const updatedEmbed = CustomEmbedBuilder(updatedData)

        await userInteraction.editReply({
          embeds: [updatedEmbed],
          components: [
            new ActionRowBuilder<ButtonBuilder>({
              components: [
                refreshButton
                  .setDisabled(true)
                  .setLabel('갱신 완료')
                  .setStyle(ButtonStyle.Secondary),
              ],
            }),
          ],
        })
      }
    } catch (e) {
      console.log(e)
      await interaction.editReply({
        content: '전적 갱신에 실패했습니다. 다시 시도해주세요.',
        components: [],
        embeds: [],
      })
    }

    console.log(
      `[channelId : ${interaction.channelId}] /search 명령어를 사용했습니다.`,
    )
  },
}
