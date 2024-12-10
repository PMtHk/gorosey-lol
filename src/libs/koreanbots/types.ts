export interface UpdateBotStatDto {
  servers?: number
  shards?: number
}

export interface UpdateBotStatResponse {
  code: number
  version: number
  message: string
}
