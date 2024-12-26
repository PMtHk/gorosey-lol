import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import Container from 'typedi'
import { SlashCommand } from '../types'
import { COLORS } from '../constants/colors'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'
import { RiotApiError } from '../libs/riot'
import { detailedSummonerView } from '../views'
import { LoLService } from '../services'

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
  execute: async (interaction) => {
    let replyEmbed: EmbedBuilder

    try {
      const lolService = Container.get(LoLService)

      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const account = await lolService.getAccount(inputGameName, inputTagLine)
      const riotPuuid = account.puuid

      const { summonerProfile, rankStats, matchHistories } =
        await lolService.getSummonerDetails(riotPuuid)

      replyEmbed = detailedSummonerView.createEmbed({
        summoner: summonerProfile,
        rankStat: rankStats,
        matchHistories,
      })

      // 상호작용 버튼
      const refreshButton = new ButtonBuilder()
        .setCustomId('refresh')
        .setLabel('전적 갱신하기')
        .setStyle(ButtonStyle.Primary)

      await interaction.editReply({
        embeds: [replyEmbed],
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            components: [refreshButton],
          }),
        ],
      })

      const guildMembers = interaction.client.guilds.cache
        .get(interaction.guildId)
        .members.cache.map((member) => member.user.id)

      const userInteraction = await interaction.channel?.awaitMessageComponent({
        componentType: ComponentType.Button,
        filter: (i) => guildMembers.includes(i.user.id),
        time: 30_000, // 15 seconds
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

        const {
          refreshedSummonerProfile,
          refreshedRankStats,
          refreshedMatchHistories,
        } = await lolService.refreshSummonerDetails(riotPuuid)

        replyEmbed = detailedSummonerView.createEmbed({
          summoner: refreshedSummonerProfile,
          rankStat: refreshedRankStats,
          matchHistories: refreshedMatchHistories,
        })

        await userInteraction.editReply({
          embeds: [replyEmbed],
          components: [],
        })
      }
    } catch (error) {
      if (RiotApiError.isRiotApiError(error)) {
        if (error.data.status.status_code === 404) {
          return await interaction.editReply({
            embeds: [
              new EmbedBuilder()
                .setColor(COLORS.embedColor.error)
                .setDescription(
                  '해당 소환사를 찾을 수 없습니다.\n소환사명과 태그를 다시 확인해주세요.',
                ),
            ],
          })
        }

        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.embedColor.error)
              .setDescription(
                'RIOT API 와 통신 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
              ),
          ],
        })
      }

      if (error instanceof CustomError) {
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
          components: [],
        })
      }

      // interaction timeout -> delete refresh button
      if (
        error.code === 'InteractionCollectorError' &&
        error.message ===
          'Collector received no interactions before ending with reason: time'
      )
        return await interaction.editReply({
          embeds: [replyEmbed],
          components: [],
        })

      return await interaction.editReply({
        embeds: [new UnexpectedError(error.message).createErrorEmbed()],
        components: [],
      })
    }
  },
}
