import { IRankStat } from '../models/rankStat.model'
import { dbConnect } from '../mongoose'
import { rankStatRepository } from '../repositories/RankStatRepository'
import { riotService } from './RiotService'

export default class RankStatService {
  summonerId: string

  rankStat: IRankStat

  constructor(summonerId: string) {
    this.summonerId = summonerId
  }

  async init(): Promise<void> {
    await dbConnect()

    this.rankStat = await rankStatRepository.read(this.summonerId)

    if (!this.rankStat) {
      const leagueEntryInfo = await riotService.fetchLeagueEntry(
        this.summonerId,
      )

      const SOLO = leagueEntryInfo.find(
        (entry) => entry.queueType === 'RANKED_SOLO_5x5',
      )

      const FLEX = leagueEntryInfo.find(
        (entry) => entry.queueType === 'RANKED_FLEX_SR',
      )

      // create new rankStat
      this.rankStat = await rankStatRepository.create({
        summonerId: this.summonerId,
        RANKED_SOLO_5x5: SOLO
          ? {
              leagueId: SOLO.leagueId,
              tier: SOLO.tier,
              rank: SOLO.rank,
              leaguePoints: SOLO.leaguePoints,
              wins: SOLO.wins,
              losses: SOLO.losses,
            }
          : null,
        RANKED_FLEX_SR: FLEX
          ? {
              leagueId: FLEX.leagueId,
              tier: FLEX.tier,
              rank: FLEX.rank,
              leaguePoints: FLEX.leaguePoints,
              wins: FLEX.wins,
              losses: FLEX.losses,
            }
          : null,
      })
    }
  }

  async refresh(): Promise<void> {
    const leagueEntryInfo = await riotService.fetchLeagueEntry(this.summonerId)

    const SOLO = leagueEntryInfo.find(
      (entry) => entry.queueType === 'RANKED_SOLO_5x5',
    )

    const FLEX = leagueEntryInfo.find(
      (entry) => entry.queueType === 'RANKED_FLEX_SR',
    )

    this.rankStat = await rankStatRepository.update(this.summonerId, {
      RANKED_SOLO_5x5: SOLO
        ? {
            leagueId: SOLO.leagueId,
            tier: SOLO.tier,
            rank: SOLO.rank,
            leaguePoints: SOLO.leaguePoints,
            wins: SOLO.wins,
            losses: SOLO.losses,
          }
        : null,
      RANKED_FLEX_SR: FLEX
        ? {
            leagueId: FLEX.leagueId,
            tier: FLEX.tier,
            rank: FLEX.rank,
            leaguePoints: FLEX.leaguePoints,
            wins: FLEX.wins,
            losses: FLEX.losses,
          }
        : null,
    })
  }
}
