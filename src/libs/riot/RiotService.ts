import { riotClientFactory } from './RiotCllientFactory'
import {
  AccountDto,
  LeagueEntryDto,
  MatchDto,
  MatchesDto,
  SummonerDto,
} from './types'

export class RiotService {
  private readonly kr = riotClientFactory.getClient('kr')

  private readonly asia = riotClientFactory.getClient('asia')

  public fetchAccount(
    gameName: string,
    tagLine: string = 'KR1',
  ): Promise<AccountDto> {
    return this.asia.get<AccountDto>(
      `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
    )
  }

  public fetchAccountByPuuid(riotPuuid: string): Promise<AccountDto> {
    return this.asia.get<AccountDto>(
      `/riot/account/v1/accounts/by-puuid/${riotPuuid}`,
    )
  }

  public fetchSummoner(riotPuuid: string): Promise<SummonerDto> {
    return this.kr.get(`/lol/summoner/v4/summoners/by-puuid/${riotPuuid}`)
  }

  public fetchLeagueEntry(summonerId: string): Promise<Array<LeagueEntryDto>> {
    return this.kr.get(`/lol/league/v4/entries/by-summoner/${summonerId}`)
  }

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
      `/riot/match/v5/matches/by-puuid/${riotPuuid}/ids?${queryString}`,
    )
  }

  public fetchMatch(matchId: string): Promise<MatchDto> {
    return this.asia.get<MatchDto>(`/lol/match/v5/matches/${matchId}`)
  }
}
