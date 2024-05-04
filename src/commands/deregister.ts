import {
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
  ComponentType,
} from 'discord.js'
import { findChannel, updateChannel } from '../actions/channel.actions'
import { fetchAccountDtoByPuuid } from '../actions/riot/fetchAccountDto'
import BaseError from '../errors/BaseError'
import { SlashCommand } from '../types/SlashCommand'

export const deregister: SlashCommand = {
  name: '해제',
  description: '특정 소환사를 워치리스트에서 제거할 수 있어요.',
  execute: async (_, interaction) => {
    try {
      const guildId = interaction.guildId

      // find channel from DB
      const channel = await findChannel(guildId)

      // if channel is not found
      if (!channel || channel.watchList.length === 0) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFCB64')
              .setTitle('워치리스트')
              .setDescription('워치리스트가 비어있어요.'),
          ],
        })

        return
      }

      // with watchlist make select menu
      const descriptionEmbed = new EmbedBuilder()
        .setColor('#FFCB64')
        .setTitle('워치리스트')
        .setDescription('제거할 소환사를 선택해주세요.')

      const summonerInfos = []

      for await (const puuid of channel.watchList) {
        const { gameName, tagLine } = await fetchAccountDtoByPuuid(puuid)

        summonerInfos.push({
          label: `${gameName}#${tagLine}`,
          puuid,
        })
      }

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder('소환사를 선택해주세요.')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(
          summonerInfos.map((summonerInfo) =>
            new StringSelectMenuOptionBuilder()
              .setLabel(summonerInfo.label)
              .setValue(summonerInfo.puuid)
              .setDescription(
                `워치리스트에서 ${summonerInfo.label} 님을 제거합니다.`,
              ),
          ),
        )

      const response = await interaction.editReply({
        embeds: [descriptionEmbed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
          ),
        ],
      })

      let flag = true

      const userInteraction = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 60_000,
      })

      userInteraction.on('collect', async (i) => {
        const puuid = i.values[0]

        const newWatchList = channel.watchList.filter(
          (id: string) => id !== puuid,
        )

        await updateChannel(guildId, newWatchList)

        await i.update({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFCB64')
              .setTitle('제거 완료')
              .setDescription('소환사가 제거되었습니다.'),
          ],
          components: [],
        })

        flag = false

        userInteraction.stop()
      })

      userInteraction.on('end', async () => {
        if (!flag) return

        await response.edit({
          embeds: [
            new EmbedBuilder()
              .setColor('#FFCB64')
              .setTitle('시간 초과')
              .setDescription('소환사를 선택하지 않아 해제 동작을 취소했어요!'),
          ],
          components: [],
        })
      })
    } catch (error) {
      if (error instanceof BaseError) {
        await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
        return
      }

      const unexpectedError = new BaseError(
        500,
        '[REGISTER|SLASH COMMAND] unexpected error',
      )

      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })
    }
  },
}
