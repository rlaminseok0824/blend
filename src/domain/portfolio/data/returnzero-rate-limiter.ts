import type { PortfolioProject } from '../types';

export const returnzeroRateLimiter: PortfolioProject = {
  slug: 'sliding-window-rate-limiter',
  order: 8,
  company: '리턴제로',
  team: 'Speech Solution',
  period: '학부 ICT 인턴 2024.09–2024.12',
  title: 'Redis 슬라이딩 윈도우 메일 발송 Rate Limiter',
  summary:
    '1만 건 발송에 10분이 걸리던 문제를 **Redis Sorted Set · Lua Script** 기반 슬라이딩 윈도우로 AWS SES 전송 한도에 맞춰 제어해 **10분 → 3분 20초**, 쓰로틀링 **0건**',
  stack: ['Python', 'Redis', 'Lua', 'RQ', 'AWS SES'],
  metrics: [
    { value: '3배', label: '1만 건 발송 속도' },
    { value: '3m 20s', label: '1만 건 발송 시간 (기존 10m)' },
    { value: '0%', label: 'AWS SES 쓰로틀링 에러' },
  ],
  problems: [
    {
      title: 'Fixed Window의 한계',
      body: '고정된 시간 경계에 트래픽이 몰리면 **버스트를 막지 못해** 발송 한도를 넘었습니다.',
    },
    {
      title: '청크 단위 실패',
      body: '시스템 메일 때문에 한도가 조금만 차 있어도 **청크 전체가 실패**해, 1만 건 발송에 10분이 걸렸습니다.',
    },
  ],
  diagrams: [
    {
      kind: 'flow',
      id: 'rz-lua',
      title: 'Lua Script로 원자적으로 실행하는 슬라이딩 윈도우 판정',
      caption:
        '삭제 → 조회 → 조건 검사 → 추가를 Lua Script 한 번으로 원자 실행하고, 성공분만 발송 · 초과분은 Retry Queue로 분리',
      width: 640,
      height: 430,
      groups: [{ x: 150, y: 8, w: 480, h: 262, label: 'Redis Lua Script (원자적 실행)', tone: 'accent' }],
      nodes: [
        { id: 'in', x: 15, y: 32, w: 115, h: 44, label: '발송 요청 N건', shape: 'pill' },
        { id: 'del', x: 165, y: 32, w: 162, h: 48, label: '① ZREMRANGEBYSCORE', sub: '윈도우 밖 기록 삭제' },
        { id: 'card', x: 342, y: 32, w: 112, h: 48, label: '② ZCARD', sub: '윈도우 내 발송 수' },
        { id: 'calc', x: 470, y: 32, w: 145, h: 48, label: '③ 여유 계산', sub: 'Limit − ZCARD' },
        { id: 'cond', x: 475, y: 98, w: 140, h: 76, label: '④ 조건 검사', shape: 'diamond' },
        { id: 'full', x: 170, y: 204, w: 140, h: 48, label: 'N건 전체 ZADD', sub: '여유 ≥ N' },
        { id: 'part', x: 330, y: 204, w: 140, h: 48, label: '여유만큼 ZADD', sub: '0 < 여유 < N', tone: 'accent' },
        { id: 'none', x: 490, y: 204, w: 120, h: 48, label: '추가 생략', sub: '여유 ≤ 0', tone: 'muted' },
        { id: 'ret', x: 170, y: 300, w: 440, h: 36, label: '결과 반환 · (성공 건수, 초과 건수)', shape: 'pill' },
        { id: 'send', x: 170, y: 370, w: 200, h: 44, label: '성공 건수만큼 SES 발송', tone: 'accent' },
        { id: 'retry', x: 410, y: 370, w: 200, h: 44, label: '초과분 → Retry Queue', tone: 'muted' },
      ],
      edges: [
        { from: 'in', to: 'del' },
        { from: 'del', to: 'card' },
        { from: 'card', to: 'calc' },
        { from: 'calc', to: 'cond' },
        {
          from: 'cond',
          to: 'full',
          fromAt: [545, 174],
          via: [
            [545, 188],
            [240, 188],
          ],
          toAt: [240, 204],
        },
        {
          from: 'cond',
          to: 'part',
          fromAt: [545, 174],
          via: [
            [545, 188],
            [400, 188],
          ],
          toAt: [400, 204],
        },
        { from: 'cond', to: 'none', fromAt: [545, 174], toAt: [550, 204] },
        { from: 'full', to: 'ret', toAt: [240, 300] },
        { from: 'part', to: 'ret', toAt: [400, 300] },
        { from: 'none', to: 'ret', toAt: [550, 300] },
        { from: 'ret', to: 'send', fromAt: [270, 336], toAt: [270, 370] },
        { from: 'ret', to: 'retry', fromAt: [510, 336], toAt: [510, 370] },
      ],
    },
  ],
  solutions: [
    {
      title: 'Redis Sorted Set 슬라이딩 윈도우',
      body: '**밀리초 타임스탬프를 ZSET의 score · member**로 써서, 발송 직전 시점 기준으로 정확한 발송량을 판단합니다.',
    },
    {
      title: 'Lua Script로 원자적 판정',
      body: '**삭제(ZREMRANGEBYSCORE) → 조회(ZCARD) → 조건 검사 → 추가(ZADD)** 를 하나의 Lua Script로 실행해, 여러 워커가 동시에 판정해도 한도를 넘지 않게 했습니다.',
    },
    {
      title: '부분 성공 처리',
      body: '한도가 일부만 남아 있으면 **승인된 만큼만 먼저 발송**하고, 나머지는 Retry Queue로 분리해 청크 전체가 실패하지 않게 했습니다.',
    },
  ],
  results: [
    { title: '1만 건 발송 10분 → 3분 20초', body: '기존 대비 처리 속도 약 3배 향상' },
    { title: 'AWS SES 쓰로틀링 에러 0%', body: '전송 한도 안에서 최대한 빠르게 발송' },
  ],
};
