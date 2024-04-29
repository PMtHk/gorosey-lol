import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPI.error'
import { riotInstance } from '../../apis/riotInstance'
import { AccountDto } from '../../types/riot.dtos'

export const fetchAccountDto = async (
  gameName: string,
  tagLine: string,
): Promise<AccountDto> => {
  try {
    const response = await riotInstance.asia.get<AccountDto>(
      `/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
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

export const fetchAccountDtoByPuuid = async (
  riotPuuid: string,
): Promise<AccountDto> => {
  try {
    const response = await riotInstance.asia.get<AccountDto>(
      `/riot/account/v1/accounts/by-puuid/${riotPuuid}`,
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
