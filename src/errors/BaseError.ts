import { EmbedBuilder } from 'discord.js'

export default class BaseError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode

    Error.captureStackTrace(this, this.constructor)

    console.log(
      `[${new Date().toLocaleString()}] ${this.constructor.name}: ${this.message}`,
    )
  }

  generateEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('제가 조금 아파요!')
      .setDescription('🛠️ 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
  }
}
