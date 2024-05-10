import { CommandInteraction, Interaction } from 'discord.js'
import slashCommandHandler from './interactionListener'

describe('interactionLister', () => {
  // interaction.client.ws.ping
  const interaction = {
    isCommand: jest.fn(),
    commandName: '',
    deferReply: jest.fn(),
    editReply: jest.fn(),
    client: {
      ws: {
        ping: 100,
      },
    },
  } as unknown as CommandInteraction

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('existing commands should be handled properly', async () => {
    // Arrange
    interaction.isCommand = jest.fn().mockReturnValue(true)
    interaction.commandName = '핑'

    // Act
    await slashCommandHandler(interaction as Interaction)

    // Assert
    expect(interaction.deferReply).toHaveBeenCalled()
  })

  it("non-existing commands shouldn't be handled", async () => {
    // Arrage
    interaction.isCommand = jest.fn().mockReturnValue(true)
    interaction.commandName = 'non-existing command'

    // Act
    await slashCommandHandler(interaction as Interaction)

    // Assert
    expect(interaction.deferReply).not.toHaveBeenCalled()
  })
})
