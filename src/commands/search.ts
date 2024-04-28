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
import { BUTTON_REFRESH_TIME } from '../constants/refreshTime'

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
  execute: async (client, interaction) => {
    try {
      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const summoner = await fetchSummoner(inputGameName, inputTagLine)
      const {
        gameName,
        tagLine,
        profileIconId,
        lastUpdatedAt,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        summonerId: { RANKED_SOLO_5x5, RANKED_FLEX_SR },
      } = summoner

      if ('error' in summoner) {
        await interaction.editReply({
          embeds: [
            {
              title: '존재하지 않는 소환사입니다.',
              description: '소환사명과 태그를 다시 확인해주세요.',
              color: 0xff0000,
            },
          ],
        })

        return
      }

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
        Date.now() - lastUpdatedAt.getTime() < BUTTON_REFRESH_TIME

      const refreshButton = new ButtonBuilder()
        .setCustomId('refresh')
        .setLabel(
          isRefreshDisabled
            ? `${BUTTON_REFRESH_TIME / 60000}분이 지난 전적만 갱신이 가능합니다.`
            : '전적 갱신하기',
        )
        .setStyle(
          isRefreshDisabled ? ButtonStyle.Secondary : ButtonStyle.Primary,
        )
        .setDisabled(isRefreshDisabled)

      const response = await interaction.editReply({
        embeds: [embed.toJSON()],
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            components: [refreshButton],
          }),
        ],
      })

      // 더 수행할 작업이 없으므로 return
      // return 없을 시 강제 추방되는 경우 앱이 죽는 문제가 있음
      if (isRefreshDisabled) return

      // 멤버목록 가져와서 버튼을 클릭이 가능하도록 필터링
      const userGuilds = interaction.client.guilds.cache.get(
        interaction.guildId,
      ).members.cache

      const memberIds = userGuilds.map((member) => member.user.id)

      const collectorFilter = (i) => memberIds.includes(i.user.id)

      const userInteraction = await response.awaitMessageComponent({
        filter: collectorFilter,
      })

      // refresh button interaction
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

      return
    } catch (e) {
      console.log(e)
      await interaction.editReply({
        embeds: [
          {
            title: '전적 조회에 실패했습니다.',
            description:
              '내부 서버의 오류일 수 있습니다. 잠시 후 다시 시도해주세요.',
            color: 0xff0000,
          },
        ],
      })
    }
  },
}
