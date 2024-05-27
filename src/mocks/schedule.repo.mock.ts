import ScheduleRepository from '../repositories/schedule.repo'

export const createMockedScheduleRepository = () =>
  ({
    findAll: jest.fn().mockImplementation((time: string) =>
      Promise.resolve([
        {
          _id: '1111111111',
          guildId: {
            _id: 'guildId_111',
            textChannel: 'textChannel_111',
            watchList: ['riotPuuid_111_1, riotPuuid_111_2'],
            lastUpdatedAt: Date.now(),
          },
          time: time,
        },
        {
          _id: '222222222',
          guildId: {
            _id: 'guildId_222',
            textChannel: 'textChannel_222',
            watchList: ['riotPuuid_222_1, riotPuuid_222_2'],
            lastUpdatedAt: Date.now(),
          },
          time: time,
        },
        {
          _id: '3333333333',
          guildId: {
            _id: 'guildId_333',
            textChannel: 'textChannel_333',
            watchList: ['riotPuuid_333_1, riotPuuid_333_2'],
            lastUpdatedAt: Date.now(),
          },
          time: time,
        },
      ]),
    ),

    createMany: jest.fn().mockImplementation(() => Promise.resolve()),

    deleteMany: jest.fn().mockImplementation(() => Promise.resolve()),
  }) as unknown as jest.Mocked<ScheduleRepository>
