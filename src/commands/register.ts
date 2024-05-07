import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import BaseError from '../errors/BaseError'
import { channelService } from '../services/ChannelService'
import { SlashCommand } from '../types/SlashCommand'
import { riotService } from '../services/RiotService'
import { colors } from '../constants/colors'

export const register: SlashCommand = {
  name: '등록',
  description: '워치리스트에 소환사를 등록해요. (최대 3개)',
  options: [
    {
      required: true,
      name: '소환사',
      description: '등록할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    try {
      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const guildId = interaction.guildId
      const channelId = interaction.channelId

      const {
        puuid: riotPuuid,
        gameName,
        tagLine,
      } = await riotService.fetchAccount(inputGameName, inputTagLine || 'KR1')

      await channelService.addToWatchList(guildId, channelId, riotPuuid)

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(colors.success)
            .setDescription(
              `${gameName}#${tagLine}님이 워치리스트에 등록되었어요.`,
            ),
        ],
      })
    } catch (error) {
      if (error instanceof BaseError) {
        return await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
      }

      return await interaction.editReply({
        embeds: [new BaseError(500).generateEmbed()],
      })
    }
  },
}
