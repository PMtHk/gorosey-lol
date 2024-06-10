const { DISCORD_APPLICATION_ID, KOREAN_DISCORD_LIST_TOKEN } = process.env

if (!DISCORD_APPLICATION_ID)
  throw new Error('DISCORD_APPLICATION_ID를 불러올 수 없습니다.')

if (!KOREAN_DISCORD_LIST_TOKEN)
  throw new Error('KOREAN_DISCORD_LIST_TOKEN을 불러올 수 없습니다.')

// post request to koreanbots to update gorosey-lol server count
export default async function updateServerCount(serverCount: number) {
  try {
    const response = await fetch(
      `https://koreanbots.dev/api/v2/bots/${DISCORD_APPLICATION_ID}/stats`,
      {
        method: 'POST',
        headers: {
          Authorization: KOREAN_DISCORD_LIST_TOKEN,
        },
        body: JSON.stringify({
          servers: serverCount,
        }),
      },
    )

    if (response.status === 200) {
      console.log(
        `[INFO][${new Date().toLocaleString()}][updateServerCount] : updated server count to ${serverCount} successfully`,
      )
    }

    return
  } catch (error) {
    console.log(
      `[ERROR][${new Date().toLocaleString()}][updateServerCount] : ${error}`,
    )
  }
}
