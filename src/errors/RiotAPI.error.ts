import { ColorResolvable, EmbedBuilder } from 'discord.js'
import BaseError from './BaseError'

export default class RiotAPIError extends BaseError {
  color: ColorResolvable

  title: string

  constructor(statusCode: number, message: string) {
    super(statusCode, message)

    this.color = '#FF0000' // danger
    this.title = '제가 조금 아파요!'
    this.message =
      '🛠️ 라이엇과 통신 중에 문제가 발생했어요. 잠시 후 다시 시도해주세요.'

    if (statusCode >= 500) {
      this.title = '라이엇 API 서버가 아파요!'
      this.message =
        '🛠️  잠시 라이엇 API 서버가 아파보여요. 잠시 후 다시 시도해주세요.'
    }

    if (statusCode === 404) {
      this.color = '#FFCC64' // warning
      this.title = '소환사를 찾을 수 없어요!'
      this.message = '올바르게 입력했는지 확인해주세요.'
    }
  }

  generateEmbed() {
    return new EmbedBuilder()
      .setTitle(this.title)
      .setDescription(this.message)
      .setColor(this.color)
  }
}
