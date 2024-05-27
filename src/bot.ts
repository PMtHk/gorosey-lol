import * as dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import slashCommandHandler from './utils/interactionListener'
import clientReadyListener from './utils/clilentReadyListener'
import guildDeleteListener from './utils/guildDeleteListener'
import guildCreateListener from './utils/guildCreateListener'

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

client.once(Events.ClientReady, clientReadyListener)

client.on(Events.InteractionCreate, slashCommandHandler)

client.on(Events.GuildCreate, guildCreateListener)

client.on(Events.GuildDelete, guildDeleteListener)

export const initBot = () => {
  client.login(DISCORD_TOKEN)
}
