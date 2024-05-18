import { BadRequestError } from '../errors/BadReqeustError'
import { createMockedChannelRepository } from '../mocks/ChannelRepsitory.mock'
import ChannelRepository from '../repositories/ChannelRepository'
import ChannelService from './ChannelService'

let MockedChannelRepository: ChannelRepository
let channelService: ChannelService

beforeEach(() => {
  MockedChannelRepository = createMockedChannelRepository()
  channelService = new ChannelService(MockedChannelRepository)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('ChannelService', () => {
  describe('getWatchList', () => {
    it('채널 정보가 DB에 있는 경우', async () => {
      // Arrange
      // Act
      const result = await channelService.getWatchList('test_guild_id')

      // Assert
      expect(result).toEqual(['puuid1'])
    })

    it('채널 정보가 DB에 없는 경우', async () => {
      // Arrange
      MockedChannelRepository.read = jest.fn().mockResolvedValue(null)

      // Act
      const result = await channelService.getWatchList('non_existing_guild_id')

      // Assert
      expect(result).toEqual([])
    })
  })

  describe('addToWatchList', () => {
    it('정상적으로 추가하는 경우', async () => {
      // Arrange
      // Act
      const result = await channelService.addToWatchList(
        'test_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      // Assert
      expect(result).toEqual(['puuid1', 'puuid_to_add'])
    })

    it('채널 정보가 DB에 없는 경우', async () => {
      // Arrange
      MockedChannelRepository.read = jest.fn().mockResolvedValue(null)

      // Act
      const result = await channelService.addToWatchList(
        'non_existing_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      // Assert
      expect(result).toEqual(['puuid_to_add'])
    })

    it('이미 해당 puuid가 워치리스트 내에 존재하는 경우', async () => {
      // Arrange
      MockedChannelRepository.read = jest.fn().mockResolvedValue({
        _id: 'test_guild_id',
        textChannel: 'test_text_channel',
        watchList: ['puuid1', 'puuid_to_add'],
      })

      // Act
      const promise = channelService.addToWatchList(
        'test_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      // Assert
      expect(promise).rejects.toThrow(BadRequestError)
      expect(promise).rejects.toThrow(
        'ChannelService.addToWatchList() error: riotPuuidToAdd already exists in watchList.',
      )
    })

    it('워치리스트가 가득 찬 경우', async () => {
      // Arrange
      MockedChannelRepository.read = jest.fn().mockResolvedValue({
        _id: 'test_guild_id',
        textChannel: 'test_text_channel',
        watchList: ['puuid1', 'puuid2', 'puuid3'],
      })

      // Act
      const promise = channelService.addToWatchList(
        'test_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      // Assert
      expect(promise).rejects.toThrow(BadRequestError)
      expect(promise).rejects.toThrow(
        'ChannelService.addToWatchList() error: watchList is full.',
      )
    })
  })
})
