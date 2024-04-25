import mongoose from 'mongoose'

const summonnerSchema = new mongoose.Schema({
  _id: { type: String },
  gameName: { type: String, required: true },
  tagLine: { type: String, required: true },
  summonerId: { type: String, required: true, ref: 'RankStat' },
  summonerLevel: { type: Number },
  profileIconId: { type: Number },
  lastUpdatedAt: { type: Date, default: Date.now },
})

let Summoner = null

if (mongoose.models.Summoner !== undefined) {
  Summoner = mongoose.models.Summoner
} else {
  Summoner = mongoose.model('Summoner', summonnerSchema)
}

export default Summoner
