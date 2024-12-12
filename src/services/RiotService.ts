import { Service } from 'typedi'
import { BadRequestError } from '../errors/BadReqeustError'
import { SummonerNotFoundError } from '../errors/NotFoundError'
import { RiotAPIError } from '../errors/RiotAPIError'
import { UnexpectedError } from '../errors/UnexpectedError'
import {
  AccountDto,
  SummonerDto,
  LeagueEntryDto,
  MatchesDto,
  MatchDto,
} from '../types/riot.dtos'
import { riotInstance } from '../libs/riotInstance'

@Service()
export default class RiotService {
  public async fetchAccount(
    gameName: string,
    tagLine: string = 'KR1',
  ): Promise<AccountDto> {
    try {
      const response = await riotInstance.asia.get<AccountDto>(
        `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public async fetchAccountByPuuid(riotPuuid: string): Promise<AccountDto> {
    try {
      const response = await riotInstance.asia.get<AccountDto>(
        `/riot/account/v1/accounts/by-puuid/${riotPuuid}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public async fetchSummoner(riotPuuid: string): Promise<SummonerDto> {
    try {
      const response = await riotInstance.kr.get(
        `/lol/summoner/v4/summoners/by-puuid/${riotPuuid}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public async fetchLeagueEntry(
    summonerId: string,
  ): Promise<Array<LeagueEntryDto>> {
    try {
      const response = await riotInstance.kr.get(
        `/lol/league/v4/entries/by-summoner/${summonerId}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public async fetchMatches(
    riotPuuid: string,
    options?: {
      startTime?: number
      endTime?: number
      queue?: number
      type?: string
      start?: number
      count?: number
    },
  ): Promise<MatchesDto> {
    try {
      const params = {
        startTime: options.startTime ? options.startTime.toString() : '',
        endTime: options.endTime ? options.endTime.toString() : '',
        queue: options.queue ? options.queue.toString() : '',
        type: options.type ? options.type : '',
        start: options.start ? options.start.toString() : '',
        count: options.count ? options.count.toString() : '',
      }

      const queryString = new URLSearchParams(params)
      const response = await riotInstance.asia.get<MatchesDto>(
        `/lol/match/v5/matches/by-puuid/${riotPuuid}/ids?${queryString}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  public async fetchMatchData(matchId: string): Promise<MatchDto> {
    try {
      const response = await riotInstance.asia.get<MatchDto>(
        `/lol/match/v5/matches/${matchId}`,
      )

      return response.data
    } catch (error) {
      this.handleError(error)
    }
  }

  private handleError(error) {
    if ('status' in error.response.data) {
      const {
        status: { message, status_code: statusCode },
      } = error.response.data

      if (statusCode >= 500) throw new RiotAPIError(message)
      if (statusCode === 404) throw new SummonerNotFoundError(message)

      throw new BadRequestError(message)
    }

    throw new UnexpectedError(error.message)
  }
}
