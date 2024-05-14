import { Service } from 'typedi'
import { IRankStat } from '../models/rankStat.model'
import RankStatRepository from '../repositories/RankStatRepository'
import RiotService from './RiotService'

@Service()
export default class RankStatService {
  constructor(
    private rankStatRepository: RankStatRepository,
    private riotService: RiotService,
  ) {}

  public async read(summonerId: string): Promise<IRankStat> {
    const rankStat = await this.rankStatRepository.read(summonerId)

    if (!rankStat) {
      const { solos, flexes } = await this.getRecentRankStat(summonerId)

      const createdRankStat = await this.rankStatRepository.create({
        summonerId: summonerId,
        RANKED_SOLO_5x5: solos
          ? {
              leagueId: solos.leagueId,
              tier: solos.tier,
              rank: solos.rank,
              leaguePoints: solos.leaguePoints,
              wins: solos.wins,
              losses: solos.losses,
            }
          : null,
        RANKED_FLEX_SR: flexes
          ? {
              leagueId: flexes.leagueId,
              tier: flexes.tier,
              rank: flexes.rank,
              leaguePoints: flexes.leaguePoints,
              wins: flexes.wins,
              losses: flexes.losses,
            }
          : null,
      })

      return createdRankStat
    }

    return rankStat
  }

  public async refresh(summonerId: string): Promise<IRankStat> {
    const { solos, flexes } = await this.getRecentRankStat(summonerId)

    const updatedRankStat = await this.rankStatRepository.update(summonerId, {
      RANKED_SOLO_5x5: solos
        ? {
            leagueId: solos.leagueId,
            tier: solos.tier,
            rank: solos.rank,
            leaguePoints: solos.leaguePoints,
            wins: solos.wins,
            losses: solos.losses,
          }
        : null,
      RANKED_FLEX_SR: flexes
        ? {
            leagueId: flexes.leagueId,
            tier: flexes.tier,
            rank: flexes.rank,
            leaguePoints: flexes.leaguePoints,
            wins: flexes.wins,
            losses: flexes.losses,
          }
        : null,
    })

    return updatedRankStat
  }

  private async getRecentRankStat(summonerId: string) {
    const leagueEntryInfo = await this.riotService.fetchLeagueEntry(summonerId)

    const solos = leagueEntryInfo.find(
      (entry) => entry.queueType === 'RANKED_SOLO_5x5',
    )

    const flexes = leagueEntryInfo.find(
      (entry) => entry.queueType === 'RANKED_FLEX_SR',
    )

    return { solos, flexes }
  }
}
