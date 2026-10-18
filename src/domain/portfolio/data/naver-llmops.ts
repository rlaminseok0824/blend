import type { PortfolioProject } from '../types';

export const naverLlmops: PortfolioProject = {
  slug: 'langgraph-mlflow-llmops',
  order: 6,
  company: '네이버 클라우드',
  team: 'Applied AI Service',
  period: '체험형 인턴 2025.07–2026.01',
  title: 'LangGraph - MLflow 기반 LLMOps 운영 가시성 플랫폼',
  summary:
    '추론 흐름이 보이지 않아 로그로 노드를 추적하던 문제를 **NCP MLflow 커스텀 플러그인**으로 시각화하고, **ContextVar** 기반으로 비동기 동시성 결함을 해결해 **장애 대응 시간 약 60% 단축**',
  stack: ['Python', 'LangGraph', 'MLflow', 'MySQL', 'NCP Object Storage', 'Kubernetes'],
  metrics: [
    { value: '60%', label: '평균 장애 대응 시간 단축' },
    { value: '1 → N', label: 'AI 서버 동시 처리 (단일 제한 해제)' },
  ],
  problems: [
    {
      title: '에러 추적의 복잡성',
      body: '다단계 노드로 구성된 LangGraph 특성상 장애가 나면 **어떤 노드를 탔는지 로그로 추적**해야 해 디버깅에 시간이 많이 들었습니다.',
    },
    {
      title: '관측 도구 부재',
      body: '기획 의도대로 에이전트 State가 전이되는지 볼 **실시간 관측 인터페이스가 없어** 협업 효율이 떨어졌습니다.',
    },
    {
      title: '비동기 환경의 동시성 결함',
      body: 'MLflow SDK의 active_run이 **thread-local**로 동작해, 비동기 병렬 요청이 서로 막혔습니다. 그래서 AI 서버를 **1개로 제한**해 운영했습니다.',
    },
  ],
  diagrams: [
    {
      kind: 'flow',
      id: 'nc-llmops',
      title: 'LangGraph 실행 추적과 MLflow 아티팩트 저장 구조',
      caption:
        'ContextVar로 요청마다 run_id를 격리하고, 노드 실행 로그는 Tracking Server로, State 스냅샷은 NCP 커스텀 플러그인으로 Object Storage에 저장',
      width: 640,
      height: 450,
      groups: [
        { x: 200, y: 70, w: 290, h: 190, label: 'AI 서버' },
        { x: 220, y: 156, w: 255, h: 94, label: 'LangGraph 실행' },
        { x: 10, y: 285, w: 620, h: 75, label: 'MLflow 서버', tone: 'accent' },
      ],
      nodes: [
        { id: 'backend', x: 225, y: 10, w: 180, h: 44, label: '백엔드 서버', sub: '비동기 gRPC 요청' },
        { id: 'ctx', x: 225, y: 94, w: 180, h: 48, label: 'ContextVar', sub: '요청별 run_id 격리', tone: 'accent' },
        { id: 'n1', x: 270, y: 182, w: 90, h: 50, label: 'Node 1', sub: 'State' },
        { id: 'n2', x: 375, y: 182, w: 90, h: 50, label: 'Node 2', sub: 'State' },
        { id: 'ops', x: 35, y: 112, w: 140, h: 46, label: '운영팀', sub: 'MLflow UI 모니터링' },
        { id: 'track', x: 30, y: 307, w: 150, h: 40, label: 'Tracking Server' },
        {
          id: 'plugin',
          x: 385,
          y: 302,
          w: 210,
          h: 48,
          label: 'NCP 커스텀 플러그인',
          sub: 'ArtifactRepository 상속',
          tone: 'accent',
        },
        { id: 'mysql', x: 50, y: 385, w: 110, h: 54, label: 'MySQL', sub: 'Backend Store', shape: 'db' },
        { id: 'obj', x: 415, y: 385, w: 150, h: 54, label: 'NCP Object Storage', sub: 'Artifact Store', shape: 'db' },
      ],
      edges: [
        { from: 'backend', to: 'ctx' },
        { from: 'ctx', to: 'n1' },
        { from: 'n1', to: 'n2' },
        {
          from: 'n1',
          to: 'track',
          dashed: true,
          via: [
            [315, 272],
            [140, 272],
          ],
          toAt: [140, 307],
          label: '실행 로그 전송',
          labelAt: [225, 272],
        },
        {
          from: 'n2',
          to: 'plugin',
          dashed: true,
          via: [
            [420, 272],
            [490, 272],
          ],
          toAt: [490, 302],
          label: 'State 스냅샷 저장',
          labelAt: [540, 272],
        },
        { from: 'ops', to: 'track', fromAt: [90, 158], toAt: [90, 307], label: 'UI 접근', labelAt: [90, 230] },
        { from: 'track', to: 'mysql' },
        { from: 'plugin', to: 'obj' },
      ],
    },
  ],
  solutions: [
    {
      title: 'NCP 특화 MLflow 플러그인 개발',
      body: 'MLflow **ArtifactRepository를 상속**한 NCP Object Storage 커스텀 플러그인을 개발했습니다.',
    },
    {
      title: '중앙 집중형 트래킹 서버 구축',
      body: '**Backend Store(MySQL)와 Artifact Store(NCP)를 분리**해 사내 Kubernetes(n2c)에 배포했습니다.',
    },
    {
      title: '재현 가능한 실행 환경',
      body: '에이전트의 State 전이를 세션별로 묶고 단계별 스냅샷을 Artifact로 기록해, **특정 시점부터 다시 실행**할 수 있게 했습니다.',
    },
    {
      title: 'ContextVar 기반 비동기 동시성 해결',
      body: '단기적으로는 Worker 수를 늘려 스레드 간 간섭을 줄였고, 근본적으로는 **ContextVar로 요청마다 run_id를 명시적으로 전달**해 환경을 격리하고 MLflow 로깅을 비동기로 처리하도록 바꿨습니다.',
    },
  ],
  results: [
    { title: '평균 장애 대응 시간 약 60% 단축', body: '노드 단위 실행 흐름을 MLflow UI로 바로 확인' },
    { title: '단일 서버 제한 해제', body: '비동기 동시 요청을 처리할 수 있어 인프라 운영 비용 절감' },
    { title: '운영팀의 개발자 의존 제거', body: '개발자가 로그를 수동 확인하던 과정을 MLflow UI 모니터링으로 전환' },
  ],
};
