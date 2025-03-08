import { EmbedBuilder } from 'discord.js'
import { COLORS } from '../constants/colors'
import { CustomError } from './CustomError'

// 500 - DatabaseError
export class DatabaseError extends CustomError {
  StatusCode = 500

  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.embedColor.error)
      .setDescription(
        '데이터베이스 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
      )
  }
}
