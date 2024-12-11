export interface UpdateBotStatDto {
  servers?: number
  shards?: number
}

export interface UpdateBotStatResponseDto {
  code: number
  version: number
  message: string
}
