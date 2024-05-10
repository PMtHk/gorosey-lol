import { Interaction } from 'discord.js'
import commands from '../commands'

export default async function slashCommandHandler(interaction: Interaction) {
  if (!interaction.isCommand()) return

  const command = commands.find(({ name }) => name === interaction.commandName)

  if (!command) return

  await interaction.deferReply()
  command.execute(interaction)
}
