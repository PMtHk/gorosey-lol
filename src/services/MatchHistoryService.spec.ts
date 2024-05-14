import { createMockedMatchHistoryRepository } from '../mocks/MatchHistoryRepository.mock'
import { createMockedRiotService } from '../mocks/RiotService.mock'
import MatchHistoryService from './MatchHistoryService'

describe('MatchHistoryService', () => {
  const MockedMatchHistoryRepository = createMockedMatchHistoryRepository()
  const MockedRiotService = createMockedRiotService()

  const matchHistoryService = new MatchHistoryService(
    MockedMatchHistoryRepository,
    MockedRiotService,
  )

  describe('read', () => {
    it('default', async () => {
      const result = await matchHistoryService.read('test_riot_puuid')

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('_id', 'test_match_id')
      expect(result[1]).toHaveProperty('_id', 'test_match_id2')
    })
  })

  describe('refresh', () => {
    it('default', async () => {
      MockedMatchHistoryRepository.readOne = jest.fn().mockResolvedValue(null)

      await matchHistoryService.refresh('test_riot_puuid')

      expect(MockedMatchHistoryRepository.create).toHaveBeenCalledTimes(2)
    })
  })
})
