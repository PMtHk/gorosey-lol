import { EmbedBuilder } from 'discord.js'
import BaseError from './BaseError'

export default class DBError extends BaseError {
  constructor(message: string) {
    super(500, message)
  }

  generateEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('#FF0000')
      .setDescription('🗂️ 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
  }
}
