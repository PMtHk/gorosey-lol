import { Client, EmbedBuilder } from 'discord.js'
import commands from '../commands'
import { startWatch } from '../temps/startWatch'
import { sendLogMessage } from './sendLogMessage'
import { COLORS } from '../constants/colors'

export default async function clientReadyListener(client: Client<true>) {
  if (!client.application) return

  // create slashCommands
  for await (const command of commands)
    await client.application.commands.create(command)

  startWatch(client)

  sendLogMessage(client, {
    embeds: [
      new EmbedBuilder()
        .setColor(COLORS.embedColor.success)
        .setDescription('고로시롤이 준비되었습니다.')
        .setTimestamp(),
    ],
  })
}
