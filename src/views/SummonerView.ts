import { EmbedBuilder } from 'discord.js'
import { IRankStat } from '../models/RankStat'
import { ISummoner } from '../models/Summoner'

export interface SummonerViewDto {
  summoner: ISummoner
  rankStat: IRankStat
}

export abstract class SummonerView {
  abstract createEmbed(dto: SummonerViewDto): EmbedBuilder
}
