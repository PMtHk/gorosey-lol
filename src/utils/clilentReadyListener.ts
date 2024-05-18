import { Client } from 'discord.js'
import commands from '../commands'
import { startWatch } from '../temps/startWatch'

export default async function clientReadyListener(client: Client<true>) {
  try {
    if (!client.application) return

    // create slashCommands
    for await (const command of commands)
      await client.application.commands.create(command)

    startWatch(client)

    // sendLogMessage(client, {
    //   embeds: [
    //     new EmbedBuilder()
    //       .setColor(COLORS.embedColor.success)
    //       .setDescription('고로시롤이 준비되었습니다.')
    //       .setTimestamp(),
    //   ],
    // })
  } catch (error) {
    console.log('clientReadyListener error: ', error)
  }
}
