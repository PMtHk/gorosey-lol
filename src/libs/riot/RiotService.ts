import { riotClientFactory } from './RiotCllientFactory'
import {
  AccountDto,
  LeagueEntryDto,
  MatchDto,
  MatchesDto,
  SummonerDto,
} from './types'
import { Service } from 'typedi'

@Service()
export class RiotService {
  private readonly kr = riotClientFactory.getClient('kr')

  private readonly asia = riotClientFactory.getClient('asia')

  // 1000 requests every 1 minutes
  // 16.67 requests every 1 seconds
  public fetchAccount(
    gameName: string,
    tagLine: string = 'KR1',
  ): Promise<AccountDto> {
    return this.asia.get<AccountDto>(
      `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
    )
  }

  // 1000 requests every 1 minutes
  // 16.67 requests every 1 seconds
  public fetchAccountByPuuid(riotPuuid: string): Promise<AccountDto> {
    return this.asia.get<AccountDto>(
      `/riot/account/v1/accounts/by-puuid/${riotPuuid}`,
    )
  }

  // 1600 requests every 1 minutes
  // 26.67 requests every 1 seconds
  public fetchSummoner(riotPuuid: string): Promise<SummonerDto> {
    return this.kr.get(`/lol/summoner/v4/summoners/by-puuid/${riotPuuid}`)
  }

  // 100 requests every 1 minutes
  // 1.67 requests every 1 seconds
  public fetchLeagueEntry(summonerId: string): Promise<Array<LeagueEntryDto>> {
    return this.kr.get(`/lol/league/v4/entries/by-summoner/${summonerId}`)
  }

  // 2000 requests every 10 seconds
  // 200 requests every 1 seconds
  public fetchMatches(
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
    const params = {
      startTime: options.startTime ? options.startTime.toString() : '',
      endTime: options.endTime ? options.endTime.toString() : '',
      queue: options.queue ? options.queue.toString() : '',
      type: options.type ? options.type : '',
      start: options.start ? options.start.toString() : '',
      count: options.count ? options.count.toString() : '',
    }

    const queryString = new URLSearchParams(params)
    return this.asia.get<MatchesDto>(
      `/lol/match/v5/matches/by-puuid/${riotPuuid}/ids?${queryString}`,
    )
  }

  // 2000 requests every 10 seconds
  // 200 requests every 1 seconds
  public fetchMatch(matchId: string): Promise<MatchDto> {
    return this.asia.get<MatchDto>(`/lol/match/v5/matches/${matchId}`)
  }
}
