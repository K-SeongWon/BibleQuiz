# BibleQuiz

교회 성경퀴즈대회를 누구나 어디서나 원클릭으로 진행할 수 있게 해주는 오픈소스 올인원 도구.

> 🚧 초기 스캐폴드 단계입니다 (v0.0.0). 실제 동작 기능은 아직 없습니다.

## 운영 모드

세 가지 시나리오를 모두 지원하는 것을 목표로 합니다.

- **A. 온라인** — 참가자가 원격에서 각자 접속 (서버리스 배포).
- **B. 로컬 네트워크** — 같은 공간 + Wi-Fi 공유기, 인터넷 없이도 동작.
- **C. 아날로그** — 본당 + 전광판 + 진행자 단독. 참가자 단말 없이도 진행.

## 화면 구성

- **Stage** (전광판/빔) — 풀스크린 문제·타이머·점수판
- **Console** (진행자) — 제어 패널
- **Pad** (참가자 휴대폰, 모드 A·B만) — 응답 입력

## 기술 스택

TypeScript · Bun · Hono · React + Vite · Tailwind CSS + shadcn/ui · Zod · PWA · i18next.

## 개발

요구사항: [Bun](https://bun.sh) 1.3+

```bash
bun install
bun run dev          # client(5173) + server(3001) 동시 실행
bun run dev:client   # 클라이언트만
bun run dev:server   # 서버만
bun run typecheck
bun run lint
bun run test
```

## 라이선스

[MIT](./LICENSE)
