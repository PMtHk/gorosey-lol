import { createMockedRankStatRepository } from '../mocks/RankStatRepository.mock'
import { createMockedRiotService } from '../mocks/RiotService.mock'
import RankStatService from './RankStatService'

describe('RankStatService', () => {
  const MockedRankStatRepository = createMockedRankStatRepository()
  const MockedRiotService = createMockedRiotService()

  const rankStatService = new RankStatService(
    MockedRankStatRepository,
    MockedRiotService,
  )

  describe('read', () => {
    it('existing rankStat', async () => {
      const result = await rankStatService.read('test_summoner_id')

      expect(result).toHaveProperty('_id', 'test_summoner_id')
      expect(result).toHaveProperty('RANKED_SOLO_5x5')
      expect(result).toHaveProperty('RANKED_FLEX_SR')
    })

    it('non-existing rankStat', async () => {
      MockedRankStatRepository.read = jest.fn().mockResolvedValue(null)

      const result = await rankStatService.read('test_summoner_id')

      expect(result).toHaveProperty('_id', 'test_summoner_id')
      expect(result).toHaveProperty('RANKED_SOLO_5x5', {
        leagueId: 'fetched_league_id',
        tier: 'IRON',
        rank: 'I',
        leaguePoints: 0,
        wins: 0,
        losses: 0,
      })
    })
  })

  describe('refresh', () => {
    it('default', async () => {
      const result = await rankStatService.refresh('test_summoner_id')

      expect(result).toHaveProperty('_id', 'test_summoner_id')
      expect(result).toHaveProperty('RANKED_SOLO_5x5', {
        leagueId: 'fetched_league_id',
        tier: 'IRON',
        rank: 'I',
        leaguePoints: 0,
        wins: 0,
        losses: 0,
      })
    })
  })
})
