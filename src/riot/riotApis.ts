import { riotInstance } from './riotInstance'
import {
  AccountDto,
  ResponseError,
  SummonerDto,
  MatchesDto,
  MatchDto,
  LeagueEntryDto,
} from '../types/riot.dtos'

export const fetchAccountDto = async (
  gameName: string,
  tagLine: string,
): Promise<AccountDto | ResponseError> => {
  const response = await riotInstance.asia.get<AccountDto | ResponseError>(
    `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
  )

  return response.data
}

export const fetchAccountDtoByPuuid = async (
  riotPuuid: string,
): Promise<AccountDto | ResponseError> => {
  const response = await riotInstance.asia.get<AccountDto | ResponseError>(
    `/riot/account/v1/accounts/by-puuid/${riotPuuid}`,
  )

  return response.data
}

export const fetchSummonerDto = async (
  riotPuuid: string,
): Promise<SummonerDto | ResponseError> => {
  const response = await riotInstance.kr.get<SummonerDto | ResponseError>(
    `/lol/summoner/v4/summoners/by-puuid/${riotPuuid}`,
  )

  return response.data
}

export const fetchMatchesDto = async (
  riotPuuid: string,
  options?: {
    startTime?: number
    endTime?: number
    queue?: number
    type?: string
    start?: number
    count?: number
  },
): Promise<MatchesDto | ResponseError> => {
  const params = {
    startTime: options.startTime ? options.startTime.toString() : '',
    endTime: options.endTime ? options.endTime.toString() : '',
    queue: options.queue ? options.queue.toString() : '',
    type: options.type ? options.type : '',
    start: options.start ? options.start.toString() : '',
    count: options.count ? options.count.toString() : '',
  }

  const queryString = new URLSearchParams(params)
  const response = await riotInstance.asia.get<MatchesDto | ResponseError>(
    `/lol/match/v5/matches/by-puuid/${riotPuuid}/ids?${queryString}`,
  )

  return response.data
}

export const fetchMatchDto = async (
  matchId: string,
): Promise<MatchDto | ResponseError> => {
  const response = await riotInstance.asia.get<MatchDto | ResponseError>(
    `/lol/match/v5/matches/${matchId}`,
  )

  return response.data
}

export const fetchAccountDtos = async (
  summonerId: string,
): Promise<LeagueEntryDto[] | ResponseError> => {
  const response = await riotInstance.kr.get<LeagueEntryDto[] | ResponseError>(
    `/lol/league/v4/entries/by-summoner/${summonerId}`,
  )

  return response.data
}
