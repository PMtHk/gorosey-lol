import { HttpClient } from '../http'
import { RiotErrorDto } from './types'
import { isRiotErrorDto, RiotApiError } from './error'
import { RateLimiter } from '../../utils/RateLimiter'

export class RiotClient {
  private http: HttpClient

  constructor(
    protected readonly baseURL: string,
    apiKey: string,
    private readonly rateLimiters: {
      getAccountLimiter: () => RateLimiter
      getSummonerLimiter: () => RateLimiter
      getLeagueLimiter: () => RateLimiter
      getMatchLimiter: () => RateLimiter
    },
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

  private getRateLimiter(path: string): RateLimiter {
    if (path.includes('/riot/account/'))
      return this.rateLimiters.getAccountLimiter()
    if (path.includes('/lol/summoner/'))
      return this.rateLimiters.getSummonerLimiter()
    if (path.includes('/lol/league/'))
      return this.rateLimiters.getLeagueLimiter()
    if (path.includes('/lol/match/')) return this.rateLimiters.getMatchLimiter()
    throw new Error(`Unknown API path: ${path}`)
  }

  private async request<T>(method: 'get', path: string) {
    const rateLimiter = this.getRateLimiter(path)
    return rateLimiter.execute(async () => {
      const response = await this.requestHandlers[method](path)
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

  public async get<T>(path: string) {
    return this.request<T>('get', path)
  }
}
