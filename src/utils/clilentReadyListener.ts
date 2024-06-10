import { Client } from 'discord.js'
import commands from '../commands'
import { startWatch } from '../schedules/startWatch'
import updateServerCount from './updateServerCount'

export default async function clientReadyListener(client: Client<true>) {
  try {
    if (!client.application) return

    console.log(process.env.NODE_ENV)
    if (process.env.NODE_ENV === 'production')
      setInterval(
        async () => await updateServerCount(client.guilds.cache.size),
        1000 * 60 * 60, // 1 hour
      )

    // create slashCommands
    for await (const command of commands)
      await client.application.commands.create(command)

    startWatch(client)
  } catch (error) {
    console.log('clientReadyListener error: ', error)
  }
}
