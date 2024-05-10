import { EmbedBuilder } from 'discord.js'
import { CustomError } from './CustomError'
import { COLORS } from '../constants/colors'

// 500 - UnexpectedError
export class UnexpectedError extends CustomError {
  StatusCode = 500

  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.embedColor.error)
      .setDescription(
        '알 수 없는 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      )
  }
}
