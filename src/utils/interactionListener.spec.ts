import { CommandInteraction, Interaction } from 'discord.js'
import slashCommandHandler from './interactionListener'
import { getCommandInteractionMock } from '../mocks/Interaction.mock'

describe('interactionLister', () => {
  let interactionMock: CommandInteraction

  beforeEach(() => {
    interactionMock = getCommandInteractionMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should not proceed if command is not a command', async () => {
    // Arrange
    interactionMock.isCommand = jest.fn().mockReturnValue(false)

    // Act
    await slashCommandHandler(interactionMock as Interaction)

    // Assert
    expect(interactionMock.deferReply).not.toHaveBeenCalled()
  })

  it('should not procceed if command is not found', async () => {
    // Arrange
    interactionMock.isCommand = jest.fn().mockReturnValue(true)
    interactionMock.commandName = 'non-existing command'

    // Act
    await slashCommandHandler(interactionMock as Interaction)

    // Assert
    expect(interactionMock.deferReply).not.toHaveBeenCalled()
  })

  it('should proceed if command is found', async () => {
    // Arrange
    interactionMock.isCommand = jest.fn().mockReturnValue(true)
    interactionMock.commandName = '핑'

    // Act
    await slashCommandHandler(interactionMock as Interaction)

    // Assert
    expect(interactionMock.deferReply).toHaveBeenCalled()
  })
})
