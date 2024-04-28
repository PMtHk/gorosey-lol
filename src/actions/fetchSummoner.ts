import Summoner from '../models/summoner.model'
import { dbConnect } from '../mongoose'
import { accountV1 } from './riot'
import { updateSummoner } from './updateSummoner'

export const fetchSummoner = async (
  inputGameName: string,
  inputTagLine: string,
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
      summoner.lastUpdatedAt < new Date(Date.now() - 1000 * 60 * 60 * 3)
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
