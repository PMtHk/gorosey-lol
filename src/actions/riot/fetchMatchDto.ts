import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPIError'
import { riotInstance } from '../../apis/riotInstance'
import { MatchDto } from '../../types/riot.dtos'
import { Lane } from '../../types/lol.types'

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

export const fetchMatchHistory = async (matchId: string, riotPuuid: string) => {
  try {
    const response = await fetchMatchDto(matchId)

    const { info } = response

    const { participants, gameEndTimestamp, gameType } = info

    const targetPlayer = participants.find(
      (participant) => participant.puuid === riotPuuid,
    )

    const {
      assists,
      championName,
      deaths,
      individualPosition,
      kills,
      teamPosition,
      totalMinionsKilled,
      visionScore,
      win,
    } = targetPlayer

    const position = (teamPosition || individualPosition) as Lane

    return {
      assists,
      championName,
      deaths,
      gameEndTimestamp,
      gameType,
      kills,
      position,
      totalMinionsKilled,
      visionScore,
      win,
    }
  } catch (error) {
    if (error instanceof BaseError) {
      throw error
    }

    throw new BaseError(500, 'fetchMatchHistory error')
  }
}
