import { QueueType } from '../types/lol.types'
import {
  AccountDto,
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

  if ('status' in AccountInfo) throw new Error(AccountInfo.status.message)

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

  if ('status' in SummonerInfo) throw new Error(SummonerInfo.status.message)

  return {
    riotPuuid: SummonerInfo.puuid,
    summonerId: SummonerInfo.id,
    accountId: SummonerInfo.accoundId,
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

  if ('status' in matchIdList) throw new Error(matchIdList.status.message)

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

  if ('status' in matchInfo) throw new Error(matchInfo.status.message)

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
