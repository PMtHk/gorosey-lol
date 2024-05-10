import clientReadyListener from './clilentReadyListener'
import commands from '../commands'
import { getClientMock, getTextChannelMock } from '../mocks/client.mock'

describe('clientReadyListener', () => {
  const client = getClientMock()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create all clashCommands', async () => {
    // Arrange
    client.channels.cache.get = jest.fn().mockReturnValue(getTextChannelMock())

    // Act
    await clientReadyListener(client)

    // Assert
    expect(client.application.commands.create).toHaveBeenCalledTimes(
      commands.length,
    )
  })

  it("end if client.application doesn't exist", async () => {
    // Arrange
    client.application = null

    // Act
    const result = await clientReadyListener(client)

    // Assert
    expect(result).toBeUndefined()
  })
})
