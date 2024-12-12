import { Interaction } from 'discord.js'
import { commands } from '../commands'
import { SlashCommand } from '../types/SlashCommand'

export async function interactionCreateListener(interaction: Interaction) {
  try {
    if (!interaction.isChatInputCommand()) {
      return
    }

    const matchingCommand = (command: SlashCommand) =>
      command.name === interaction.commandName

    const command = commands.find(matchingCommand)
    if (!command) {
      return
    }

    await interaction.deferReply()
    command.execute(interaction)
  } catch (error) {
    console.log('[InteractionCreate] ', error)
  }
}
