import * as dotenv from 'dotenv'
import { Client, Events, GatewayIntentBits } from 'discord.js'
import slashCommandHandler from './utils/interactionListener'
import clientReadyListener from './utils/clilentReadyListener'
import guildDeleteListener from './utils/guildDeleteListener'
import guildCreateListener from './utils/guildCreateListener'

dotenv.config()

const ERRORS = {
  DISCORD_TOKEN_MISSING: '[ENV] DISCORD_TOKEN 이 정의되지 않았습니다.',
} as const

const INTENTS = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
] as const

const { DISCORD_TOKEN } = process.env

if (!DISCORD_TOKEN) {
  console.error(ERRORS.DISCORD_TOKEN_MISSING)
  process.exit(1)
}

const client = new Client({
  intents: INTENTS,
})

client.once(Events.ClientReady, clientReadyListener)
client.on(Events.InteractionCreate, slashCommandHandler)
client.on(Events.GuildCreate, guildCreateListener)
client.on(Events.GuildDelete, guildDeleteListener)

export function initBot(): void {
  client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error('[BOT] 로그인 실패:', error)
    process.exit(1)
  })
}
