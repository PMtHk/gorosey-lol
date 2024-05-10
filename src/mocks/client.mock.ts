import { Client, TextChannel } from 'discord.js'

export function getTextChannelMock() {
  return {
    send: jest.fn(),
  } as unknown as TextChannel
}

export function getClientMock() {
  return {
    application: {
      commands: {
        create: jest.fn(),
      },
    },
    channels: {
      cache: {
        get: jest.fn().mockReturnValue(getTextChannelMock()),
      },
    },
  } as unknown as Client<true>
}
