import { CommandInteraction, ChatInputApplicationCommandData } from 'discord.js'

export type SlashCommand = ChatInputApplicationCommandData & {
  name: string
  description: string
  // locales?: {
  //   [key: string]: {
  //     name: string
  //     description: string
  //     options?: ChatInputApplicationCommandData['options']
  //   }
  // }
  execute: (interaction: CommandInteraction) => void
}
