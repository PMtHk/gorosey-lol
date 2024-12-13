import { HttpClient } from '../http'
import { RiotErrorDto } from './types'
import { isRiotErrorDto, RiotApiError } from './error'
import { RateLimiter } from '../../utils/RateLimiter'

export class RiotClient {
  private http: HttpClient

  constructor(
    protected readonly baseURL: string,
    apiKey: string,
    private readonly rateLimiter: RateLimiter,
  ) {
    this.http = new HttpClient({
      baseURL,
      headers: {
        'X-Riot-Token': apiKey,
      },
    })
  }

  private readonly requestHandlers = {
    get: <T>(url: string) => this.http.get<T | RiotErrorDto>(url),
  } as const

  private async request<T>(method: 'get', url: string) {
    return this.rateLimiter.execute(async () => {
      const response = await this.requestHandlers[method](url)

      if (isRiotErrorDto(response)) {
        throw new RiotApiError(
          response.status.message,
          response.status.status_code,
          response,
        )
      }

      return response as T
    })
  }

  public async get<T>(url: string) {
    return this.request<T>('get', url)
  }
}
