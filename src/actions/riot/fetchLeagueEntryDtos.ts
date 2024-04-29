import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPI.error'
import { riotInstance } from '../../apis/riotInstance'
import { LeagueEntriesDto } from '../../types/riot.dtos'

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

      throw new RiotAPIError(statusCode, message)
    }

    throw new BaseError(
      500,
      '서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요.',
    )
  }
}
