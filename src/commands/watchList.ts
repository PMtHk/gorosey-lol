import { EmbedBuilder } from 'discord.js'
import Container from 'typedi'
import { COLORS } from '../constants/colors'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'
import ChannelService from '../services/ChannelService'
import RankStatService from '../services/RankStatService'
import SummonerService from '../services/SummonerService'
import { SlashCommand } from '../types/SlashCommand'
import { basicSummonerView } from '../views/BasicSummonerView'

export const watchList: SlashCommand = {
  name: '워치리스트',
  description: '이 채널의 워치리스트를 조회해요.',
  execute: async (interaction) => {
    try {
      // define services
      const channelService = Container.get(ChannelService)
      const summonerService = Container.get(SummonerService)
      const rankStatService = Container.get(RankStatService)

      const guildId = interaction.guildId
      const guildName = interaction.guild?.name

      const puuids = await channelService.getWatchList(guildId)

      if (puuids.length === 0) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.embedColor.warning)
              .setDescription('워치리스트가 비어있어요.'),
          ],
        })
      }

      const embeds = []

      for await (const puuid of puuids) {
        const summoner = await summonerService.read(puuid)
        const summonerId = summoner.summonerId
        const rankStat = await rankStatService.read(summonerId)

        const embed = basicSummonerView.createEmbed({
          summoner,
          rankStat,
        })

        embeds.push(embed)
      }

      const descriptionEmbed = new EmbedBuilder()
        .setColor(COLORS.embedColor.success)
        .setDescription(
          `\`${guildName}\` 채널의 워치리스트에요.\n워치리스트 내 소환사는 자동으로 갱신 및 조회가 이루어져요.`,
        )

      await interaction.editReply({
        embeds: [descriptionEmbed, ...embeds],
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
