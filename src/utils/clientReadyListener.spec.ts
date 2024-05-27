import clientReadyListener from './clilentReadyListener'
import commands from '../commands'
import { getClientMock } from '../mocks/client.mock'
import * as StartWatch from '../schedules/startWatch'
import { Client } from 'discord.js'

describe('clientReadyListener', () => {
  let clientMock: Client<true>

  beforeEach(() => {
    clientMock = getClientMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create all clashCommands', async () => {
    // Arrange
    // Act
    await clientReadyListener(clientMock)

    expect(clientMock.application.commands.create).toHaveBeenCalledTimes(
      commands.length,
    )
  })

  it('should call startWatch', async () => {
    // Arrange
    const startWatchSpy = jest.spyOn(StartWatch, 'startWatch')

    // Act
    await clientReadyListener(clientMock)

    // Assert
    expect(startWatchSpy).toHaveBeenCalled()
  })

  it('should not proceed without client.application', async () => {
    // Arrange
    clientMock.application = null

    // Act
    const result = await clientReadyListener(clientMock)

    // Assert
    expect(result).toBeUndefined()
  })
})
