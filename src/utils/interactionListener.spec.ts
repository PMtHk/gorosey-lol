import { Interaction } from 'discord.js'
import slashCommandHandler from './interactionListener'
import { getCommandInteractionMock } from '../mocks/Interaction.mock'

describe('interactionLister', () => {
  const interaction = getCommandInteractionMock()

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

  it('should return if it is not a command', async () => {
    // Arrange
    interaction.isCommand = jest.fn().mockReturnValue(false)

    // Act
    await slashCommandHandler(interaction as Interaction)

    // Assert
    expect(interaction.deferReply).not.toHaveBeenCalled()
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
