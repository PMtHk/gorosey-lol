import mongoose from 'mongoose'

const summonnerSchema = new mongoose.Schema({
  _id: { type: String }, // riotPuuid
  summonerId: { type: String, required: true, ref: 'RankStat' },
  gameName: { type: String, required: true },
  tagLine: { type: String, required: true },
  profileIconId: { type: Number },
  summonerLevel: { type: Number },
  lastUpdatedAt: { type: Date, default: Date.now },
})

let Summoner = null

if (mongoose.models.Summoner !== undefined) {
  Summoner = mongoose.models.Summoner
} else {
  Summoner = mongoose.model('Summoner', summonnerSchema)
}

export default Summoner
