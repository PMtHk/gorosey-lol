import RankStat from '../models/rankStat.model'
import Summoner from '../models/summoner.model'
import { dbConnect } from '../mongoose'
import { accountV1, leagueV4, summonerV4 } from './riot'

export const updateSummoner = async (
  inputGameName: string,
  inputTagLine: string = 'KR1',
) => {
  try {
    await dbConnect()

    if (!inputGameName || !inputTagLine)
      throw new Error('소환사명과 태그를 입력해주세요.')

    const riotAccount = await accountV1(inputGameName, inputTagLine)
    if ('error' in riotAccount) throw new Error('존재하지 않는 소환사입니다.')

    const { gameName, tagLine, riotPuuid } = riotAccount

    const fetchedSummonerInfo = await summonerV4(riotPuuid)
    if ('error' in fetchedSummonerInfo)
      throw new Error('소환사 정보를 불러올 수 없습니다.')

    const { summonerId } = fetchedSummonerInfo

    const fetchedRankStat = await leagueV4(summonerId)
    if ('error' in fetchedRankStat)
      throw new Error('랭크 정보를 불러올 수 없습니다.')

    const existingSummoner = await Summoner.findById(riotPuuid)

    if (existingSummoner) {
      await Summoner.findByIdAndUpdate(riotPuuid, {
        summonerLevel: fetchedSummonerInfo.summonerLevel,
        profileIconId: fetchedSummonerInfo.profileIconId,
        lastUpdatedAt: Date.now(),
      })

      await RankStat.findByIdAndUpdate(summonerId, {
        RANKED_SOLO_5x5: fetchedRankStat.RANKED_SOLO_5x5,
        RANKED_FLEX_SR: fetchedRankStat.RANKED_FLEX_SR,
        lastUpdatedAt: Date.now(),
      })
    } else {
      await Summoner.create({
        _id: riotPuuid,
        gameName: gameName,
        tagLine: tagLine,
        summonerId: fetchedSummonerInfo.summonerId,
        summonerLevel: fetchedSummonerInfo.summonerLevel,
        profileIconId: fetchedSummonerInfo.profileIconId,
        lastUpdatedAt: Date.now(),
      })

      await RankStat.create({
        _id: summonerId,
        RANKED_SOLO_5x5: fetchedRankStat.RANKED_SOLO_5x5,
        RANKED_FLEX_SR: fetchedRankStat.RANKED_FLEX_SR,
        lastUpdatedAt: Date.now(),
      })
    }

    return {
      success: true,
    }
  } catch (error) {
    return {
      error: error.message,
    }
  }
}
