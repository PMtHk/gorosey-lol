import { EmbedBuilder } from 'discord.js'
import { COLORS } from '../constants/colors'
import { CustomError } from './CustomError'

// 404 - NotFoundError
export class NotFoundError extends CustomError {
  StatusCode = 404

  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.embedColor.warning)
      .setDescription('찾을 수 없는 리소스입니다.')
  }
}

// 404 - SummonerNotFoundError
export class SummonerNotFoundError extends NotFoundError {
  createErrorEmbed(): EmbedBuilder {
    return new EmbedBuilder()
      .setColor(COLORS.embedColor.warning)
      .setDescription(
        '입력한 소환사를 찾을 수 없습니다.\n[소환사명#태그]를 다시 확인해주세요.',
      )
  }
}
