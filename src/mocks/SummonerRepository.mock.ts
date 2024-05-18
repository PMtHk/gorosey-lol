import { ISummoner } from '../models/summoner.model'
import SummonerRepository from '../repositories/SummonerRepository'

export const createMockedSummonerRepository = () =>
  ({
    create: jest
      .fn()
      .mockImplementation(
        ({
          riotPuuid,
          gameName,
          tagLine,
          summonerId,
          summonerLevel,
          profileIconId,
        }) =>
          Promise.resolve({
            _id: riotPuuid,
            gameName,
            tagLine,
            summonerId,
            summonerLevel,
            profileIconId,
            lastUpdatedAt: new Date(),
          } as ISummoner),
      ),
    read: jest.fn().mockImplementation((riotPuuid: string) =>
      Promise.resolve({
        _id: riotPuuid,
        gameName: 'test_game_name',
        tagLine: 'test_tag_line',
        summonerId: 'test_summoner_id',
        summonerLevel: 1,
        profileIconId: 1,
        lastUpdatedAt: new Date(),
      } as ISummoner),
    ),
    update: jest.fn(
      ({
        riotPuuid,
        gameName,
        tagLine,
        summonerId,
        summonerLevel,
        profileIconId,
      }) =>
        ({
          _id: riotPuuid,
          gameName,
          tagLine,
          summonerId,
          summonerLevel,
          profileIconId,
          lastUpdatedAt: new Date(),
        }) as ISummoner,
    ),
  }) as unknown as jest.Mocked<SummonerRepository>
