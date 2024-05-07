import { champions } from '../constants/champions'
import { IMatchHistory } from '../models/matchHistory.model'
import { elapsedTime } from '../utils/elapsedTime'
import { basicSummonerView } from './BasicSummonerView'
import SummonerView, { SummonerViewDto } from './SummonerView'

export interface DetailedSummonerViewDto extends SummonerViewDto {
  matchHistories: Array<IMatchHistory>
}

class DetailedSummonerView implements SummonerView {
  createEmbed(dto: DetailedSummonerViewDto) {
    const { summoner, rankStat, matchHistories } = dto

    const basicEmbed = basicSummonerView.createEmbed({ summoner, rankStat })

    if (!matchHistories || matchHistories.length === 0) return basicEmbed

    let WIN_AND_TYPE = ''
    let CHAMPION = ''
    let KDA_AND_TIME = ''

    let rankedGameCount = 0
    let rankedGameWinCount = 0

    matchHistories.forEach((match) => {
      rankedGameCount++

      if (match.win) rankedGameWinCount++

      const KDA = `${match.kills}/${match.deaths}/${match.assists}`

      const gameType =
        match.gameType === 'RANKED_SOLO_5x5'
          ? '개인/2인랭크'
          : match.gameType === 'RANKED_FLEX_SR'
            ? '자유랭크'
            : '정보 없음'

      WIN_AND_TYPE += `${match.win ? '✅ 승' : '❌ 패'} ${gameType}\n`
      CHAMPION += `${champions[match.championName]}\n`
      KDA_AND_TIME += `${KDA.padEnd(12, '\u00A0')} (${elapsedTime(match.gameEndTimestamp)})\n`
    })

    if (rankedGameCount > 0) {
      basicEmbed.addFields({
        name: '랭크 게임 전적',
        value: `\`${rankedGameCount}전 ${rankedGameWinCount}승 ${rankedGameCount - rankedGameWinCount}패\` (${Math.round(
          (rankedGameWinCount / rankedGameCount) * 100,
        )}%)`,
      })
    }

    basicEmbed.addFields(
      {
        name: '최근 전적',
        value: WIN_AND_TYPE,
        inline: true,
      },
      {
        name: '\u200B',
        value: CHAMPION,
        inline: true,
      },
      {
        name: '\u200B',
        value: KDA_AND_TIME,
        inline: true,
      },
    )

    return basicEmbed
  }
}

export const detailedSummonerView = new DetailedSummonerView()

export default DetailedSummonerView
