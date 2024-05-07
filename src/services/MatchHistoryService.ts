import { IMatchHistory } from '../models/matchHistory.model'
import { matchHistoryRepository } from '../repositories/MatchHistoryRepository'
import { Lane } from '../types/lol.types'
import { MatchDto } from '../types/riot.dtos'
import { riotService } from './RiotService'

class MatchHistoryService {
  public async read(riotPuuid: string): Promise<Array<IMatchHistory>> {
    const matchHistories = await matchHistoryRepository.read(riotPuuid)

    return matchHistories
  }

  public async refresh(riotPuuid: string): Promise<Array<IMatchHistory>> {
    const soloMatchInfos = await this.getRecentMatchInfos(
      riotPuuid,
      'RANKED_SOLO_5x5',
    )
    const flexMatchInfos = await this.getRecentMatchInfos(
      riotPuuid,
      'RANKED_FLEX_SR',
    )

    console.log(soloMatchInfos)

    const matchInfos = soloMatchInfos.concat(flexMatchInfos)

    for await (const matchInfo of matchInfos) {
      await matchHistoryRepository.create({
        ...matchInfo,
      })
    }

    return this.read(riotPuuid)
  }

  private async getRecentMatchInfos(
    riotPuuid: string,
    type: 'RANKED_SOLO_5x5' | 'RANKED_FLEX_SR',
  ) {
    const startTime =
      Date.parse(new Date(new Date().setHours(0, 0, 0, 0)).toString()) -
      1000 * 60 * 60 * 24 * 3

    const gameType = {
      RANKED_SOLO_5x5: 420,
      RANKED_FLEX_SR: 440,
    }

    const matchInfos = []

    const matchIds = await riotService.fetchMatches(riotPuuid, {
      startTime: Math.round(startTime / 1000),
      queue: gameType[type],
      count: 100,
    })

    for await (const matchId of matchIds) {
      const alreadyExist = await matchHistoryRepository.readOne(
        riotPuuid,
        matchId,
      )

      if (alreadyExist) continue

      const matchDto = await riotService.fetchMatchData(matchId)
      const infos = this.extractInfos(riotPuuid, matchDto)

      matchInfos.push({
        ...infos,
        gameType: type,
      })
    }

    return matchInfos
  }

  private extractInfos(
    riotPuuid: string,
    matchDto: MatchDto,
  ): {
    riotPuuid: string
    matchId: string
    assists: number
    championName: string
    deaths: number
    gameEndTimestamp: number
    gameType: string
    kills: number
    position: Lane
    totalMinionsKilled: number
    visionScore: number
    win: boolean
  } {
    const {
      info: { participants, gameEndTimestamp, gameType },
      metadata: { matchId },
    } = matchDto

    const targetPlayer = participants.find(
      (participant) => participant.puuid === riotPuuid,
    )

    const {
      assists,
      championName,
      deaths,
      individualPosition,
      kills,
      teamPosition,
      totalMinionsKilled,
      visionScore,
      win,
    } = targetPlayer

    const position = (teamPosition || individualPosition) as Lane

    return {
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
    }
  }
}

export const matchHistoryService = new MatchHistoryService()

export default MatchHistoryService
