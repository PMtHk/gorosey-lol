import { Client, GatewayIntentBits, Interaction } from 'discord.js'
import commands from './commands'
import { SlashCommand } from './types/SlashCommand'

const { DISCORD_TOKEN } = process.env
if (!DISCORD_TOKEN) {
  throw new Error('[ENV] DISCORD_TOKEN을 불러올 수 없습니다.')
}

const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits

const client = new Client({
  intents: [Guilds, GuildMessages, MessageContent],
})

const startBot = async () => {
  await client.login(DISCORD_TOKEN)
  console.info('info: login success!')

  // command 등록
  client.on('ready', async () => {
    if (client.application) {
      commands.forEach(async (command: SlashCommand) => {
        await client.application.commands.create(command)
        console.log(`info: command ${command.name} registered`)
      })
    }
  })

  // 핸들링 로직 추가
  client.on('interactionCreate', async (interaction: Interaction) => {
    if (interaction.isCommand()) {
      // 등록한 명령어를 찾아서
      const currentCommand = commands.find(
        ({ name }) => name === interaction.commandName,
      )

      if (currentCommand) {
        await interaction.deferReply()
        // 실행해준다.
        currentCommand.execute(client, interaction)
        console.log(`info: command ${currentCommand.name} handled correctly`)
      }
    }
  })
}

startBot()
