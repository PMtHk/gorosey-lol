import { RiotRegion } from './types'
import { RiotClient } from './RiotClient'
import { RateLimiter } from '../../utils/RateLimiter'

const { RIOT_API_KEY } = process.env
if (!RIOT_API_KEY) throw new Error('[ENV] RIOT_API_KEY를 불러올 수 없습니다.')

export class RiotClientFactory {
  private readonly API_KEY = RIOT_API_KEY

  private readonly rateLimiter: RateLimiter

  private static readonly BASE_URLs = {
    asia: 'https://asia.api.riotgames.com',
    kr: 'https://kr.api.riotgames.com',
  }

  private clients: Map<RiotRegion, RiotClient> = new Map()

  constructor(rateLimiterOptions?: {
    throttleLimit?: number
    throttleDuration?: number
    threshold?: number
  }) {
    this.rateLimiter = new RateLimiter(
      rateLimiterOptions?.throttleLimit,
      rateLimiterOptions?.throttleDuration,
      rateLimiterOptions?.threshold,
    )
  }

  public getClient(region: RiotRegion) {
    if (!this.clients.has(region)) {
      const baseURL = RiotClientFactory.BASE_URLs[region]
      this.clients.set(
        region,
        new RiotClient(baseURL, this.API_KEY, this.rateLimiter),
      )
    }

    return this.clients.get(region)
  }
}

export const riotClientFactory = new RiotClientFactory()
