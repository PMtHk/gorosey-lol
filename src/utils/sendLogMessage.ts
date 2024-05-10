import {
  Client,
  MessagePayload,
  MessageCreateOptions,
  Message,
  TextChannel,
} from 'discord.js'

export function sendLogMessage(
  client: Client<true>,
  message: string | MessagePayload | MessageCreateOptions,
): Promise<Message<true>> {
  const alertChannel = client.channels.cache.get(
    process.env.ALERT_CHANNEL_CHAT_CHANNELID,
  ) as TextChannel

  return alertChannel.send(message)
}
