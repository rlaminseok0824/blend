import type { PortfolioProject } from '../types';

export const returnzeroMailPipeline: PortfolioProject = {
  slug: 'async-mail-pipeline',
  order: 7,
  company: '리턴제로',
  team: 'Speech Solution',
  period: '학부 ICT 인턴 2024.09–2024.12',
  title: 'Redis · RQ 기반 비동기 메일 발송 파이프라인',
  summary:
    '서비스마다 따로 있던 메일 발송을 **4단계 큐 · 5단계 발송 상태** 기반 공통 파이프라인으로 통합해 **중복 발송 0건**, 발송 전 과정을 추적 가능하게 구축',
  stack: ['Python', 'FastAPI', 'Redis', 'RQ', 'MySQL', 'AWS SES'],
  metrics: [
    { value: '0건', label: '중복 발송' },
    { value: '4단계', label: '우선순위 큐' },
    { value: '5단계', label: '발송 상태 추적' },
    { value: 'PR #2169', label: 'RQ 오픈소스 기여' },
  ],
  problems: [
    {
      title: '서비스마다 분리된 메일 발송',
      body: '여러 서비스를 운영하는 회사 특성상 각 서비스가 **대량 메일 발송 로직을 따로** 갖고 있었습니다.',
    },
    {
      title: '발송 실패와 재전송 우려',
      body: '**rate limit 없이** 발송해 일부 메일이 실패했지만, 어디까지 보냈는지 알 수 없어 재전송하면 **중복 발송**될 위험이 있었습니다.',
    },
    {
      title: '운영 가시성 부재',
      body: '보낸 메일이 고객에게 제대로 전달됐는지 판단할 수 없었습니다.',
    },
  ],
  diagrams: [
    {
      kind: 'flow',
      id: 'rz-queues',
      title: '4단계 큐 기반 비동기 메일 발송 구조',
      caption:
        '중요 메일은 System Queue로, 대량 메일은 Split Queue에서 청크로 나눠 Send Queue로 보내고, 재시도 가능한 오류는 Retry Queue에서 백오프 후 재투입',
      width: 640,
      height: 330,
      groups: [{ x: 170, y: 20, w: 320, h: 190, label: 'Redis (RQ)' }],
      nodes: [
        { id: 'api', x: 20, y: 141, w: 120, h: 44, label: 'API Server' },
        { id: 'split', x: 190, y: 45, w: 130, h: 46, label: '② Split Queue', sub: '대량 메일 청크 분할' },
        { id: 'system', x: 190, y: 140, w: 130, h: 46, label: '① System Queue', sub: '중요 메일 우선' },
        { id: 'retry', x: 345, y: 45, w: 130, h: 46, label: '④ Retry Queue', sub: '지수 백오프' },
        { id: 'send', x: 345, y: 140, w: 130, h: 46, label: '③ Send Queue', tone: 'accent' },
        {
          id: 'worker',
          x: 250,
          y: 240,
          w: 320,
          h: 74,
          label: 'Worker',
          sub: 'Rate Limiter 확인 → 낙관적 락 (QUEUED → SENDING)\n→ SES 전송 → DB 기록 (SUCCESS / FAILED)',
          tone: 'accent',
        },
        { id: 'ses', x: 585, y: 255, w: 50, h: 44, label: 'AWS\nSES' },
      ],
      edges: [
        {
          from: 'api',
          to: 'split',
          via: [
            [160, 163],
            [160, 68],
          ],
          label: '대량',
          labelAt: [143, 110],
        },
        { from: 'api', to: 'system', label: '중요', labelAt: [178, 152] },
        {
          from: 'split',
          to: 'send',
          via: [
            [255, 116],
            [395, 116],
          ],
          toAt: [395, 140],
        },
        { from: 'system', to: 'send' },
        { from: 'retry', to: 'send', fromAt: [430, 91], toAt: [430, 140], label: '백오프 후', labelAt: [452, 116] },
        { from: 'send', to: 'worker' },
        { from: 'worker', to: 'ses' },
        {
          from: 'worker',
          to: 'retry',
          dashed: true,
          fromAt: [540, 240],
          via: [
            [540, 225],
            [510, 225],
            [510, 68],
          ],
          toAt: [475, 68],
          label: '재시도 가능\n오류',
          labelAt: [552, 150],
        },
      ],
    },
    {
      kind: 'flow',
      id: 'rz-status',
      title: '5단계 발송 상태',
      caption: '상태를 DB에 기록해 비동기 작업 중 어디까지 진행됐는지 추적하고, 실패 지점부터 복구',
      width: 640,
      height: 110,
      nodes: [
        { id: 'pending', x: 10, y: 33, w: 120, h: 44, label: 'PENDING', sub: '접수', shape: 'pill' },
        { id: 'queued', x: 165, y: 33, w: 120, h: 44, label: 'QUEUED', sub: '청크 분할', shape: 'pill' },
        {
          id: 'sending',
          x: 320,
          y: 33,
          w: 120,
          h: 44,
          label: 'SENDING',
          sub: '메일 전송',
          shape: 'pill',
          tone: 'accent',
        },
        { id: 'success', x: 500, y: 8, w: 130, h: 40, label: 'SUCCESS', shape: 'pill' },
        { id: 'failed', x: 500, y: 62, w: 130, h: 40, label: 'FAILED', shape: 'pill', tone: 'muted' },
      ],
      edges: [
        { from: 'pending', to: 'queued' },
        { from: 'queued', to: 'sending' },
        {
          from: 'sending',
          to: 'success',
          via: [
            [470, 55],
            [470, 28],
          ],
        },
        {
          from: 'sending',
          to: 'failed',
          via: [
            [470, 55],
            [470, 82],
          ],
        },
      ],
    },
  ],
  solutions: [
    {
      title: '4단계 우선순위 큐',
      body: '용도별로 큐를 나눠 중요 메일이 대량 발송에 밀리지 않게 했습니다.',
      bullets: [
        '**System Queue** · 중요도가 높은 시스템 메일 전용',
        '**Split Queue** · 대량 메일을 청크 단위로 나누는 작업 전용',
        '**Send Queue** · AWS SES로 실제 발송하는 워커 큐',
        '**Retry Queue** · 일시적 오류의 재시도 전담',
      ],
    },
    {
      title: '5단계 발송 상태로 추적과 복구',
      body: 'PENDING → QUEUED → SENDING → SUCCESS / FAILED를 DB에 기록해, 비동기 작업에서도 어디까지 보냈는지 추적하고 복구할 수 있게 했습니다.',
    },
    {
      title: '단계별 중복 방지',
      body: '분할 · 발송 · 재시도 단계마다 한 번만 실행되도록 막았습니다.',
      bullets: [
        '**Split Task** · 발송 세션별 고유 키로 Redis NX 락을 잡은 워커만 분할 수행',
        '**Send Task** · 낙관적 락으로 QUEUED → SENDING 변경에 성공한 워커만 전송, 메일별 UUID로 중복 방지',
        '**Retry Task** · Rate Limiter · SES의 재시도 가능 오류만 지수 백오프 후 Send Queue로 이동',
      ],
    },
    {
      title: 'RQ 오픈소스 기여',
      body: 'RQ Worker가 사용자 로깅 설정을 덮어쓰는 버그(**#1702**, 2022년 등록)를 라이브러리 내부까지 추적해 수정했고, **RQ PR #2169**로 병합됐습니다.',
    },
  ],
  results: [
    { title: '중복 발송 0건', body: '부분 발송 · 중복 발송을 상태와 락으로 추적' },
    { title: '운영 가시성 확보', body: '발송부터 최종 도달까지 전 과정을 실시간으로 추적 · 모니터링' },
    {
      title: '서비스별 중복 로직 제거',
      body: '공통 파이프라인으로 통합해 RTZR OpenAPI 정기 결제 메일 발송 로직을 대체',
    },
  ],
};
