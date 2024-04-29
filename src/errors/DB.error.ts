import { EmbedBuilder } from 'discord.js'
import BaseError from './BaseError'

export default class DBError extends BaseError {
  generateEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('제가 조금 아파요!')
      .setDescription('🗂️ 문제가 발생했어요. 잠시 후 다시 시도해주세요.')
  }
}
