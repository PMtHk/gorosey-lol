import MatchHistoryRepository from '../repositories/MatchHistoryRepository'

export const createMockedMatchHistoryRepository = () =>
  ({
    create: jest
      .fn()
      .mockImplementation(
        ({
          riotPuuid,
          matchId,
          assists,
          championName,
          deaths,
          gameEndTimestamp,
          gameType,
          kills,
          position,
          totalMinionsKilled,
          visionScore,
          win,
        }) =>
          Promise.resolve({
            _id: matchId,
            riotPuuid,
            assists,
            championName,
            deaths,
            gameEndTimestamp,
            gameType,
            kills,
            position,
            totalMinionsKilled,
            visionScore,
            win,
          }),
      ),

    read: jest.fn().mockImplementation((riotPuuid: string) =>
      Promise.resolve([
        {
          _id: 'test_match_id',
          riotPuuid,
          assists: 1,
          championName: 'test_champion_name',
          deaths: 1,
          gameEndTimestamp: 1,
          gameType: 'test_game_type',
          kills: 1,
          position: 'test_position',
          totalMinionsKilled: 1,
          visionScore: 1,
          win: true,
        },
        {
          _id: 'test_match_id2',
          riotPuuid,
          assists: 2,
          championName: 'test_champion_name2',
          deaths: 2,
          gameEndTimestamp: 2,
          gameType: 'test_game_type2',
          kills: 2,
          position: 'test_position2',
          totalMinionsKilled: 2,
          visionScore: 2,
          win: false,
        },
      ]),
    ),

    readOne: jest
      .fn()
      .mockImplementation((riotPuuid: string, matchId: string) =>
        Promise.resolve({
          _id: matchId,
          riotPuuid,
          assists: 1,
          championName: 'test_champion_name',
          deaths: 1,
          gameEndTimestamp: 1,
          gameType: 'test_game_type',
          kills: 1,
          position: 'test_position',
          totalMinionsKilled: 1,
          visionScore: 1,
          win: true,
        }),
      ),
  }) as unknown as jest.Mocked<MatchHistoryRepository>
