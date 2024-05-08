import { EmbedBuilder } from 'discord.js'

export abstract class CustomError extends Error {
  constructor(public message: string) {
    super(message)

    Error.captureStackTrace(this, this.constructor)
    console.log(
      `[${new Date().toLocaleString()}] ${this.constructor.name} | ${this.message}`,
    )
  }

  abstract StatusCode: number
  abstract createErrorEmbed(): EmbedBuilder
  // abstract logError(): void
}
