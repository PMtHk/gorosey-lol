import Summoner from '../models/summoner.model'
import { dbConnect } from '../mongoose'
import { accountV1, summonerV4 } from './riot'

export const findSummoner = async (
  inputGameName: string,
  inputTagLine: string,
) => {
  try {
    if (!inputGameName || !inputTagLine) {
      throw new Error('소환사명과 태그를 입력해주세요.')
    }

    const account = await accountV1(inputGameName, inputTagLine)

    if ('error' in account) {
      throw new Error('존재하지 않는 소환사입니다.')
    }

    const { riotPuuid, gameName, tagLine } = account

    await dbConnect()

    let summoner = await Summoner.findById(riotPuuid)

    if (!summoner) {
      const summonerInfo = await summonerV4(riotPuuid)

      if ('error' in summonerInfo) {
        throw new Error('소환사 정보를 불러올 수 없습니다.')
      }

      const newSummoner = {
        _id: riotPuuid,
        gameName,
        tagLine,
        summonerId: summonerInfo.summonerId,
        summonerLevel: summonerInfo.summonerLevel,
        profileIconId: summonerInfo.profileIconId,
      }

      summoner = await Summoner.create(newSummoner)
    } else if (summoner.lastUpdatedAt < Date.now() - 1000 * 60 * 60 * 6) {
      const summonerInfo = await summonerV4(riotPuuid)

      if ('error' in summonerInfo) {
        throw new Error('소환사 정보를 불러올 수 없습니다.')
      }

      const updatedSummoner = {
        riotPuuid,
        gameName,
        tagLine,
        summonerId: summonerInfo.summonerId,
        summonerLevel: summonerInfo.summonerLevel,
        profileIconId: summonerInfo.profileIconId,
        lastUpdatedAt: Date.now(),
      }

      summoner = await Summoner.findByIdAndUpdate(riotPuuid, updatedSummoner, {
        new: true,
      })
    }

    return summoner
  } catch (error) {
    console.log(error)
    return {
      error: error.message,
    }
  }
}
