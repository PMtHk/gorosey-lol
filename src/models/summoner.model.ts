import mongoose from 'mongoose'

export interface ISummoner {
  _id: string
  summonerId: string
  gameName: string
  tagLine: string
  profileIconId: number
  summonerLevel: number
  lastUpdatedAt: Date
}

const summonnerSchema = new mongoose.Schema<ISummoner>({
  // 소환사 계정 별로 riot 자체 puuid 부여되므로
  // puuid를 _id로 사용
  _id: { type: String },

  summonerId: { type: String, required: true, ref: 'RankStat' },
  gameName: { type: String, required: true },
  tagLine: { type: String, required: true },
  profileIconId: { type: Number, default: 1 },
  summonerLevel: { type: Number, default: 1 },

  lastUpdatedAt: { type: Date, default: Date.now },
})

let Summoner = null

if (mongoose.models.Summoner !== undefined) {
  Summoner = mongoose.models.Summoner
} else {
  Summoner = mongoose.model<ISummoner>('Summoner', summonnerSchema)
}

export default Summoner
