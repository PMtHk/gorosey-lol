import { Client } from 'discord.js'
import commands from '../commands'
import { startWatch } from '../schedules/startWatch'

export default async function clientReadyListener(client: Client<true>) {
  try {
    if (!client.application) return

    // create slashCommands
    for await (const command of commands)
      await client.application.commands.create(command)

    startWatch(client)
  } catch (error) {
    console.log('clientReadyListener error: ', error)
  }
}
