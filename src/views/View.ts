import { MessagePayload, InteractionUpdateOptions } from 'discord.js'

export interface ViewDto {}

export default abstract class View {
  abstract createReply(
    dto: ViewDto,
  ): string | MessagePayload | InteractionUpdateOptions
}
