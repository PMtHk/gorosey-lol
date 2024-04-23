import { Client, GatewayIntentBits } from 'discord.js'

const { DISCORD_TOKEN } = process.env

if (!DISCORD_TOKEN) {
  throw new Error('Discord token is missing')
}

const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits

const client = new Client({
  intents: [Guilds, GuildMessages, MessageContent],
})

client.login(DISCORD_TOKEN)

client.on('ready', () => {
  console.log(`Logged in as ${client.user?.tag}`)
})
