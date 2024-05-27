import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js'
import { COLORS } from '../constants/colors'
import { CustomError } from '../errors/CustomError'
import { UnexpectedError } from '../errors/UnexpectedError'
import { SlashCommand } from '../types/SlashCommand'
import { dbConnect } from '../mongoose'
import Container from 'typedi'
import ScheduleService from '../services/schedule.service'

const MINIMUM_TIME_SELECT = 1
const MAXIMUM_TIME_SELECT = 3

export const changeTime: SlashCommand = {
  name: '시간변경',
  description: '워치리스트 알림 시간을 변경할 수 있어요.',
  execute: async (interaction) => {
    try {
      await dbConnect()

      // define services
      const scheduleService = Container.get(ScheduleService)

      const { guildId } = interaction

      // create view
      const descriptionEmbed = new EmbedBuilder()
        .setColor(COLORS.embedColor.primary)
        .setDescription(
          '워치리스트 알림 시간을 변경할 수 있어요.\n최대 3개의 시간을 선택할 수 있어요.',
        )

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('change_time')
        .setPlaceholder('시간을 선택해주세요.')
        .setMinValues(MINIMUM_TIME_SELECT)
        .setMaxValues(MAXIMUM_TIME_SELECT)

      for (let i = 0; i <= 23; i++) {
        selectMenu.addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel(`${i}시`)
            .setValue(i.toString())
            .setDescription(`${i}시에 갱신된 전적을 보내드릴게요.`),
        )
      }

      await interaction.editReply({
        embeds: [descriptionEmbed],
        components: [
          new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu,
          ),
        ],
      })

      const userInteraction = await interaction.channel.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.customId === 'change_time' && i.user.id === interaction.user.id,
        time: 30_000,
      })

      const selectedTimes = userInteraction.values.map((value) =>
        parseInt(value),
      )

      selectedTimes.sort((a, b) => a - b)

      // update schedule
      // 1. 기존의 해당 guild의 schedule을 모두 삭제
      await scheduleService.deleteSchedules(guildId)

      // 2. 새로운 시간을 등록
      await scheduleService.createSchedules([
        ...selectedTimes.map((time) => ({
          guildId,
          time: time.toString(),
        })),
      ])

      return await userInteraction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(COLORS.embedColor.success)
            .setDescription(
              `워치리스트 알림 시간이 ${selectedTimes.join(', ')}시로 변경되었어요.`,
            ),
        ],
        components: [],
      })
    } catch (error) {
      if (error instanceof CustomError) {
        return await interaction.editReply({
          embeds: [error.createErrorEmbed()],
        })
      }

      // interaction timeout
      if (
        error.code === 'InteractionCollectorError' &&
        error.message ===
          'Collector received no interactions before ending with reason: time'
      ) {
        return await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(COLORS.embedColor.warning)
              .setDescription('시간 초과로 해제 동작을 취소했어요.'),
          ],
          components: [],
        })
      }

      return await interaction.editReply({
        embeds: [new UnexpectedError(error.message).createErrorEmbed()],
      })
    }
  },
}
