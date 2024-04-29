import { EmbedBuilder } from 'discord.js'

export const ErrorEmbed = (title: string, description: string) => {
  return new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle(title)
    .setDescription(description)
}
