import { ISummoner } from '../models/summoner.model'
import SummonerRepository from '../repositories/SummonerRepository'
import { AccountDto, SummonerDto } from '../types/riot.dtos'
import RiotService from './RiotService'
import SummonerService from './SummonerService'

describe('SummonerService', () => {
  const testSummoner = {
    _id: 'test_riot_puuid',
    gameName: 'test_game_name',
    tagLine: 'test_tag_line',
    summonerId: 'test_summoner_id',
    summonerLevel: 1,
    profileIconId: 1,
    lastUpdatedAt: new Date(),
  } as ISummoner

  const fetchedAccountDto = {
    puuid: 'fetched_riot_puuid',
    gameName: 'fetched_game_name',
    tagLine: 'fetched_tag_line',
  } as AccountDto

  const fetchedSummonerDto = {
    id: 'fetched_summoner_id',
    accountId: 'fetched_account_id',
    puuid: 'fetched_riot_puuid',
    profileIconId: 2,
    revisionDate: 2,
    summonerLevel: 2,
  } as SummonerDto

  const MockedSummonerRepository = {
    create: jest
      .fn()
      .mockImplementation(
        ({
          riotPuuid,
          gameName,
          tagLine,
          summonerId,
          summonerLevel,
          profileIconId,
        }) =>
          Promise.resolve({
            _id: riotPuuid,
            gameName,
            tagLine,
            summonerId,
            summonerLevel,
            profileIconId,
            lastUpdatedAt: new Date(),
          }),
      ),
    read: jest.fn().mockResolvedValue(null),
    update: jest.fn(
      ({
        riotPuuid,
        gameName,
        tagLine,
        summonerId,
        summonerLevel,
        profileIconId,
      }) => ({
        _id: riotPuuid,
        gameName,
        tagLine,
        summonerId,
        summonerLevel,
        profileIconId,
        lastUpdatedAt: new Date(),
      }),
    ),
  } as unknown as jest.Mocked<SummonerRepository>

  const MockedRiotService = {
    fetchAccountByPuuid: jest.fn().mockResolvedValue(fetchedAccountDto),
    fetchSummoner: jest.fn().mockResolvedValue(fetchedSummonerDto),
  } as unknown as jest.Mocked<RiotService>

  const summonerService = new SummonerService(
    MockedSummonerRepository,
    MockedRiotService,
  )

  describe('read', () => {
    it('non-existing summoner', async () => {
      const result = await summonerService.read('test_riot_puuid')

      expect(result).toHaveProperty('gameName', 'fetched_game_name')
      expect(result).toHaveProperty('tagLine', 'fetched_tag_line')
      expect(result).toHaveProperty('profileIconId', 2)
    })

    it('existing summoner', async () => {
      MockedSummonerRepository.read = jest.fn().mockResolvedValue(testSummoner)

      const result = await summonerService.read('test_riot_puuid')

      expect(result).toHaveProperty('gameName', 'test_game_name')
      expect(result).toHaveProperty('tagLine', 'test_tag_line')
      expect(result).toHaveProperty('profileIconId', 1)
    })
  })

  describe('refresh', () => {
    it('default', async () => {
      const result = await summonerService.refresh('test_riot_puuid')

      expect(result).toHaveProperty('gameName', 'fetched_game_name')
      expect(result).toHaveProperty('tagLine', 'fetched_tag_line')
      expect(result).toHaveProperty('profileIconId', 2)
    })
  })
})
