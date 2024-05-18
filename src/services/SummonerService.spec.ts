import { createMockedRiotService } from '../mocks/RiotService.mock'
import { createMockedSummonerRepository } from '../mocks/SummonerRepository.mock'
import SummonerRepository from '../repositories/SummonerRepository'
import RiotService from './RiotService'
import SummonerService from './SummonerService'

describe('SummonerService', () => {
  let MockedSummonerRepository: SummonerRepository
  let MockedRiotService: RiotService
  let summonerService: SummonerService

  beforeEach(() => {
    MockedSummonerRepository = createMockedSummonerRepository()
    MockedRiotService = createMockedRiotService()

    summonerService = new SummonerService(
      MockedSummonerRepository,
      MockedRiotService,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

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
