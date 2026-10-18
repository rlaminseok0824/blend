import type { PortfolioProject } from '../types';

export const slm: PortfolioProject = {
  slug: 'shipment-lifecycle-manager',
  order: 4,
  company: '무신사',
  team: 'CorenE Fulfillment Optimization',
  period: '2026.03–현재',
  title: 'Shipment Lifecycle Manager (SLM) 설계',
  summary:
    '실물 박스마다 고유 shipment 번호를 발급하고, 상태 전이를 **단일 원장의 조건부 쓰기**로 판정·기록하는 물류 실행 단위 설계 (HLD · 제안 설계)',
  stack: ['gRPC', 'DynamoDB (잠정 권고)', 'Spring Boot', 'Kotlin'],
  metrics: [
    { value: '월 3만 건', label: '송장 덮어쓰기 (기존 관측값)' },
    { value: '일 40건', label: '스토어 미전달 (기존 관측값)' },
    { value: 'HLD', label: '제안 설계 (도입 전)' },
  ],
  problems: [
    {
      title: '식별 · 박스를 추정으로 구분',
      body: '주문옵션 · 도착 순서로 박스를 추정 → **송장 덮어쓰기 월 약 3만 건**, **스토어 미전달 하루 약 40건**',
    },
    {
      title: '제어 · 로컬 상태 의존',
      body: '취소 · 재계획이 각 시스템의 로컬 상태에 의존 → FC 출고지시와 **어긋날 위험**',
    },
    {
      title: '측정 · 구간 추적 불가',
      body: '계획 · 포장 · 출고가 시스템마다 다른 키로 기록 → **박스별 리드타임 · 정체 구간** 추적 불가',
    },
  ],
  diagrams: [
    {
      kind: 'flow',
      id: 'slm-context',
      title: 'SLM 원장과 계획 · 명령 · FC 보고의 접점',
      caption:
        'HLD 기준 접점도 · FO는 계획, SLM은 shipment 상태, Control Plane은 판단을 소유. FC는 LES를 통해서만 SLM과 통신',
      width: 640,
      height: 286,
      groups: [{ x: 195, y: 18, w: 250, h: 252, label: 'SLM · 단일 소유 원장', tone: 'accent' }],
      nodes: [
        { id: 'fo', x: 20, y: 45, w: 130, h: 50, label: 'FO', sub: 'planned shipment 확정' },
        { id: 'cp', x: 20, y: 200, w: 130, h: 50, label: 'Control Plane', sub: '멈춤 · 재계획 판단' },
        {
          id: 'api',
          x: 220,
          y: 44,
          w: 200,
          h: 76,
          label: 'Internal API',
          sub: '발급 · 조건부 전이 판정',
          tone: 'accent',
        },
        {
          id: 'ledger',
          x: 235,
          y: 170,
          w: 170,
          h: 74,
          label: 'Shipment Ledger',
          sub: '번호 · 계보 · 이력 · 시각',
          shape: 'db',
        },
        { id: 'les', x: 490, y: 57, w: 130, h: 50, label: 'LES', sub: 'FC 보고 중계' },
        { id: 'fc', x: 490, y: 166, w: 130, h: 40, label: 'FC' },
      ],
      edges: [
        { from: 'fo', to: 'api', toAt: [220, 70], label: '발급 요청' },
        {
          from: 'cp',
          to: 'api',
          via: [
            [178, 225],
            [178, 100],
          ],
          toAt: [220, 100],
          label: '멈춤 ·\n재계획 종결',
          labelAt: [140, 165],
        },
        { from: 'les', to: 'api', fromAt: [490, 82], toAt: [420, 82], label: '보고 · 추가 발급', labelAt: [455, 70] },
        { from: 'fc', to: 'les', label: '보고' },
        { from: 'api', to: 'ledger', label: '조건부 쓰기' },
      ],
    },
  ],
  solutions: [
    {
      title: '박스별 번호 · 계보',
      bullets: [
        'planned shipment와 **실제 박스를 구분**해 박스마다 고유 shipment 번호 발급',
        '박스가 추가되면 **새 번호를 먼저 발급**하고 원 shipment는 유지 → 계보 보존',
      ],
    },
    {
      title: '경합 판정은 원장 조건부 쓰기 한 번',
      bullets: [
        '취소 · 포장완료처럼 동시에 일어날 수 있는 전이를 **원장 조건부 쓰기 1회**로 승자 판정',
        '진 쪽 경로는 **보상 처리**, 판정 주체는 SLM 원장 하나',
      ],
    },
    {
      title: '왜 Event-Driven이 아닌가',
      bullets: [
        '**발급 · 멈춤 · 전이 판정은 동기 호출**로 설계',
        '**호출자가 결과를 즉시 알아야 함**',
        '  FC는 박스를 추가하기 전에 번호가 있어야 송장을 붙일 수 있음 → 이벤트 발행 후 기다리는 구조로는 발급 시점 보장 불가',
        '  취소 · 포장완료 경합에서 진 쪽은 바로 보상 경로로 가야 함 → 판정 결과를 요청 응답으로 돌려줘야 함',
        '**이벤트로 상태를 복제하면 기존 문제가 그대로 남음**',
        '  각 시스템이 이벤트를 받아 로컬 상태를 만들고 그걸로 판단 → 지금의 "로컬 상태 의존" 문제와 같은 구조',
        '  이벤트 지연 · 순서 역전 · 중복 수신 시 시스템마다 다른 상태를 보고 판단할 위험',
        '**상태의 소유자는 하나**',
        '  상태 전이는 SLM 원장만 판정 · 기록하고, 다른 시스템은 명령으로 요청',
      ],
    },
    {
      title: '관측 기반 마련',
      bullets: ['발급 → 포장 → 출고 이력을 **번호와 시각으로 연결** → 구간별 SLA를 정의할 수 있는 기반'],
    },
  ],
  resultsTitle: '기대 효과 및 범위',
  results: [
    {
      title: '박스 단위 식별',
      body: '추정 대신 발급된 번호로 박스를 식별해 송장 덮어쓰기 · 미전달의 원인을 구조적으로 제거하는 방향',
    },
    {
      title: '경합 상황의 단일 판정',
      body: '취소 · 포장완료 경합을 원장 한 곳에서 판정해 FC 출고지시와의 불일치 위험을 줄임',
    },
    { title: '구간별 리드타임 측정', body: '번호 · 시각 이력으로 박스별 정체 구간을 추적할 수 있는 관측 기반' },
  ],
  notes: [
    '본 문서는 제안 HLD의 설계 내용입니다. 문제 정의의 수치는 기존 시스템의 관측값이며 SLM 도입 성과가 아닙니다.',
    'DynamoDB는 잠정 권고입니다.',
  ],
};
