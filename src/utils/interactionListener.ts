import { Interaction } from 'discord.js'
import commands from '../commands'

export default async function slashCommandHandler(interaction: Interaction) {
  try {
    console.log('slashCommandHandler started')
    if (!interaction.isCommand()) {
      console.warn('interaction is not a command')
      return
    }

    const command = commands.find(
      ({ name }) => name === interaction.commandName,
    )

    if (!command) {
      console.warn('command not found')
      return
    }

    await interaction.deferReply()
    command.execute(interaction)
    console.log('slashCommandHandler executed')
  } catch (error) {
    console.log('slashCommandHandler error: ', error)
  }
}
