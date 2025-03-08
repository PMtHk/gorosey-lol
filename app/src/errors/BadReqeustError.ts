import { EmbedBuilder } from 'discord.js'
import { COLORS } from '../constants/colors'
import { CustomError } from './CustomError'

// 400 - BadRequestError
export class BadRequestError extends CustomError {
  StatusCode = 400

  constructor(
    public message: string,
    private customMessage?: string,
  ) {
    super(message)
  }

  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.embedColor.warning)
      .setDescription(this.customMessage || '잘못된 요청입니다.')
  }
}
