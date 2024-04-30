import BaseError from '../../errors/BaseError'
import RiotAPIError from '../../errors/RiotAPIError'
import { riotInstance } from '../../apis/riotInstance'
import { AccountDto } from '../../types/riot.dtos'

export const fetchAccountDto = async (
  gameName: string,
  tagLine: string = 'KR1',
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

      throw new RiotAPIError(statusCode, message + ' - fetchAccountDto')
    }

    throw new BaseError(500, 'fetchAccountDto error')
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

      throw new RiotAPIError(statusCode, message + ' - fetchAccountDtoByPuuid')
    }

    throw new BaseError(500, 'fetchAccountDtoByPuuid error')
  }
}
