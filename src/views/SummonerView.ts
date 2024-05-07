import { EmbedBuilder } from 'discord.js'
import { IRankStat } from '../models/rankStat.model'
import { ISummoner } from '../models/summoner.model'

export interface SummonerViewDto {
  summoner: ISummoner
  rankStat: IRankStat
}

export default abstract class SummonerView {
  abstract createEmbed(dto: SummonerViewDto): EmbedBuilder
}
