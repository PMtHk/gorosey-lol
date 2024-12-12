import { RiotErrorDto } from './types'

export class RiotApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'RiotApiError'
  }

  public static isRiotApiError(error: unknown): error is RiotApiError {
    return error instanceof RiotApiError
  }
}

export function isRiotErrorDto(data: unknown): data is RiotErrorDto {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    typeof (data as RiotErrorDto).status === 'object' &&
    'message' in (data as RiotErrorDto).status &&
    'status_code' in (data as RiotErrorDto).status
  )
}
