import { createMockedRankStatRepository } from '../mocks/RankStatRepository.mock'
import { createMockedRiotService } from '../mocks/RiotService.mock'
import RankStatRepository from '../repositories/RankStatRepository'
import RankStatService from './RankStatService'
import RiotService from './RiotService'

describe('RankStatService', () => {
  let MockedRankStatRepository: RankStatRepository
  let MockedRiotService: RiotService
  let rankStatService: RankStatService

  beforeEach(() => {
    MockedRankStatRepository = createMockedRankStatRepository()
    MockedRiotService = createMockedRiotService()

    rankStatService = new RankStatService(
      MockedRankStatRepository,
      MockedRiotService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('read', () => {
    it('existing rankStat', async () => {
      // Arrange
      // Act
      const result = await rankStatService.read('test_summoner_id')

      // Assert
      expect(result).toHaveProperty('_id', 'test_summoner_id')
      expect(result).toHaveProperty('RANKED_SOLO_5x5')
      expect(result).toHaveProperty('RANKED_FLEX_SR')
    })

    it('non-existing rankStat', async () => {
      // Arrange
      MockedRankStatRepository.read = jest.fn().mockResolvedValue(null)

      // Act
      const result = await rankStatService.read('test_summoner_id')

      // Assert
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
      // Arrange
      // Act
      const result = await rankStatService.refresh('test_summoner_id')

      // Assert
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
