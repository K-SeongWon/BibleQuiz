// 게임 모드 플러그인 레지스트리.
// 각 모드는 UI · 진행 상태 머신 · 점수 규칙 · 옵션 스키마를 제공한다.
// MVP에서는 BuzzerTeamIndividual 1개를 구현한다 (후속 PR).

export const gameModes = {} as const;
