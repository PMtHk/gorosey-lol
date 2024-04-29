import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPIError'
import { riotInstance } from '../../apis/riotInstance'
import { LeagueEntriesDto, LeagueEntryDto } from '../../types/riot.dtos'

export const fetchLeagueEntriesDto = async (
  summonerId: string,
): Promise<LeagueEntriesDto> => {
  try {
    const response = await riotInstance.kr.get<LeagueEntriesDto>(
      `/lol/league/v4/entries/by-summoner/${summonerId}`,
    )

    return response.data
  } catch (error) {
    if ('status' in error.response.data) {
      const {
        status: { message, status_code: statusCode },
      } = error.response.data

      throw new RiotAPIError(statusCode, message + ' - fetchLeagueEntriesDto')
    }

    throw new BaseError(500, 'fetchLeagueEntriesDto error')
  }
}

export const fetchLeagueStats = async (summonerId: string) => {
  try {
    const response = await fetchLeagueEntriesDto(summonerId)

    // eslint-disable-next-line @typescript-eslint/naming-convention
    let RANKED_SOLO_5x5 = null
    let RANKED_FLEX_SR = null

    if (!response)
      return {
        RANKED_SOLO_5x5,
        RANKED_FLEX_SR,
      }

    response.forEach((leagueEntry: LeagueEntryDto) => {
      if (leagueEntry.queueType === 'RANKED_SOLO_5x5') {
        RANKED_SOLO_5x5 = {
          leagueId: leagueEntry.leagueId,
          tier: leagueEntry.tier,
          rank: leagueEntry.rank,
          leaguePoints: leagueEntry.leaguePoints,
          wins: leagueEntry.wins,
          losses: leagueEntry.losses,
        }
      } else if (leagueEntry.queueType === 'RANKED_FLEX_SR') {
        RANKED_FLEX_SR = {
          leagueId: leagueEntry.leagueId,
          tier: leagueEntry.tier,
          rank: leagueEntry.rank,
          leaguePoints: leagueEntry.leaguePoints,
          wins: leagueEntry.wins,
          losses: leagueEntry.losses,
        }
      }
    })

    return {
      RANKED_SOLO_5x5,
      RANKED_FLEX_SR,
    }
  } catch (error) {
    if (error instanceof BaseError) throw error

    throw new BaseError(500, 'fetchLeagueStats error')
  }
}
