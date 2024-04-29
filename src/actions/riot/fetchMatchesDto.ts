import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPI.error'
import { riotInstance } from '../../apis/riotInstance'
import { MatchesDto } from '../../types/riot.dtos'

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
): Promise<MatchesDto> => {
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
    if ('status' in error.response.data) {
      const {
        status: { message, status_code: statusCode },
      } = error.response.data

      throw new RiotAPIError(statusCode, message)
    }

    throw new BaseError(500, 'fetchMatchesDto error')
  }
}
