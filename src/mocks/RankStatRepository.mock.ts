import { IRankStat } from '../models/rankStat.model'
import RankStatRepository from '../repositories/RankStatRepository'

export const createMockedRankStatRepository = () =>
  ({
    create: jest
      .fn()
      .mockImplementation(({ summonerId, RANKED_SOLO_5x5, RANKED_FLEX_SR }) =>
        Promise.resolve({
          _id: summonerId,
          RANKED_SOLO_5x5,
          RANKED_FLEX_SR,
          lastUpdatedAt: new Date(),
        } as IRankStat),
      ),
    read: jest.fn().mockImplementation((summonerId: string) =>
      Promise.resolve({
        _id: summonerId,
        RANKED_SOLO_5x5: {
          leagueId: 'test_league_id',
          tier: 'test_tier',
          rank: 'test_rank',
          leaguePoints: 100,
          wins: 100,
          losses: 100,
        },
        RANKED_FLEX_SR: {
          leagueId: 'test_league_id',
          tier: 'test_tier',
          rank: 'test_rank',
          leaguePoints: 100,
          wins: 100,
          losses: 100,
        },
        lastUpdatedAt: new Date(),
      } as IRankStat),
    ),
    update: jest
      .fn()
      .mockImplementation((summonerId, { RANKED_SOLO_5x5, RANKED_FLEX_SR }) =>
        Promise.resolve({
          _id: summonerId,
          RANKED_SOLO_5x5,
          RANKED_FLEX_SR,
          lastUpdatedAt: new Date(),
        } as IRankStat),
      ),
  }) as unknown as jest.Mocked<RankStatRepository>
