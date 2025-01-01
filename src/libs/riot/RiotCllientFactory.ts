import { RiotRegion } from './types'
import { RiotClient } from './RiotClient'
import { RateLimiter } from '../../utils/RateLimiter'

const { RIOT_API_KEY } = process.env
if (!RIOT_API_KEY) throw new Error('[ENV] RIOT_API_KEY를 불러올 수 없습니다.')

export class RiotClientFactory {
  private readonly API_KEY = RIOT_API_KEY

  private static readonly BASE_URLs = {
    asia: 'https://asia.api.riotgames.com',
    kr: 'https://kr.api.riotgames.com',
  }

  private static readonly RATE_LIMITS = {
    kr: {
      summoner: { limit: 1600, duration: 60000 }, // 1600/min
      league: { limit: 100, duration: 60000 }, // 100/min
    },
    asia: {
      account: { limit: 1000, duration: 60000 }, // 1000/min
      match: { limit: 2000, duration: 10000 }, // 2000/10sec
    },
  }

  private rateLimiters: Map<string, RateLimiter> = new Map()

  private getRateLimiter(region: string, endpoint: string) {
    const key = `${region}-${endpoint}`
    if (!this.rateLimiters.has(key)) {
      const config = RiotClientFactory.RATE_LIMITS[region][endpoint]
      this.rateLimiters.set(key, new RateLimiter(config.limit, config.duration))
    }
    return this.rateLimiters.get(key)
  }

  public getClient(region: RiotRegion) {
    return new RiotClient(RiotClientFactory.BASE_URLs[region], this.API_KEY, {
      getAccountLimiter: () => this.getRateLimiter(region, 'account'),
      getSummonerLimiter: () => this.getRateLimiter(region, 'summoner'),
      getLeagueLimiter: () => this.getRateLimiter(region, 'league'),
      getMatchLimiter: () => this.getRateLimiter(region, 'match'),
    })
  }
}

export const riotClientFactory = new RiotClientFactory()
