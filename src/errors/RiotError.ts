import { ColorResolvable, EmbedBuilder } from 'discord.js'
import BaseError from './BaseError'

export default class RiotError extends BaseError {
  generateEmbed(): EmbedBuilder {
    let description: string =
      '🛠️ 라이엇과 통신 중에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

    let color: ColorResolvable = '#FFA500' //default warning

    if (this.code === 404) {
      description =
        '소환사를 찾을 수 없어요.\n올바르게 입력했는지 확인해주세요.'
    }

    if (this.code >= 500) {
      color = '#FF0000' // danger
      description =
        '🛠️ 잠시 라이엇 서버가 아파보여요. 잠시 후 다시 시도해주세요.'
    }

    return new EmbedBuilder().setDescription(description).setColor(color)
  }
}
