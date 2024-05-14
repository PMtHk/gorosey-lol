import { BadRequestError } from '../errors/BadReqeustError'
import { createMockedChannelRepository } from '../mocks/ChannelRepsitory.mock'
import ChannelService from './ChannelService'

let MockedChannelRepository = createMockedChannelRepository()
let channelService = new ChannelService(MockedChannelRepository)

afterEach(() => {
  MockedChannelRepository = createMockedChannelRepository()
  channelService = new ChannelService(MockedChannelRepository)
})

describe('ChannelService', () => {
  describe('getWatchList', () => {
    it('채널 정보가 DB에 있는 경우', async () => {
      const result = await channelService.getWatchList('test_guild_id')

      expect(result).toEqual(['puuid1'])
    })

    it('채널 정보가 DB에 없는 경우', async () => {
      MockedChannelRepository.read = jest.fn().mockResolvedValue(null)

      const result = await channelService.getWatchList('non_existing_guild_id')

      expect(result).toEqual([])
    })
  })

  describe('addToWatchList', () => {
    it('정상적으로 추가하는 경우', async () => {
      const result = await channelService.addToWatchList(
        'test_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      expect(result).toEqual(['puuid1', 'puuid_to_add'])
    })

    it('채널 정보가 DB에 없는 경우', async () => {
      MockedChannelRepository.read = jest.fn().mockResolvedValue(null)

      const result = await channelService.addToWatchList(
        'non_existing_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      expect(result).toEqual(['puuid_to_add'])
    })

    it('이미 해당 puuid가 워치리스트 내에 존재하는 경우', async () => {
      MockedChannelRepository.read = jest.fn().mockResolvedValue({
        _id: 'test_guild_id',
        textChannel: 'test_text_channel',
        watchList: ['puuid1', 'puuid_to_add'],
      })

      const promise = channelService.addToWatchList(
        'test_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      expect(promise).rejects.toThrow(BadRequestError)
      expect(promise).rejects.toThrow(
        'ChannelService.addToWatchList() error: riotPuuidToAdd already exists in watchList.',
      )
    })

    it('워치리스트가 가득 찬 경우', async () => {
      MockedChannelRepository.read = jest.fn().mockResolvedValue({
        _id: 'test_guild_id',
        textChannel: 'test_text_channel',
        watchList: ['puuid1', 'puuid2', 'puuid3'],
      })

      const promise = channelService.addToWatchList(
        'test_guild_id',
        'test_text_channel',
        'puuid_to_add',
      )

      expect(promise).rejects.toThrow(BadRequestError)
      expect(promise).rejects.toThrow(
        'ChannelService.addToWatchList() error: watchList is full.',
      )
    })
  })
})