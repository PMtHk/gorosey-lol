import clientReadyListener from './clilentReadyListener'
import commands from '../commands'
import { getClientMock } from '../mocks/client.mock'

describe('clientReadyListener', () => {
  const client = getClientMock()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("end if client.application doesn't exist", async () => {
    // Arrange
    client.application = null

    // Act
    const result = await clientReadyListener(client)

    // Assert
    expect(result).toBeUndefined()
  })

  it('should create clashCommands', async () => {
    // Arrange

    // Act
    await clientReadyListener(client)

    // Assert
    expect(client.application.commands.create).toHaveBeenCalledTimes(
      commands.length,
    )
  })

  it('should send a ready message', async () => {})
})
