import type { CanvasItem, PortfolioProject } from '../types';
import boundary from './fo-canvas/boundary.json';
import sequential from './fo-canvas/sequential.json';

export const fulfillmentOptimization: PortfolioProject = {
  slug: 'fulfillment-optimization',
  order: 1,
  company: '무신사',
  team: 'CorenE Fulfillment Optimization',
  period: '2026.03–현재',
  title: 'Fulfillment Optimization 고도화',
  summary:
    '주문 단위 순차 실행하던 약 30분 단위 차수 배치를 **주소 단위 Workflow 병렬 스트리밍**으로 바꿔 **합포율 2% 증가**, **물량 10배** 수용 구조를 기존 시스템과 공존시키며 **이슈 없이 전환**',
  stack: ['Temporal', 'Spring Boot', 'Kotlin', 'MySQL'],
  metrics: [
    { value: '+2%', label: '합포율 (기존 대비)' },
    { value: '10배', label: '수용 가능 물량' },
    { value: '0.006%', label: '병렬 처리 결과가 순차 처리와 달라질 확률 (시뮬레이션)' },
    { value: '0건', label: '전환 중 이슈' },
  ],
  problems: [
    {
      title: '차수 경계 합포 손실',
      body: '약 30분 단위 차수 마감 시점에 걸친 크로스 오더가 서로 다른 차수로 갈려 **별도 박스로 출고**, 합포 기회 손실',
      diagram: {
        kind: 'canvas',
        id: 'fo-boundary',
        title: '차수 경계에 걸린 크로스 오더',
        caption: '개념도 · 고객 A는 같은 차수 안에서 합포되지만, 고객 B는 5분 차이로 차수가 갈려 두 박스로 출고',
        width: 640,
        height: 232,
        items: boundary as CanvasItem[],
      },
    },
    {
      title: '선형 처리 구조',
      body: '주문 단위 **순차 실행** 구조로 물량에 비례해 처리 시간 증가, 피크 시 **35분 소요로 SLA 20분 초과**',
      diagram: {
        kind: 'canvas',
        id: 'fo-sequential',
        title: '물량이 늘면 처리 시간도 비례해 증가',
        caption: 'SLA 20분 · 피크 시 순차 실행 35분 소요. 선의 기울기와 병렬 실행 곡선은 경향을 나타낸 개념도',
        width: 420,
        height: 270,
        items: sequential as CanvasItem[],
      },
    },
  ],
  diagrams: [
    {
      kind: 'flow',
      id: 'fo-architecture',
      title: '차수 단위 배치에서 주소별 Workflow 병렬 실행으로의 전환',
      caption:
        '개념 흐름도 · 같은 주소 주문은 같은 Workflow에 합류하고, 각 Workflow가 합포 대기 → Greedy FC 후보 선정 → 재고 차감 → 출고 지시까지 수행. 신규 경로는 Feature Flag로 기존 배치와 공존하며 전환',
      width: 640,
      height: 290,
      groups: [
        { x: 10, y: 10, w: 620, h: 92, label: '기존 · 차수 단위 배치', tone: 'muted' },
        { x: 10, y: 114, w: 620, h: 166, label: '개선 · 주소별 Workflow 병렬 실행', tone: 'accent' },
        { x: 278, y: 140, w: 340, h: 58, label: '주소 A Workflow' },
        { x: 278, y: 208, w: 340, h: 58, label: '주소 B Workflow' },
      ],
      nodes: [
        { id: 'b-in', x: 30, y: 38, w: 120, h: 38, label: '주문 유입' },
        {
          id: 'b-batch',
          x: 250,
          y: 32,
          w: 150,
          h: 50,
          label: '차수 배치',
          sub: '차수 마감 시 일괄 종료',
          tone: 'muted',
        },
        { id: 'b-out', x: 490, y: 38, w: 120, h: 38, label: '출고 지시' },
        { id: 'a-in', x: 26, y: 184, w: 88, h: 40, label: '주문 유입' },
        {
          id: 'a-route',
          x: 132,
          y: 171,
          w: 120,
          h: 66,
          label: 'Workflow ID\n라우팅',
          sub: '주소 → 결정론적 ID',
          tone: 'accent',
        },
        { id: 'a-wait', x: 290, y: 163, w: 70, h: 28, label: '합포 대기' },
        { id: 'a-plan', x: 372, y: 163, w: 70, h: 28, label: 'FC 선정', tone: 'accent' },
        { id: 'a-stock', x: 454, y: 163, w: 70, h: 28, label: '재고 차감', tone: 'accent' },
        { id: 'a-ship', x: 536, y: 163, w: 70, h: 28, label: '출고 지시' },
        { id: 'b-wait', x: 290, y: 231, w: 70, h: 28, label: '합포 대기' },
        { id: 'b-plan', x: 372, y: 231, w: 70, h: 28, label: 'FC 선정', tone: 'accent' },
        { id: 'b-stock', x: 454, y: 231, w: 70, h: 28, label: '재고 차감', tone: 'accent' },
        { id: 'b-ship', x: 536, y: 231, w: 70, h: 28, label: '출고 지시' },
      ],
      edges: [
        { from: 'b-in', to: 'b-batch', label: '차수 동안 누적' },
        { from: 'b-batch', to: 'b-out', label: '마감 후 일괄' },
        { from: 'a-in', to: 'a-route' },
        {
          from: 'a-route',
          to: 'a-wait',
          via: [
            [268, 204],
            [268, 177],
          ],
          toAt: [290, 177],
        },
        { from: 'a-wait', to: 'a-plan' },
        { from: 'a-plan', to: 'a-stock' },
        { from: 'a-stock', to: 'a-ship' },
        {
          from: 'a-route',
          to: 'b-wait',
          via: [
            [268, 204],
            [268, 245],
          ],
          toAt: [290, 245],
        },
        { from: 'b-wait', to: 'b-plan' },
        { from: 'b-plan', to: 'b-stock' },
        { from: 'b-stock', to: 'b-ship' },
      ],
      notes: [
        { x: 320, y: 96, text: '마감 이후 들어온 같은 주소 주문은 다음 차수로 밀려 합포 불가', anchor: 'middle' },
      ],
    },
  ],
  solutions: [
    {
      title: '주소 단위 Workflow 스트리밍 전환',
      bullets: [
        '주소 기반 **결정론적 Workflow ID** 생성, 같은 주소 주문은 실행 중인 **같은 Workflow에 합류**',
        'Temporal은 같은 Workflow ID의 실행을 하나만 허용 → 재시도 · 동시 유입에도 **주소당 Workflow 1개** 보장',
        '**첫 주문 시점부터** 합포 대기 시간 산정, 차수 경계와 무관하게 합포 기회 보존',
        '주소별 독립 **병렬 실행**, 물량 증가 시 Worker scale-out으로 대응',
      ],
    },
    {
      title: 'Workflow 단위 FC 후보 선정 및 출고 지시',
      bullets: [
        '합포 대기 종료 후 **Greedy 알고리즘으로 FC 후보 선정**',
        '재고 차감 후 같은 Workflow 안에서 **출고 지시까지** 진행, 차수 일괄 처리 의존 제거',
      ],
    },
    {
      title: '조건부 UPDATE 기반 재고 경합 제어',
      bullets: [
        '비관적 락 대신 **조건부 UPDATE(row lock)**, 조회 시점이 아닌 갱신 시점에만 잠금',
        '조건 불충족 시 0 row 반환 → 재시도 · 동시 실행에도 **중복 차감 방지**',
        '시뮬레이션 결과 순차 처리와 결과가 달라질 확률 **0.006%** → 채택',
      ],
      diagram: {
        kind: 'sequence',
        id: 'fo-conditional-update',
        title: '조건부 UPDATE 기반 row lock으로 재시도·동시 실행 제어',
        caption:
          '개념도 · 같은 재고 row를 두 실행이 동시에 갱신해도 조건을 만족하는 한 쪽만 반영되고, 나머지는 0 row로 끝나 중복 처리되지 않음',
        participants: [
          { id: 'a', label: 'Workflow 실행 A' },
          { id: 'db', label: 'MySQL\n재고 row' },
          { id: 'b', label: 'Workflow 실행 B\n(재시도 · 동시 실행)' },
        ],
        messages: [
          { from: 'a', to: 'db', label: 'UPDATE … WHERE 조건 충족' },
          { from: 'b', to: 'db', label: '같은 row에 UPDATE' },
          { divider: 'row lock 안에서 조건 재평가' },
          { from: 'db', to: 'a', label: '1 row 갱신 → 진행', tone: 'accent' },
          { from: 'db', to: 'b', label: '0 row → 이미 처리됨, 건너뜀', dashed: true },
        ],
      },
    },
    {
      title: '출고 지시 멱등키 · Rate Limiter',
      bullets: [
        '출고 지시에 **멱등키** 적용 → Workflow 재시도에도 같은 출고 지시가 **중복으로 내려가지 않도록** 보장',
        '출고 지시를 한 번에 몰아서 내리면 안 되기 때문에 **Redis 기반 Rate Limiter**를 직접 구현해 지시 속도 제어',
        '**Jitter**를 적용해 여러 Workflow의 출고 지시가 같은 시점에 몰리지 않도록 분산',
        'Redis 장애 시 **프로세스 간 Jitter + 세마포어**로 전환해 출고 지시를 멈추지 않고 진행',
      ],
    },
    {
      title: 'Feature Flag 기반 슬로우 롤아웃',
      bullets: [
        '기존 차수 배치와 신규 Workflow를 **공존**시켜 병행 실행',
        '**Feature Flag**로 신규 경로 대상을 점진적으로 확대',
        '기존 시스템 영향 없이 **이슈 없이 배포 완료**',
      ],
    },
  ],
  results: [
    { title: '합포율 개선', body: '차수 경계 합포 손실 제거로 합포율 기존 대비 2% 증가' },
    { title: '처리량 확장', body: '주소 단위 병렬 실행으로 기존 물량 10배를 수용하는 scale-out 구조 확립' },
    { title: '무중단 전환', body: '기존 시스템과 공존하는 Feature Flag 슬로우 롤아웃으로 이슈 없이 배포' },
  ],
  notes: ['합포율 2%는 기존 대비 상대 개선이며 2%p를 뜻하지 않습니다. 10배는 설계상 수용 가능한 처리 규모입니다.'],
};
