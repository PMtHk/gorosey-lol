import { matchV5, matchesV5 } from './riot'

export default async function fetchMatchHistory(riotPuuid: string) {
  const responseSolo = await matchesV5(riotPuuid, 'RANKED_SOLO_5x5')
  const responseFlex = await matchesV5(riotPuuid, 'RANKED_FLEX_SR')

  const matchIds = []

  if (!('error' in responseSolo)) matchIds.push(...responseSolo)
  if (!('error' in responseFlex)) matchIds.push(...responseFlex)

  const matchInfos = []

  for await (const matchId of matchIds) {
    const matchInfo = await matchV5(matchId, riotPuuid)

    if ('error' in matchInfo) continue

    matchInfos.push(matchInfo)
  }

  matchInfos.sort((a, b) => b.gameEndTimestamp - a.gameEndTimestamp)

  return matchInfos
}
