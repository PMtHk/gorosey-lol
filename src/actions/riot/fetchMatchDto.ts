import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPI.error'
import { riotInstance } from '../../apis/riotInstance'
import { MatchDto } from '../../types/riot.dtos'

export const fetchMatchDto = async (matchId: string): Promise<MatchDto> => {
  try {
    const response = await riotInstance.asia.get<MatchDto>(
      `/lol/match/v5/matches/${matchId}`,
    )

    return response.data
  } catch (error) {
    if ('status' in error.response.data) {
      const {
        status: { message, status_code: statusCode },
      } = error.response.data

      throw new RiotAPIError(statusCode, message)
    }

    throw new BaseError(500, 'fetchMatchDto error')
  }
}
