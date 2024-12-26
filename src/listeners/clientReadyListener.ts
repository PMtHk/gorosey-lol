import { Client } from 'discord.js'
import Container from 'typedi'

import { commands } from '../commands'
import { UPDATE_SERVER_COUNT_INTERVAL, koreanBots } from '../libs/koreanbots'
import { WatchService } from '../services/WatchService'

function createSlashCommands(client: Client) {
  return Promise.all(
    commands.map((command) => client.application.commands.create(command)),
  )
}

export async function clientReadyListener(client: Client) {
  console.log('Bot is starting')

  try {
    const watchService = Container.get(WatchService)

    if (!client.application) {
      console.error('client.application is not available')
      return
    }

    if (process.env.NODE_ENV === 'production') {
      const { cache } = client.guilds

      setInterval(
        async () => await koreanBots.updateStats({ servers: cache.size }),
        UPDATE_SERVER_COUNT_INTERVAL,
      )
    }

    await createSlashCommands(client)

    watchService.setClient(client)
    watchService.startWatch()
  } catch (error) {
    console.error('[ClientReady] ', error)
  } finally {
    console.log('Bot is ready')
  }
}
