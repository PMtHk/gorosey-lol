import { MessageCreateOptions, MessagePayload, TextChannel } from 'discord.js'
import { sendLogMessage } from './sendLogMessage'
import { getClientMock } from '../mocks/client.mock'

describe('sendLogMessage', () => {
  const client = getClientMock()

  it('should be sent with message', () => {
    // Arrange
    const message = 'message to send' as
      | string
      | MessagePayload
      | MessageCreateOptions
    const alertChannel = client.channels.cache.get('123') as TextChannel
    sendLogMessage(client, message)

    // Assert
    expect(client.channels.cache.get).toHaveBeenCalled()
    expect(alertChannel.send).toHaveBeenCalledWith(message)
  })
})
