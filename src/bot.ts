import {
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
  TextChannel,
} from 'discord.js'
import commands from './commands'
// import { startWatch } from './actions/startWatch'

import * as dotenv from 'dotenv'
import { startWatch } from './temps/startWatch'

dotenv.config()

const { DISCORD_TOKEN, ALERT_CHANNEL_CHAT_CHANNELID } = process.env
if (!DISCORD_TOKEN) {
  throw new Error('[ENV] DISCORD_TOKEN을 불러올 수 없습니다.')
}

if (!ALERT_CHANNEL_CHAT_CHANNELID) {
  throw new Error('[ENV] ALERT_CHANNEL_CHAT_CHANNELID를 불러올 수 없습니다.')
}

const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits

const client = new Client({
  intents: [Guilds, GuildMessages, MessageContent],
})

client.once(Events.ClientReady, async () => {
  if (client.application) {
    // create commands
    for await (const command of commands) {
      await client.application.commands.create(command)
    }

    const alertChannel = client.channels.cache.get(
      ALERT_CHANNEL_CHAT_CHANNELID,
    ) as TextChannel

    startWatch(client)

    alertChannel.send('고로시롤이 준비되었습니다!')
  }
})

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (interaction.isCommand()) {
    const command = commands.find(
      ({ name }) => name === interaction.commandName,
    )

    if (command) {
      await interaction.deferReply()
      command.execute(client, interaction)
    }
  }
})

export const initBot = () => {
  client.login(DISCORD_TOKEN)
}
