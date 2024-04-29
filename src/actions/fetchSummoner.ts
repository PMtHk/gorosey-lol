import { DEFAULT_REFRESH_TIME } from '../constants/refreshTime'
import Summoner from '../models/summoner.model'
import { dbConnect } from '../mongoose'
import { accountV1 } from './riot'
import { updateSummoner } from './updateSummoner'

export const fetchSummoner = async (
  inputGameName: string,
  inputTagLine: string = 'KR1',
) => {
  try {
    await dbConnect()

    if (!inputGameName || !inputTagLine)
      throw new Error('소환사명과 태그를 입력해주세요.')

    const riotAccount = await accountV1(inputGameName, inputTagLine)
    if ('error' in riotAccount) throw new Error('존재하지 않는 소환사입니다.')

    const { riotPuuid, gameName, tagLine } = riotAccount

    let summoner = await Summoner.findById(riotPuuid).populate(
      'summonerId',
      'RANKED_SOLO_5x5 RANKED_FLEX_SR',
    )

    if (
      !summoner ||
      summoner.lastUpdatedAt < new Date(Date.now() - DEFAULT_REFRESH_TIME)
    ) {
      await updateSummoner(gameName, tagLine)

      summoner = await Summoner.findById(riotPuuid).populate(
        'summonerId',
        'RANKED_SOLO_5x5 RANKED_FLEX_SR',
      )
    }

    return summoner
  } catch (error) {
    return {
      error: error.message,
    }
  }
}

export const fetchSummonerByPuuid = async (puuid: string) => {
  await dbConnect()

  const summoner = await Summoner.findById(puuid).populate(
    'summonerId',
    'RANKED_SOLO_5x5 RANKED_FLEX_SR',
  )

  if (!summoner) return undefined

  const {
    _id: riotPuuid,
    gameName,
    tagLine,
    profileIconId,
    lastUpdatedAt,
    // 'RANKED_SOLO_5x5' and 'RANKED_FLEX_SR' are riot api's response
    // eslint-disable-next-line @typescript-eslint/naming-convention
    summonerId: { RANKED_SOLO_5x5, RANKED_FLEX_SR },
  } = summoner

  return {
    riotPuuid,
    gameName,
    tagLine,
    profileIconId,
    lastUpdatedAt,
    RANKED_SOLO_5x5: RANKED_SOLO_5x5.leagueId ? RANKED_SOLO_5x5 : null,
    RANKED_FLEX_SR: RANKED_FLEX_SR.leagueId ? RANKED_FLEX_SR : null,
  }
}
