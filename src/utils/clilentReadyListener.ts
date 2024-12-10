import { Client } from 'discord.js'
import commands from '../commands'
import { startWatch } from '../schedules/startWatch'
import updateServerCount from './updateServerCount'

const UPDATE_SERVER_COUNT_INTERVAL = 1000 * 60 * 60 * 24 // 24시간

function createSlashCommands(client: Client) {
  return Promise.all(
    commands.map((command) => client.application.commands.create(command)),
  )
}

export default async function clientReadyListener(client: Client) {
  console.log('Bot is starting')

  try {
    if (!client.application) {
      console.error('client.application is not available')
      return
    }

    if (process.env.NODE_ENV === 'production') {
      const { cache } = client.guilds

      setInterval(
        async () => await updateServerCount(cache.size),
        UPDATE_SERVER_COUNT_INTERVAL,
      )
    }

    await createSlashCommands(client)

    startWatch(client)
  } catch (error) {
    console.error('clientReadyListener error: ', error)
  } finally {
    console.log('Bot is ready')
  }
}
