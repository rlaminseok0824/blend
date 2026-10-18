import type { CanvasItem, PortfolioProject } from '../types';
import knapsack from './cancel-canvas/knapsack.json';
import noOrchestration from './cancel-canvas/no-orchestration.json';
import partialCancel from './cancel-canvas/partial-cancel.json';

export const orderCancel: PortfolioProject = {
  slug: 'order-cancel-orchestration',
  order: 3,
  company: '무신사',
  team: 'CorenE Fulfillment Optimization',
  period: '2026.03–현재',
  title: '물류 주문 취소 오케스트레이션',
  summary:
    '시스템 간 조율 없이 전체 취소만 하던 배치 취소를 **Workflow 기반 오케스트레이션**으로 재설계하고, **Knapsack 기반 Shipment 최소 취소**로 부분 수량 취소 지원',
  stack: ['Temporal', 'Spring Boot', 'Kotlin', 'MySQL'],
  metrics: [
    { value: '전체 → 부분', label: '취소 단위 (부분 수량 취소 지원)' },
    { value: '0건', label: '중복 취소' },
    { value: '5분 → 5초', label: '취소 반영 시간 (최대 → 이내)' },
  ],
  problems: [
    {
      title: '시스템 간 취소 오케스트레이션 부재',
      body: '배치가 옵티마이저 · WMS · 재고를 **개별 호출**, 순서 · 상태를 조율하지 못함',
      diagram: {
        kind: 'canvas',
        id: 'cancel-no-orchestration',
        title: '시스템별로 따로 호출하는 취소 배치',
        caption: '개념도 · 각 시스템 취소가 독립적으로 실행되어 순서 보장과 중간 실패 처리가 없음',
        width: 640,
        height: 210,
        items: noOrchestration as CanvasItem[],
      },
    },
    {
      title: '부분 수량 취소 미지원',
      body: '여러 창고로 나뉜 주문에서 **일부 수량만 취소**할 방법이 없음',
      diagram: {
        kind: 'canvas',
        id: 'cancel-partial',
        title: '여러 Shipment로 나뉜 주문의 부분 취소',
        caption: '개념도 · 한 주문이 창고별 Shipment로 나뉘어 있어, 부분 취소 시 어느 Shipment에서 차감할지 결정해야 함',
        width: 640,
        height: 194,
        items: partialCancel as CanvasItem[],
      },
    },
  ],
  diagrams: [
    {
      kind: 'flow',
      id: 'cancel-architecture',
      title: 'Cancel Workflow 취소 오케스트레이션',
      caption:
        '개념 흐름도 · 주문 상태 파악부터 가할당 해제까지 하나의 Workflow가 순서대로 조율. 옵티마이저에서 배타적으로 제외한 뒤 남은 출고 건만 Plan → WMS로 넘김',
      width: 640,
      height: 318,
      groups: [
        { x: 10, y: 10, w: 620, h: 80, label: '기존 · 취소 배치', tone: 'muted' },
        { x: 10, y: 102, w: 620, h: 206, label: '개선 · Cancel Workflow (Temporal)', tone: 'accent' },
      ],
      nodes: [
        { id: 'b-req', x: 30, y: 36, w: 110, h: 38, label: '취소 요청' },
        { id: 'b-batch', x: 250, y: 30, w: 150, h: 50, label: '취소 배치', sub: '전체 취소만 · 개별 호출', tone: 'muted' },
        { id: 'b-sys', x: 480, y: 36, w: 135, h: 38, label: '시스템별 취소' },
        { id: 'req', x: 30, y: 140, w: 90, h: 52, label: '취소 요청' },
        { id: 's1', x: 150, y: 140, w: 140, h: 52, label: '① 주문 상태 파악' },
        { id: 's2', x: 315, y: 140, w: 140, h: 52, label: '② 옵티마이저', sub: '배타적 주문 제외' },
        { id: 's3', x: 480, y: 140, w: 135, h: 52, label: '③ Plan', sub: 'Shipment 최소 취소', tone: 'accent' },
        { id: 's4', x: 30, y: 236, w: 130, h: 52, label: '④ 창고 후보 선택', sub: '출고 건별 최적', tone: 'accent' },
        { id: 's5', x: 185, y: 236, w: 130, h: 52, label: '⑤ WMS 호출' },
        { id: 's6', x: 340, y: 236, w: 130, h: 52, label: '⑥ WMS', sub: '진할당 해제' },
        { id: 's7', x: 495, y: 236, w: 120, h: 52, label: '⑦ 가할당 해제', sub: 'Cancel Workflow' },
      ],
      edges: [
        { from: 'b-req', to: 'b-batch' },
        { from: 'b-batch', to: 'b-sys' },
        { from: 'req', to: 's1' },
        { from: 's1', to: 's2' },
        { from: 's2', to: 's3' },
        {
          from: 's3',
          to: 's4',
          fromAt: [547, 192],
          via: [
            [547, 214],
            [95, 214],
          ],
          toAt: [95, 236],
        },
        { from: 's4', to: 's5' },
        { from: 's5', to: 's6' },
        { from: 's6', to: 's7' },
      ],
    },
  ],
  solutions: [
    {
      title: 'Workflow 모델 기반 취소 오케스트레이션',
      bullets: [
        '취소를 **Temporal Workflow 모델**로 설계, 요청마다 하나의 Workflow가 전체 흐름 조율',
        '주문 상태 파악 → 옵티마이저 제외 → Plan → 창고 후보 선택 → WMS 진할당 해제 → **가할당 해제**까지 순서 보장',
        '요청 단위 실행으로 배치 주기 대기 제거, 취소 반영 **최대 5분 → 5초 이내**',
      ],
    },
    {
      title: '옵티마이저 배타적 주문 제외',
      bullets: [
        '합포 대기 중인 주문은 **옵티마이저에서 먼저 배타적으로 제외** → 이후 출고 계획에 다시 잡히지 않음',
        '제외되지 않은 출고 건만 Plan · WMS 단계로 전달 → 두 경로 동시 취소 방지',
        '멱등 처리로 재시도에도 **중복 취소 0건**',
      ],
    },
    {
      title: '부분 수량 취소 · Knapsack 기반 Shipment 최소 취소',
      bullets: [
        '부분 수량 취소를 새로 고안, 취소 수량을 여러 창고의 Shipment 중 어디서 차감할지 **Plan** 단계에서 결정',
        '취소 수량을 용량, Shipment별 수량을 무게로 둔 **Knapsack** 문제로 정의',
        '전량 취소되는 Shipment 조합을 우선 선택 → **수정되는 Shipment 최소화**',
        '출고 건별 **최적의 창고 후보** 선택 후 WMS 호출',
      ],
      diagram: {
        kind: 'canvas',
        id: 'cancel-knapsack',
        title: '3개 취소 요청 · Shipment A(3) B(2) C(1)',
        caption:
          '개념도 · 단순 분배는 Shipment 3개를 모두 수정하지만, Knapsack으로 취소 수량에 맞는 조합을 고르면 Shipment 1개만 전량 취소하면 됨',
        width: 640,
        height: 212,
        items: knapsack as CanvasItem[],
      },
    },
    {
      title: 'WMS 진할당 → 가할당 해제 조율',
      bullets: [
        '창고 재고 원복 등 WMS 측 흐름까지 **직접 설계**',
        'WMS **진할당 해제** 완료 후 Cancel Workflow가 **가할당 해제** → 시스템 간 재고 상태 일치',
      ],
    },
  ],
  results: [
    { title: '부분 수량 취소 지원', body: 'Knapsack 기반 Shipment 최소 취소로 전체 취소만 가능하던 제약 해소' },
    { title: '취소 흐름 오케스트레이션', body: '옵티마이저 · WMS · 재고 취소를 하나의 Workflow에서 순서대로 조율, 중복 취소 0건' },
    { title: '취소 반영 최대 5분 → 5초 이내', body: '요청 단위 Workflow 실행으로 클레임 감소' },
  ],
};
