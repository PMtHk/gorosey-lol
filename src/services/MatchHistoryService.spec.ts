import { createMockedMatchHistoryRepository } from '../mocks/MatchHistoryRepository.mock'
import { createMockedRiotService } from '../mocks/RiotService.mock'
import MatchHistoryRepository from '../repositories/MatchHistoryRepository'
import MatchHistoryService from './MatchHistoryService'

describe('MatchHistoryService', () => {
  let MockedMatchHistoryRepository: MatchHistoryRepository
  let MockedRiotService: ReturnType<typeof createMockedRiotService>
  let matchHistoryService: MatchHistoryService

  beforeEach(() => {
    MockedMatchHistoryRepository = createMockedMatchHistoryRepository()
    MockedRiotService = createMockedRiotService()

    matchHistoryService = new MatchHistoryService(
      MockedMatchHistoryRepository,
      MockedRiotService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('read', () => {
    it('default', async () => {
      // Arrange
      // Act
      const result = await matchHistoryService.read('test_riot_puuid')

      // Assert
      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('_id', 'test_match_id')
      expect(result[1]).toHaveProperty('_id', 'test_match_id2')
    })
  })

  describe('refresh', () => {
    it('default', async () => {
      // Arrange
      MockedMatchHistoryRepository.readOne = jest.fn().mockResolvedValue(null)

      // Act
      await matchHistoryService.refresh('test_riot_puuid')

      // Assert
      expect(MockedMatchHistoryRepository.create).toHaveBeenCalledTimes(2)
    })
  })
})
