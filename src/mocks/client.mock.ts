import { Client, TextChannel } from 'discord.js'

export const getTextChannelMock = () =>
  ({
    send: jest.fn(),
  }) as unknown as TextChannel

export const getClientMock = () =>
  ({
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
  }) as unknown as Client<true>
