import ChannelRepository from '../repositories/ChannelRepository'

export const createMockedChannelRepository = () =>
  ({
    create: jest.fn().mockImplementation((guildId: string, channelId: string) =>
      Promise.resolve({
        _id: guildId,
        textChannel: channelId,
        watchList: [],
      }),
    ),

    read: jest.fn().mockImplementation((guildId: string) =>
      Promise.resolve({
        _id: guildId,
        textChannel: 'test_text_channel',
        watchList: ['puuid1'],
      }),
    ),

    update: jest
      .fn()
      .mockImplementation(
        (guildId: string, newWatchList: string[], newTextChannel?: string) =>
          Promise.resolve({
            _id: guildId,
            textChannel: newTextChannel || 'test_text_channel',
            watchList: newWatchList,
            lastUpdatedAt: new Date(),
          }),
      ),

    findAll: jest.fn().mockImplementation(() =>
      Promise.resolve([
        {
          _id: 'test_guild_id',
          textChannel: 'test_text_channel',
          watchList: ['puuid1'],
        },
        {
          _id: 'test_guild_id2',
          textChannel: 'test_text_channel2',
          watchList: ['puuid2'],
        },
      ]),
    ),
  }) as unknown as jest.Mocked<ChannelRepository>
