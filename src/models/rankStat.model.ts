import mongoose from 'mongoose'

const rankStatSchema = new mongoose.Schema({
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
  RankStat = mongoose.model('RankStat', rankStatSchema)
}

export default RankStat
