import mongoose from 'mongoose'

export interface IRankStat {
  _id: string
  RANKED_SOLO_5x5: {
    leagueId: string
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  } | null
  RANKED_FLEX_SR: {
    leagueId: string
    tier: string
    rank: string
    leaguePoints: number
    wins: number
    losses: number
  } | null
  lastUpdatedAt: Date
}

const rankStatSchema = new mongoose.Schema<IRankStat>({
  // 랭크 정보는 summonerId로 불러올 수 있기 때문에
  // summonerId를 _id로 사용
  _id: { type: String },

  RANKED_SOLO_5x5: {
    leagueId: { type: String },
    tier: { type: String, default: 'UNRANKED' },
    rank: { type: String, default: 'UNRANKED' },
    leaguePoints: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },
  RANKED_FLEX_SR: {
    leagueId: { type: String },
    tier: { type: String, default: 'UNRANKED' },
    rank: { type: String, default: 'UNRANKED' },
    leaguePoints: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },

  lastUpdatedAt: { type: Date, default: Date.now },
})

let RankStat = null

if (mongoose.models.RankStat !== undefined) {
  RankStat = mongoose.models.RankStat
} else {
  RankStat = mongoose.model<IRankStat>('RankStat', rankStatSchema)
}

export default RankStat
