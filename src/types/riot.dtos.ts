// Error response from Riot API
export type ResponseError = {
  status: {
    status_code: number
    message: string
  }
}

export type AccountDto = {
  puuid: string
  gameName: string
  tagLine: string
}

export type SummonerDto = {
  accountId: string
  profileIconId: number
  revisionDate: number // Epoch
  name: string
  id: string // SummonerId
  puuid: string // riotPuuid
  summonerLevel: number
}

export type LeagueEntryDto = {
  leagueId: string
  summonerId: string
  summonerName: string
  queueType: string
  tier: string
  rank: string
  leaguePoints: number
  wins: number
  losses: number
  hotStreak: boolean
  veteran: boolean
  freshBlood: boolean
  inactive: boolean
  miniSeries?: MiniSeriesDto
}

export type MiniSeriesDto = {
  losses: number
  progress: string
  target: number
  wins: number
}

export type MatchDto = {
  metadata: MetadataDto
  info: InfoDto
}

export type MetadataDto = {
  dataVersion: string
  matchId: string
  participants: string[]
}

export type InfoDto = {
  gameCreation: number
  gameDuration: number
  gameEndTimestamp: number
  gameId: number
  gameMode: string
  gameName: string
  gameStartTimestamp: number
  gameType: string
  gameVersion: string
  mapId: number
  participants: ParticipantDto[]
  platformId: string
  queueId: number
  teams: TeamDto[]
  tournamentCode: string
}

export type ParticipantDto = {
  assists: number
  baronKills: number
  bountyLevel: number
  champExperience: number
  champLevel: number
  championId: number
  championName: string
  championTransform: number
  consumablesPurchased: number
  damageDealtToBuildings: number
  damageDealtToObjectives: number
  damageDealtToTurrets: number
  damageSelfMitigated: number
  deaths: number
  detectorWardsPlaced: number
  doubleKills: number
  dragonKills: number
  firstBloodAssist: boolean
  firstBloodKill: boolean
  firstTowerAssist: boolean
  firstTowerKill: boolean
  gameEndedInEarlySurrender: boolean
  gameEndedInSurrender: boolean
  goldEarned: number
  goldSpent: number
  individualPosition: string
  inhibitorKills: number
  inhibitorTakedowns: number
  inhibitorsLost: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  itemsPurchased: number
  killingSprees: number
  kills: number
  lane: string
  largestCriticalStrike: number
  largestKillingSpree: number
  largestMultiKill: number
  longestTimeSpentLiving: number
  magicDamageDealt: number
  magicDamageDealtToChampions: number
  magicDamageTaken: number
  neutralMinionsKilled: number
  nexusKills: number
  nexusTakedowns: number
  nexusLost: number
  objectivesStolen: number
  objectivesStolenAssists: number
  participantId: number
  pentaKills: number
  perks: PerkDto
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  physicalDamageTaken: number
  profileIcon: number
  puuid: string
  quadraKills: number
  riotIdName: string
  riotIdTagline: string
  role: string
  sightWardsBoughtInGame: number
  spell1Casts: number
  spell2Casts: number
  spell3Casts: number
  spell4Casts: number
  summoner1Casts: number
  summoner1Id: number
  summoner2Casts: number
  summoner2Id: number
  summonerId: string
  summonerLevel: number
  summonerName: string
  teamEarlySurrendered: boolean
  teamId: number
  teamPosition: string
  timeCCingOthers: number
  timePlayed: number
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageShieldedOnTeammates: number
  totalDamageTaken: number
  totalHeal: number
  totalHealsOnTeammates: number
  totalMinionsKilled: number
  totalTimeCCDealt: number
  totalTimeSpentDead: number
  totalUnitsHealed: number
  tripleKills: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  trueDamageTaken: number
  turretKills: number
  turretTakedowns: number
  turretsLost: number
  unrealKills: number
  visionScore: number
  visionWardsBoughtInGame: number
  wardsKilled: number
  wardsPlaced: number
  win: boolean
}

export type TeamDto = {
  bans: BanDto[]
  objectives: ObjectivesDto
  teamId: number
  win: boolean
}

export type BanDto = {
  championId: number
  pickTurn: number
}

export type ObjectivesDto = {
  baron: ObjectiveDto
  champion: ObjectiveDto
  dragon: ObjectiveDto
  inhibitor: ObjectiveDto
  riftHerald: ObjectiveDto
  tower: ObjectiveDto
}

export type ObjectiveDto = {
  first: boolean
  kills: number
}

export type PerkDto = {
  statPerks: PerkStatsDto
  styles: PerkStyleDto[]
}

export type PerkStatsDto = {
  defense: number
  flex: number
  offense: number
}

export type PerkStyleDto = {
  description: string
  selections: PerkSelectionDto[]
  style: number
}

export type PerkSelectionDto = {
  perk: number
  var1: number
  var2: number
  var3: number
}

export type MatchesDto = string[]
