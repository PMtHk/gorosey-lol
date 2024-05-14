import { createMockedRiotService } from '../mocks/RiotService.mock'
import { createMockedSummonerRepository } from '../mocks/SummonerRepository.mock'
import SummonerService from './SummonerService'

describe('SummonerService', () => {
  const MockedSummonerRepository = createMockedSummonerRepository()
  const MockedRiotService = createMockedRiotService()

  const summonerService = new SummonerService(
    MockedSummonerRepository,
    MockedRiotService,
  )

  describe('read', () => {
    it('existing summoner', async () => {
      const result = await summonerService.read('test_riot_puuid')

      expect(result).toHaveProperty('gameName', 'test_game_name')
      expect(result).toHaveProperty('tagLine', 'test_tag_line')
    })

    it('non-existing summoner', async () => {
      MockedSummonerRepository.read = jest.fn().mockResolvedValue(null)

      const result = await summonerService.read('test_riot_puuid')

      expect(result).toHaveProperty('gameName', 'fetched_game_name')
      expect(result).toHaveProperty('tagLine', 'fetched_tag_line')
    })
  })

  describe('refresh', () => {
    it('default', async () => {
      const result = await summonerService.refresh('test_riot_puuid')

      expect(result).toHaveProperty('gameName', 'fetched_game_name')
      expect(result).toHaveProperty('tagLine', 'fetched_tag_line')
    })
  })
})
