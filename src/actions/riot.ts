import { QueueType } from '../types/lol.types'
import {
  AccountDto,
  LeagueEntryDto,
  MatchDto,
  ParticipantDto,
  ResponseError,
  SummonerDto,
} from '../types/riot.dtos'

const { RIOT_API_KEY } = process.env

if (!RIOT_API_KEY) throw new Error('[ENV] RIOT_API_KEY를 불러올 수 없습니다.')

const BASE_URL = {
  ASIA: 'https://asia.api.riotgames.com',
  KR: 'https://kr.api.riotgames.com',
}

const MATCH_TYPE: Record<QueueType, number> = {
  RANKED_SOLO_5x5: 420,
  RANKED_FLEX_SR: 440,
}

// /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
export const accountV1 = async (_gameName: string, _tagLine: string) => {
  const requestPath = `/riot/account/v1/accounts/by-riot-id/${_gameName}/${_tagLine}`
  const response: Response = await fetch(`${BASE_URL.ASIA}${requestPath}`, {
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
    cache: 'force-cache',
  })

  const AccountInfo: AccountDto | ResponseError = await response.json()

  if ('status' in AccountInfo)
    return {
      error: AccountInfo.status.message,
    }

  return {
    riotPuuid: AccountInfo.puuid,
    gameName: AccountInfo.gameName,
    tagLine: AccountInfo.tagLine,
  }
}

export const accountV1ByPuuid = async (riotPuuid: string) => {
  const requestPath = `/riot/account/v1/accounts/by-puuid/${riotPuuid}`
  const response: Response = await fetch(`${BASE_URL.ASIA}${requestPath}`, {
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  })

  const AccountInfo: AccountDto | ResponseError = await response.json()

  if ('status' in AccountInfo)
    return {
      error: AccountInfo.status.message,
    }

  return {
    riotPuuid: AccountInfo.puuid,
    gameName: AccountInfo.gameName,
    tagLine: AccountInfo.tagLine,
  }
}

// /lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}
export const summonerV4 = async (riotPuuid: string) => {
  const requestPath = `/lol/summoner/v4/summoners/by-puuid/${riotPuuid}`
  const response = await fetch(`${BASE_URL.KR}${requestPath}`, {
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  })

  const SummonerInfo: SummonerDto | ResponseError = await response.json()

  if ('status' in SummonerInfo)
    return {
      error: SummonerInfo.status.message,
    }

  return {
    riotPuuid: SummonerInfo.puuid,
    summonerId: SummonerInfo.id,
    accountId: SummonerInfo.accountId,
    summonerName: SummonerInfo.name,
    summonerLevel: SummonerInfo.summonerLevel,
    revisionDate: SummonerInfo.revisionDate,
    profileIconId: SummonerInfo.profileIconId,
  }
}

export const matchesV5 = async (riotPuuid: string, queue: QueueType) => {
  const params = {
    startTime: (Math.floor(Date.now() / 1000) - 60 * 60 * 24 * 1).toString(),
    queue: MATCH_TYPE[queue].toString(),
    start: '0',
    count: '100', // 최대 30개
  }

  const queryString = new URLSearchParams(params)

  const requestPath = `/lol/match/v5/matches/by-puuid/${riotPuuid}/ids?${queryString}`
  const response = await fetch(`${BASE_URL.ASIA}${requestPath}`, {
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  })

  const matchIdList: string[] | ResponseError = await response.json()

  if ('status' in matchIdList)
    return {
      error: matchIdList.status.message,
    }

  return matchIdList
}

export const matchV5 = async (matchId: string, riotPuuid: string) => {
  const requestPath = `/lol/match/v5/matches/${matchId}`
  const response = await fetch(`${BASE_URL.ASIA}${requestPath}`, {
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  })

  const matchInfo: MatchDto | ResponseError = await response.json()

  if ('status' in matchInfo)
    return {
      error: matchInfo.status.message,
    }

  const {
    info: { participants, gameEndTimestamp, queueId },
  } = matchInfo

  const targetPlayer = participants.find(
    (participant: ParticipantDto) => participant.puuid === riotPuuid,
  )

  const {
    championName,
    kills,
    deaths,
    assists,
    win,
    teamPosition,
    individualPosition,
    totalMinionsKilled,
    visionScore,
  } = targetPlayer

  let type: QueueType = 'RANKED_SOLO_5x5'

  switch (queueId) {
    case 420:
      type = 'RANKED_SOLO_5x5'
      break
    case 440:
      type = 'RANKED_FLEX_SR'
      break
    default:
      return
  }

  const result = {
    type,
    championName,
    kills,
    deaths,
    assists,
    win,
    position: teamPosition || individualPosition,
    totalMinionsKilled,
    visionScore,
    gameEndTimestamp,
  }

  return result
}

export const leagueV4 = async (summonerId: string) => {
  const requestPath = `/lol/league/v4/entries/by-summoner/${summonerId}`
  const response = await fetch(`${BASE_URL.KR}${requestPath}`, {
    method: 'GET',
    headers: {
      'X-Riot-Token': RIOT_API_KEY,
    },
  })

  const leagueInfo: LeagueEntryDto[] | ResponseError = await response.json()

  if ('status' in leagueInfo)
    return {
      error: leagueInfo.status.message,
    }

  const SOLO = leagueInfo.find(
    (elem: LeagueEntryDto) => elem.queueType === 'RANKED_SOLO_5x5',
  )

  const FLEX = leagueInfo.find(
    (elem: LeagueEntryDto) => elem.queueType === 'RANKED_FLEX_SR',
  )

  let filteredSOLO = null
  let filteredFLEX = null

  if (SOLO) {
    filteredSOLO = {
      leagueId: SOLO.leagueId,
      tier: SOLO.tier,
      rank: SOLO.rank,
      leaguePoints: SOLO.leaguePoints,
      wins: SOLO.wins,
      losses: SOLO.losses,
    }
  }

  if (FLEX) {
    filteredFLEX = {
      leagueId: FLEX.leagueId,
      tier: FLEX.tier,
      rank: FLEX.rank,
      leaguePoints: FLEX.leaguePoints,
      wins: FLEX.wins,
      losses: FLEX.losses,
    }
  }

  return {
    RANKED_SOLO_5x5: filteredSOLO,
    RANKED_FLEX_SR: filteredFLEX,
  }
}
