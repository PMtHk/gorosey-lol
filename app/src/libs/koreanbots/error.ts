export class KoreanBotsError extends Error {
  constructor(
    message: string,
    public code: number,
    public response: unknown,
  ) {
    super(message)
    this.name = 'KoreanBotsError'
  }
}
