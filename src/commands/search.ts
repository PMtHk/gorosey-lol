import {
  ApplicationCommandOptionType,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'
import { IMatchHistory } from '../models/matchHistory.model'
import { IRankStat } from '../models/rankStat.model'
import { ISummoner } from '../models/summoner.model'
import { matchHistoryService } from '../services/MatchHistoryService'
import { rankStatService } from '../services/RankStatService'
import { riotService } from '../services/RiotService'
import { summonerService } from '../services/SummonerService'
import { SlashCommand } from '../types/SlashCommand'
import { detailedSummonerView } from '../views/DetailedSummonerView'

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
    let summoner: ISummoner,
      rankStat: IRankStat,
      matchHistories: Array<IMatchHistory>,
      replyEmbed: EmbedBuilder

    try {
      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const { puuid: riotPuuid } = await riotService.fetchAccount(
        inputGameName,
        inputTagLine || 'KR1',
      )

      // services
      summoner = await summonerService.read(riotPuuid)
      const summonerId = summoner.summonerId

      rankStat = await rankStatService.read(summonerId)
      matchHistories = await matchHistoryService.read(riotPuuid)

      // views
      replyEmbed = detailedSummonerView.createEmbed({
        summoner,
        rankStat,
        matchHistories,
      })

      // interaction button
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

        summoner = await summonerService.refresh(riotPuuid)
        rankStat = await rankStatService.refresh(summonerId)
        matchHistories = await matchHistoryService.refresh(riotPuuid)

        replyEmbed = detailedSummonerView.createEmbed({
          summoner,
          rankStat,
          matchHistories,
        })

        await userInteraction.editReply({
          embeds: [replyEmbed],
          components: [],
        })
      }
    } catch (error) {
      if (error instanceof CustomError) {
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
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
      })
    }
  },
}
