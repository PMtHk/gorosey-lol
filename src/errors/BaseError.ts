import { EmbedBuilder } from 'discord.js'

export default class BaseError extends Error {
  statusCode: number

  constructor(statusCode: number, message: string) {
    super(message)
    this.statusCode = statusCode

    Error.captureStackTrace(this, this.constructor)
  }

  generateEmbed() {
    return new EmbedBuilder()
      .setTitle('제가 조금 아파요!')
      .setDescription(this.message)
  }
}
