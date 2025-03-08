import { HttpClient } from '../http'
import { UpdateBotStatDto, UpdateBotStatResponseDto } from './types'
import { KoreanBotsError } from './error'

const { DISCORD_APPLICATION_ID, KOREAN_DISCORD_LIST_TOKEN } = process.env

if (!DISCORD_APPLICATION_ID) {
  throw new Error('DISCORD_APPLICATION_ID를 불러올 수 없습니다.')
}

if (!KOREAN_DISCORD_LIST_TOKEN) {
  throw new Error('KOREAN_DISCORD_LIST_TOKEN을 불러올 수 없습니다.')
}

export class KoreanBots {
  private http: HttpClient

  constructor(
    private readonly applicationId: string,
    private readonly token: string,
    baseURL = 'https://koreanbots.dev/api/v2/bots',
  ) {
    this.http = new HttpClient({
      baseURL,
      headers: {
        Authorization: token,
        'Content-Type': 'application/json',
      },
    })
  }

  public async updateStats(
    stats: UpdateBotStatDto,
  ): Promise<UpdateBotStatResponseDto> {
    const response = await this.http.post<UpdateBotStatResponseDto>(
      `${this.applicationId}/stats`,
      stats,
    )

    if (response.code !== 200) {
      throw new KoreanBotsError(
        response.message || '봇 정보 업데이트에 실패했습니다.',
        response.code,
        response,
      )
    }

    return response
  }
}

export const koreanBots = new KoreanBots(
  DISCORD_APPLICATION_ID,
  KOREAN_DISCORD_LIST_TOKEN,
)
