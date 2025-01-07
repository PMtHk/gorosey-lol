# 고로시롤 | Gorosey-LoL

<a href="https://koreanbots.dev/bots/1232212821530509332">
  <img src="https://github.com/user-attachments/assets/d4515f05-d36e-48c4-92c0-200d327f6ba0" alt="gorosey_intro_image" width="100%" />
</a>

<br/>

<div align="center">
  <a href="https://expressjs.com/">
    <img src="https://img.shields.io/badge/Express-black?style=for-the-badge&logo=express&logoColor=white" alt="express"/>
  </a>
  <a href="https://discord.js.org/">
    <img src="https://img.shields.io/badge/Discord.js-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="discord.js" />
  </a>
  <a href="https://developer.riotgames.com/">
    <img src="https://img.shields.io/badge/riotgames-EB0029?style=for-the-badge&logo=riotgames&logoColor=white" alt="riotgames" />
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
  </a>
  <a href="https://www.mongodb.com/">
    <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="mongodb" />
  </a>
</div>

<br/>

## ✏️ 소개

고로시롤은 디스코드 봇으로, 설정한 시간에 자동으로 랭크 전적을 조회할 수 있습니다.

[고로시롤 초대하기](https://discord.com/oauth2/authorize?client_id=1232212821530509332&permissions=10240&scope=bot)

[고로시롤 - 한국 디스코드 리스트](https://koreanbots.dev/bots/1232212821530509332)  
[고로시롤 - 노션](http://gorosey.notion.site)

## 🛠️ 기능

`/핑` : 봇의 핑 수치를 확인할 수 있어요.  
`/조회` : 소환사의 랭크 정보 및 72시간 내 전적을 조회해요.  
`/등록` : 워치리스트에 소환사를 등록해요. (최대 3개, 더 늘리려 노력중입니다!)  
`/도움말` : 고로시롤의 모든 명령어를 확인할 수 있어요.  
`/해제` : 특정 소환사를 워치리스트에서 제거할 수 있어요.  
`/워치리스트` : 이 채널의 워치리스트를 조회해요.  
`/채널변경` : 워치리스트 알림 채널을 변경할 수 있어요.  
`/시간변경` : 워치리스트 알림 시간을 변경할 수 있어요.  

## 🗒️ 개발 관련

1. [병렬 처리와 RateLimiter 적용기](https://velog.io/@pmthk__/%EA%B3%A0%EB%A1%9C%EC%8B%9C%EB%A1%A4-%EB%B3%91%EB%A0%AC-%EC%B2%98%EB%A6%AC%EC%99%80-RateLimiter-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0)  
  성능 개선을 위해 병렬 처리를 도입하고,  
  그 과정에서 Riot API Rate Limit 을 준수하기 위해 RateLimiter 를 만들고 적용했습니다.