import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import Container from 'typedi'

import { ChannelService, LoLService } from '../services'
import { COLORS } from '../constants/colors'
import { SlashCommand } from '../types'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'

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
  execute: async (interaction) => {
    try {
      const lolService = Container.get(LoLService)
      const channelService = Container.get(ChannelService)

      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const guildId = interaction.guildId
      const channelId = interaction.channelId

      const {
        puuid: riotPuuid,
        gameName,
        tagLine,
      } = await lolService.getAccount(inputGameName, inputTagLine)

      await channelService.addToWatchList(guildId, channelId, riotPuuid)

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.embedColor.success)
            .setDescription(
              `${gameName}#${tagLine}님이 워치리스트에 등록되었어요.`,
            ),
        ],
      })
    } catch (error) {
      if (error instanceof CustomError)
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
        })

      return await interaction.editReply({
        embeds: [new UnexpectedError(error.message).createErrorEmbed()],
      })
    }
  },
}
