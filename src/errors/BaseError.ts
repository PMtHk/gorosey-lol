import { EmbedBuilder } from 'discord.js'
import { colors } from '../constants/colors'

export default class BaseError extends Error {
  code: number

  constructor(
    code: number,
    message: string = '요청을 처리할 수 없어요. 잠시 후 다시 시도해주세요.',
  ) {
    super(message)
    this.code = code

    Error.captureStackTrace(this, this.constructor)

    console.log(
      `[${new Date().toLocaleString()}] ${this.constructor.name}|${this.code}|${this.message}`,
    )
  }

  generateEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(this.code >= 500 ? colors.error : colors.warning)
      .setDescription(this.message)
  }
}
