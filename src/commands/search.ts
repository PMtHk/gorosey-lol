import {
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} from 'discord.js'
import CustomEmbedBuilder, {
  CustomEmbedData,
} from '../actions/CustomEmbedBuilder'
import { createRankStat } from '../actions/db/rankstat/create'
import { findRankStat } from '../actions/db/rankstat/find'
import { updateRankStat } from '../actions/db/rankstat/update'
import { createSummoner } from '../actions/db/summoner/create'
import { updateSummoner } from '../actions/db/summoner/update'
import { findSummoner } from '../actions/db/summoner/find'
import { fetchAccountDto } from '../actions/riot/fetchAccountDto'
import { fetchLeagueStats } from '../actions/riot/fetchLeagueEntryDtos'
import { fetchSummonerDto } from '../actions/riot/fetchSummonerDto'
import { SlashCommand } from '../types/SlashCommand'

export const search: SlashCommand = {
  name: '조회',
  description: '소환사의 24시간 내 전적을 조회합니다. (솔로랭크, 자유랭크)',
  options: [
    {
      required: true,
      name: '소환사',
      description: '조회할 [소환사명#태그]를 입력해주세요.',
      type: ApplicationCommandOptionType.String,
    },
  ],
  execute: async (_, interaction) => {
    try {
      const input = (interaction.options.get('소환사')?.value || '') as string
      const [inputGameName, inputTagLine] = input.split('#')

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

        console.log('id', id, '2')
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
      console.log('summonerId', summonerId, '1')
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

      // TODO: matchHistories를 가져오는 로직 추가

      const data: CustomEmbedData = {
        gameName,
        tagLine,
        profileIconId: summonerInfo.profileIconId,
        lastUpdatedAt: summonerInfo.lastUpdatedAt,
        RANKED_SOLO_5x5: rankStatInfo.RANKED_SOLO_5x5,
        RANKED_FLEX_SR: rankStatInfo.RANKED_FLEX_SR,
        matchHistories: [],
      }

      // Embed 생성
      const embed = CustomEmbedBuilder(data)

      // Refresh 버튼 생성
      const refreshButton = new ButtonBuilder()
        .setCustomId('refresh')
        .setLabel('전적 갱신하기')
        .setStyle(ButtonStyle.Primary)

      const response = await interaction.editReply({
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>({
            components: [refreshButton],
          }),
        ],
      })

      // 멤버목록 가져와서 해당 멤버들이 버튼과 상호작용 가능하도록 필터링
      const guilds = interaction.client.guilds.cache.get(interaction.guildId)
        .members.cache
      const memberIds = guilds.map((member) => member.user.id)

      const collectorFilter = (i) => memberIds.includes(i.user.id)

      // 버튼 클릭 대기
      const userInteraction = await response.awaitMessageComponent({
        filter: collectorFilter,
      })

      // refresh 버튼 클릭 시
      if (userInteraction.customId === 'refresh') {
        await userInteraction.update({
          components: [
            new ActionRowBuilder<ButtonBuilder>({
              components: [
                refreshButton
                  .setDisabled(true)
                  .setLabel('갱신 중...')
                  .setStyle(ButtonStyle.Secondary),
              ],
            }),
          ],
        })

        // 소환사 정보 갱신
        const { profileIconId, summonerLevel } =
          await fetchSummonerDto(riotPuuid)

        await updateSummoner({
          riotPuuid,
          gameName,
          tagLine,
          summonerId,
          profileIconId,
          summonerLevel,
        })

        summonerInfo = await findSummoner(riotPuuid)

        // 랭크 정보 갱신
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { RANKED_SOLO_5x5, RANKED_FLEX_SR } =
          await fetchLeagueStats(summonerId)

        await updateRankStat({
          summonerId,
          RANKED_SOLO_5x5,
          RANKED_FLEX_SR,
        })

        rankStatInfo = await findRankStat(summonerId)

        const updatedData: CustomEmbedData = {
          gameName,
          tagLine,
          profileIconId: summonerInfo.profileIconId,
          lastUpdatedAt: summonerInfo.lastUpdatedAt,
          RANKED_SOLO_5x5: rankStatInfo.RANKED_SOLO_5x5,
          RANKED_FLEX_SR: rankStatInfo.RANKED_FLEX_SR,
          matchHistories: [],
        }

        // 갱신된 Embed 생성
        const updatedEmbed = CustomEmbedBuilder(updatedData)

        await userInteraction.editReply({
          embeds: [updatedEmbed],
          components: [
            new ActionRowBuilder<ButtonBuilder>({
              components: [
                refreshButton
                  .setDisabled(true)
                  .setLabel('갱신 완료')
                  .setStyle(ButtonStyle.Secondary),
              ],
            }),
          ],
        })
      }
    } catch (error) {
      await interaction.editReply({
        embeds: [error.generateEmbed()],
      })
    }
  },
}
