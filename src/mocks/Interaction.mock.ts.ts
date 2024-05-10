import { CommandInteraction } from 'discord.js'

export const getCommandInteractionMock = () =>
  ({
    isCommand: jest.fn(),
    commandName: '',
    deferReply: jest.fn(),
    editReply: jest.fn(),
    client: {
      ws: {
        ping: 100,
      },
    },
  }) as unknown as CommandInteraction
