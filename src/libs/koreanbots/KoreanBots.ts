import { HttpClient } from '../http'
import { UpdateBotStatResponse } from './types'
import { KoreanBotsError } from './error'

export class KoreanBotsClient {
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

  async updateStats(
    stats: UpdateBotStatResponse,
  ): Promise<UpdateBotStatResponse> {
    const response = await this.http.post<UpdateBotStatResponse>(
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
