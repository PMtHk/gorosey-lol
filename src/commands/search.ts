import {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import BaseError from '../errors/BaseError'
import { riotService } from '../services/RiotService'
import SummonerService from '../services/SummonerService'
import { SlashCommand } from '../types/SlashCommand'

export const search: SlashCommand = {
  name: '조회',
  description: '소환사의 랭크 정보 및 24시간 내 전적을 조회해요.',
  options: [
    {
      required: true,
      name: '소환사',
      description: '조회할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    try {
      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const { puuid: riotPuuid } = await riotService.fetchAccount(
        inputGameName,
        inputTagLine || 'KR1',
      )

      const targetSummoner = new SummonerService(riotPuuid)
      await targetSummoner.init()

      const response = await interaction.editReply({
        embeds: [targetSummoner.buildEmbed()],
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            components: [
              new ButtonBuilder()
                .setCustomId('refresh')
                .setLabel('전적 갱신하기')
                .setStyle(ButtonStyle.Primary),
            ],
          }),
        ],
      })

      const guildMembers = interaction.client.guilds.cache
        .get(interaction.guildId)
        .members.cache.map((member) => member.user.id)

      const userInteraction = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => guildMembers.includes(i.user.id),
      })

      if (userInteraction.customId === 'refresh') {
        await userInteraction.update({
          components: [
            new ActionRowBuilder<ButtonBuilder>({
              components: [
                new ButtonBuilder()
                  .setCustomId('refresh')
                  .setDisabled(true)
                  .setLabel('갱신 중...')
                  .setStyle(ButtonStyle.Secondary),
              ],
            }),
          ],
        })

        await targetSummoner.refresh()

        await userInteraction.editReply({
          embeds: [targetSummoner.buildEmbed()],
          components: [],
        })
      }
    } catch (error) {
      if (error instanceof BaseError) {
        await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
        return
      }

      const unexpectedError = new BaseError(
        500,
        '[SEARCH|SLASH COMMAND] unexpected error',
      )

      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })
    }
  },
}
