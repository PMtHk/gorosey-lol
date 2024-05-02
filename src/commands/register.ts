import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js'
import { SlashCommand } from '../types/SlashCommand'
import { createRankStat } from '../actions/db/rankStat/create'
import { findRankStat } from '../actions/db/rankStat/find'
import { createSummoner } from '../actions/db/summoner/create'
import { findSummoner } from '../actions/db/summoner/find'
import { fetchAccountDto } from '../actions/riot/fetchAccountDto'
import { fetchLeagueStats } from '../actions/riot/fetchLeagueEntryDtos'
import { fetchSummonerDto } from '../actions/riot/fetchSummonerDto'
import { createChannel } from '../actions/db/channel/create'
import { findChannel } from '../actions/db/channel/find'
import { updateChannel } from '../actions/db/channel/update'
import BaseError from '../errors/BaseError'

export const register: SlashCommand = {
  name: '등록',
  description: '워치리스트에 소환사를 등록해요. (최대 3개)',
  options: [
    {
      required: true,
      name: '소환사',
      description: '등록할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    try {
      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

      const guildId = interaction.guildId
      const channelId = interaction.channelId

      let summonerId = ''
      let riotPuuid = ''

      let summonerInfo
      let rankStatInfo

      // 소환사명 및 태그로 riotAccount 정보를 가져옴
      const { puuid, gameName, tagLine } = await fetchAccountDto(
        inputGameName,
        inputTagLine,
      )
      riotPuuid = puuid

      const { id } = await fetchSummonerDto(puuid)
      summonerId = id

      // puuid로 DB내 소환사 정보를 가져옴
      summonerInfo = await findSummoner(riotPuuid)

      // DB에 소환사 정보가 없을 경우 새로 생성
      if (!summonerInfo) {
        const { profileIconId, summonerLevel } =
          await fetchSummonerDto(riotPuuid)

        await createSummoner({
          riotPuuid,
          gameName,
          tagLine,
          summonerId,
          profileIconId,
          summonerLevel,
        })

        // 소환사 정보가 생성되면 생성된 소환사 정보를 가져옴
        summonerInfo = await findSummoner(riotPuuid)
      }

      // summonerId로 랭크 정보를 가져옴
      rankStatInfo = await findRankStat(summonerId)

      // DB에 랭크 정보가 없을 경우 새로 생성
      if (!rankStatInfo) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { RANKED_SOLO_5x5, RANKED_FLEX_SR } =
          await fetchLeagueStats(summonerId)

        await createRankStat({
          summonerId,
          RANKED_SOLO_5x5,
          RANKED_FLEX_SR,
        })

        // 랭크 정보가 생성되면 생성된 랭크 정보를 가져옴
        rankStatInfo = await findRankStat(summonerId)
      }

      // add member to watchList
      let channel = await findChannel(guildId)

      // if channel is not found
      if (!channel) {
        // create new channel and reply with empty watchList
        await createChannel(guildId, channelId)

        // refresh channelinfo
        channel = await findChannel(guildId)
      }

      if (channel.watchList.includes(riotPuuid)) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle('중복된 소환사')
              .setDescription('이미 등록된 소환사입니다.'),
          ],
        })

        return
      }

      if (channel.watchList.length === 3) {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor('#0099ff')
              .setTitle('워치리스트 개수 초과')
              .setDescription('최대 3개의 아이디를 등록할 수 있습니다.'),
          ],
        })

        return
      }

      const newWatchList = [...channel.watchList, riotPuuid]

      await updateChannel(guildId, newWatchList)

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('등록 완료')
            .setDescription(
              `${gameName}#${tagLine}님이 워치리스트에 등록되었습니다.`,
            ),
        ],
      })
    } catch (error) {
      if (error instanceof BaseError) {
        await interaction.editReply({
          embeds: [error.generateEmbed()],
        })
        return
      }

      const unexpectedError = new BaseError(
        500,
        '[REGISTER|SLASH COMMAND] unexpected error',
      )

      await interaction.editReply({
        embeds: [unexpectedError.generateEmbed()],
      })
    }
  },
}
