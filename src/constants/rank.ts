export const tierInfos: Record<
  string,
  {
    id: string
    name: string
    color: string
  }
> = {
  UNRANKED: {
    id: 'UNRANKED',
    name: '정보없음',
    color: '#000000',
  },
  IRON: {
    id: 'IRON',
    name: '아이언',
    color: '#51484A',
  },
  BRONZE: {
    id: 'BRONZE',
    name: '브론즈',
    color: '#8C513A',
  },
  SILVER: {
    id: 'SILVER',
    name: '실버',
    color: '#80989D',
  },
  GOLD: {
    id: 'GOLD',
    name: '골드',
    color: '#CD8837',
  },
  PLATINUM: {
    id: 'PLATINUM',
    name: '플래티넘',
    color: '#4E9996',
  },
  EMERALD: {
    id: 'EMERALD',
    name: '에메랄드',
    color: '#009e54',
  },
  DIAMOND: {
    id: 'DIAMOND',
    name: '다이아몬드',
    color: '#576BCE',
  },
  MASTER: {
    id: 'MASTER',
    name: '마스터',
    color: '#9A4E80',
  },
  GRANDMASTER: {
    id: 'GRANDMASTER',
    name: '그랜드마스터',
    color: '#CD4545',
  },
  CHALLENGER: {
    id: 'CHALLENGER',
    name: '챌린저',
    color: '#F4C875',
  },
}
