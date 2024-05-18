import RiotService from '../services/RiotService'

export const createMockedRiotService = () =>
  ({
    fetchAccount: jest.fn().mockResolvedValue({
      puuid: 'fetched_riot_puuid',
      gameName: 'fetched_game_name',
      tagLine: 'fetched_tag_line',
    }),

    fetchAccountByPuuid: jest.fn().mockResolvedValue({
      puuid: 'fetched_riot_puuid',
      gameName: 'fetched_game_name',
      tagLine: 'fetched_tag_line',
    }),

    fetchSummoner: jest.fn().mockResolvedValue({
      id: 'fetched_summoner_id',
      accountId: 'fetched_account_id',
      puuid: 'fetched_riot_puuid',
      profileIconId: 1,
      revisionDate: 1,
      summonerLevel: 1,
    }),

    fetchLeagueEntry: jest.fn().mockResolvedValue([
      {
        leagueId: 'fetched_league_id',
        summonerId: 'fetched_summoner_id',
        queueType: 'RANKED_SOLO_5x5',
        tier: 'IRON',
        rank: 'I',
        leaguePoints: 0,
        wins: 0,
        losses: 0,
        hotStreak: false,
        veteran: false,
        freshBlood: false,
        inactive: false,
      },
      {
        leagueId: 'fetched_league_id',
        summonerId: 'fetched_summoner_id',
        queueType: 'RANKED_FLEX_SR',
        tier: 'IRON',
        rank: 'I',
        leaguePoints: 0,
        wins: 0,
        losses: 0,
        hotStreak: false,
        veteran: false,
        freshBlood: false,
        inactive: false,
      },
    ]),

    fetchMatches: jest.fn().mockImplementation((riotPuuid, { queue }) => {
      if (queue === 420) {
        return Promise.resolve(['KR_SOLO_1'])
      }

      if (queue === 440) {
        return Promise.resolve(['KR_FLEX_1'])
      }
    }),

    fetchMatchData: jest.fn().mockImplementation((matchId: string) => {
      if (matchId === 'KR_SOLO_1') {
        return Promise.resolve({
          metadata: {
            dataVersion: '1',
            matchId: 'KR_SOLO_1',
            participants: ['test_riot_puuid', 'another_riot_puuid'],
          },
          info: {
            gameEndTimestamp: 1,
            gameType: 'MATCHED_GAME',
            participants: [
              {
                puuid: 'test_riot_puuid',
                assists: 0,
                championName: 'Aatrox',
                deaths: 0,
                individualPosition: 'TOP',
                kills: 0,
                teamPosition: 'TOP',
                totalMinionsKilled: 0,
                visionScore: 0,
                win: true,
              },
            ],
          },
        })
      }

      if (matchId === 'KR_FLEX_1') {
        return Promise.resolve({
          metadata: {
            dataVersion: '1',
            matchId: 'KR_FLEX_1',
            participants: ['test_riot_puuid', 'another_riot_puuid'],
          },
          info: {
            gameEndTimestamp: 1,
            gameType: 'MATCHED_GAME',
            participants: [
              {
                puuid: 'test_riot_puuid',
                assists: 0,
                championName: 'Aatrox',
                deaths: 0,
                individualPosition: 'TOP',
                kills: 0,
                teamPosition: 'TOP',
                totalMinionsKilled: 0,
                visionScore: 0,
                win: true,
              },
            ],
          },
        })
      }
    }),
  }) as unknown as jest.Mocked<RiotService>
