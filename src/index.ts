import {
  Client,
  Events,
  GatewayIntentBits,
  Interaction,
  TextChannel,
} from 'discord.js'
import commands from './commands'

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

    // send message
    console.log('info: bot is ready')

    const textChannel = client.channels.cache.get(
      ALERT_CHANNEL_CHAT_CHANNELID,
    ) as TextChannel

    textChannel.send('[GOROSEY] BOT IS READY!')
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

client.on(Events.Error, (error) => {
  const textChannel = client.channels.cache.get(
    ALERT_CHANNEL_CHAT_CHANNELID,
  ) as TextChannel

  textChannel.send(`[GOROSEY] ERROR: ${error.message}`)
})

client.login(DISCORD_TOKEN)
