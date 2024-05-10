import { riotService } from './RiotService'
import { riotInstance } from '../utils/riotInstance'
import { SummonerNotFoundError } from '../errors/NotFoundError'
import { BadRequestError } from '../errors/BadReqeustError'
import { LeagueEntryDto } from '../types/riot.dtos'

describe('RiotService', () => {
  afterEach(() => {
    expect(riotInstance.asia.get).toHaveBeenCalled()
  })

  describe('fetchAccount', () => {
    it('존재하는 소환사명#태그', () => {
      const expected = {
        puuid: 'puuid_of_hide_on_bush',
        gameName: 'hide on bush',
        tagLine: 'KR1',
      }

      riotInstance.asia.get = jest.fn().mockResolvedValue({ data: expected })

      const promise = riotService.fetchAccount('hide on bush', 'KR1')
      expect(promise).resolves.toHaveProperty('puuid')
    })

    it('존재하지 않는 소환사명#태그', () => {
      riotInstance.asia.get = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            status: {
              status_code: 404,
              message:
                'Data not found - No results found for player with riot id non-existing#KR1',
            },
          },
        },
      })

      const promise = riotService.fetchAccount('non-existing', 'KR1')
      expect(promise).rejects.toThrow(SummonerNotFoundError)
    })
  })

  describe('fetchAccountByPuuid', () => {
    it('유효한 puuid', () => {
      const expected = {
        puuid: 'puuid_of_hide_on_bush',
        gameName: 'hide on bush',
        tagLine: 'KR1',
      }

      riotInstance.asia.get = jest
        .fn()
        .mockResolvedValueOnce({ data: expected })

      const promise = riotService.fetchAccountByPuuid('puuid_of_hide_on_bush')
      expect(promise).resolves.toHaveProperty('puuid')
    })

    it('유효하지 않은 puuid', () => {
      const input = {
        puuid: 'non-existing-puuid',
      }

      riotInstance.asia.get = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            status: {
              status_code: 400,
              message: 'Bad Request - Exception decrypting non-existing-puuid',
            },
          },
        },
      })

      const promise = riotService.fetchAccountByPuuid(input.puuid)
      expect(promise).rejects.toThrow(BadRequestError)
    })
  })

  describe('fetchSummoner', () => {
    it('유효한 puuid', () => {
      const expected = {
        id: 'id_of_hide_on_bush',
        accountId: 'account_id_of_hide_on_bush',
        puuid: 'puuid_of_hide_on_bush',
        profileIconId: 1234,
        revisionDate: 1234567890,
        summonerLevel: 123,
      }

      riotInstance.kr.get = jest.fn().mockResolvedValueOnce({ data: expected })

      const promise = riotService.fetchSummoner('puuid_of_hide_on_bush')
      expect(promise).resolves.toEqual(expected)
    })

    it('유효하지 않은 puuid', () => {
      riotInstance.kr.get = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            status: {
              status_code: 400,
              message: 'Bad Request - Exception decrypting non-existing-puuid',
            },
          },
        },
      })

      const promise = riotService.fetchSummoner('non-existing-puuid')
      expect(promise).rejects.toThrow(BadRequestError)
    })
  })

  describe('fetchLeagueEntry', () => {
    it('유효한 summonerId', () => {
      const expected = [
        {
          leagueId: 'league_id_of_hide_on_bush',
          summonerId: 'id_of_hide_on_bush',
          queueType: 'RANKED_SOLO_5x5',
          tier: 'CHALLENGER',
          rank: 'I',
          leaguePoints: 123,
          wins: 123,
          losses: 123,
          hotStreak: false,
          veteran: false,
          freshBlood: false,
          inactive: false,
        },
      ]

      riotInstance.kr.get = jest.fn().mockResolvedValueOnce({ data: expected })

      const promise = riotService.fetchLeagueEntry(
        'summoner_id_of_hide_on_bush',
      )
      expect(promise).resolves.toEqual(expected)
      expect(promise).resolves.toBeInstanceOf(Array<LeagueEntryDto>)
    })

    it('유효하지 않은 summonerId', () => {
      riotInstance.kr.get = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            status: {
              status_code: 400,
              message: 'Data not found - No results found for non-existing-id',
            },
          },
        },
      })

      const promise = riotService.fetchLeagueEntry('non-existing-id')
      expect(promise).rejects.toThrow(BadRequestError)
    })
  })

  describe('fetchMatches', () => {
    it('유효한 puuid', () => {
      riotInstance.asia.get = jest
        .fn()
        .mockResolvedValueOnce({ data: ['KR 1', 'KR 2', 'KR 3'] })

      const promise = riotService.fetchMatches('puuid_of_hide_on_bush', {
        count: 20,
      })
      expect(promise).resolves.toHaveProperty('length')
      expect(promise).resolves.toBeInstanceOf(Array)

      // can be empty array
      riotInstance.asia.get = jest.fn().mockResolvedValueOnce({ data: [] })

      const emptyPromise = riotService.fetchMatches('puuid_of_hide_on_bush', {
        count: 20,
      })
      expect(emptyPromise).resolves.toHaveProperty('length', 0)
      expect(emptyPromise).resolves.toBeInstanceOf(Array)
    })

    it('유효하지 않은 puuid', () => {
      riotInstance.asia.get = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            status: {
              status_code: 400,
              message: 'Bad Request - Exception decrypting non-existing-puuid',
            },
          },
        },
      })

      const promise = riotService.fetchMatches('non-existing-puuid', {
        count: 20,
      })
      expect(promise).rejects.toThrow(BadRequestError)
    })
  })

  describe('fetchMatchData', () => {
    it('유효한 matchId', () => {
      const expected = {
        metadata: {
          dataVersion: '1',
          matchId: 'match_id_of_hide_on_bush',
          participants: ['participant_1', 'participant_2'],
        },
        info: {
          gameCreation: 1234567890,
          gameDuration: 1234,
          gameId: 1234567890,
          gameMode: 'CLASSIC',
          gameName: 'game_name_of_hide_on_bush',
          gameStartTimestamp: 1234567890,
          gameType: 'MATCHED_GAME',
          gameVersion: '11.1.1',
          mapId: 11,
          participants: ['participant_1', 'participant_2'],
          platformId: 'KR',
          queueId: 420,
          teams: ['team_1', 'team_2'],
        },
      }

      riotInstance.asia.get = jest
        .fn()
        .mockResolvedValueOnce({ data: expected })

      const promise = riotService.fetchMatchData('match_id_of_hide_on_bush')
      expect(promise).resolves.toEqual(expected)
    })

    it('유효하지 않은 matchId', () => {
      riotInstance.asia.get = jest.fn().mockRejectedValueOnce({
        response: {
          data: {
            status: {
              status_code: 400,
              message:
                'Bad Request - Exception decrypting non-existing-match-id',
            },
          },
        },
      })

      const promise = riotService.fetchMatchData('non-existing-match-id')
      expect(promise).rejects.toThrow(BadRequestError)
    })
  })
})
