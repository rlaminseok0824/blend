import type { PortfolioProject } from '../types';

export const naverStreamRecovery: PortfolioProject = {
  slug: 'rag-agent-stream-recovery',
  order: 5,
  company: '네이버 클라우드',
  team: 'Applied AI Service',
  period: '체험형 인턴 2025.07–2026.01',
  title: 'RAG Agent 실시간 스트림 자동 복구',
  summary:
    '스트림 단절 시 응답이 유실돼 무한 대기하던 문제를 **Redis Streams · gRPC-SSE 디커플링** 기반 자동 복구로 해결해 **평균 대화 턴 수 약 2배 증가**',
  stack: ['Python', 'FastAPI', 'Redis', 'gRPC', 'MySQL', 'Kubernetes'],
  metrics: [
    { value: '2배', label: '평균 대화 턴 수 (전문가 평가 기준)' },
    { value: '최대 20초', label: '스트림 유실이 생기던 응답 대기 구간' },
  ],
  problems: [
    {
      title: '응답 대기 중 스트림 유실',
      body: '최대 **20초** 걸리는 응답을 기다리는 동안 새로고침하거나 다른 탭으로 들어오면 기존 스트림이 유실되고, 사용자는 **출력이 오지 않는 무한 대기**에 빠졌습니다.',
    },
    {
      title: '단일 스트림 구조',
      body: '프런트 · 서버 · AI 서버가 하나의 스트림으로 이어져 있어, 클라이언트가 비정상 종료돼도 **감지하거나 복구할 방법이 없었고** 중복 요청으로 리소스가 낭비됐습니다.',
    },
  ],
  diagrams: [
    {
      kind: 'sequence',
      id: 'nc-stream-recovery',
      title: 'Redis Streams 기반 스트림 디커플링과 복구 흐름',
      caption:
        'Client-Server(SSE)와 Server-AI(gRPC)를 분리하고, 응답을 Redis Streams에 기록해 재접속 시 같은 스트림을 이어서 전달',
      participants: [
        { id: 'user', label: 'User' },
        { id: 'server', label: 'Server' },
        { id: 'redis', label: 'Redis Cluster' },
        { id: 'ai', label: 'AI Server' },
      ],
      messages: [
        { from: 'user', to: 'server', label: '메시지 질의' },
        { from: 'server', to: 'redis', label: '스트림 상태 확인 (NX, TTL)' },
        { from: 'redis', to: 'server', label: '세션 스트림 락 획득' },
        { from: 'server', to: 'ai', label: '비동기 태스크로 gRPC 스트림 연결', tone: 'accent' },
        { from: 'server', to: 'redis', label: 'Streams 읽기 태스크 시작' },
        { from: 'server', to: 'user', label: 'SSE 200 응답' },
        { from: 'ai', to: 'server', label: '실시간 응답 청크' },
        { from: 'server', to: 'redis', label: 'Redis Streams에 기록' },
        { from: 'server', to: 'user', label: 'Streams 기반 실시간 전송' },
        { divider: '새로고침 · 멀티 탭 · 연결 끊김' },
        { from: 'user', to: 'server', label: '복구 요청 (Stream UUID)', tone: 'accent' },
        { from: 'server', to: 'user', label: '같은 스트림 이어서 전송', tone: 'accent' },
        { from: 'ai', to: 'server', label: '최종 응답' },
        { from: 'server', to: 'redis', label: 'DB 저장 후 삭제 · 락 해제' },
      ],
    },
  ],
  solutions: [
    {
      title: 'Redis Streams 도입',
      body: '생명주기가 짧은 채팅 데이터 특성에 맞춰, 가볍고 빠른 **Redis Streams**에 응답을 기록하도록 했습니다.',
    },
    {
      title: 'Redis 기반 세션 관리와 동시성 제어',
      body: '채팅 세션마다 하나의 스트림만 허용하고, 재접속 시 현재 스트림을 찾아 복구합니다.',
      bullets: [
        '**Redis NX Lock**으로 채팅 세션당 하나의 스트림만 허용',
        '**Lock TTL (1분)** 으로 서버 비정상 종료에 대응',
        '**Lock Value = Stream UUID**로 재접속 시 현재 스트림을 식별',
        '정지 후 즉시 재요청하면 기존 Lock의 UUID와 신규 요청 UUID를 비교해 경쟁 상태 방지',
      ],
    },
    {
      title: '비동기 태스크 디커플링',
      body: 'Client-Server(**SSE**)와 Server-AI(**gRPC**) 태스크를 비동기로 분리해, 클라이언트 연결이 끊겨도 응답은 Redis Streams에 계속 기록되고 재접속 시 복구됩니다.',
    },
    {
      title: '중복 저장 차단과 Fail-Fast',
      body: '메시지를 저장할 때 **Stream UUID를 유니크 키**로 써서 중복 저장을 DB 레벨에서 막았습니다. Redis 장애 시에는 AI 추론을 멈추고 메모리에 확보된 청크까지만 저장합니다.',
    },
  ],
  results: [
    { title: '평균 대화 턴 수 약 2배 증가', body: '네트워크가 불안정해도 끊김 없는 대화 경험 제공 (전문가 평가 기준)' },
    { title: '무한 대기 제거', body: '새로고침 · 멀티 탭 진입 시에도 같은 스트림을 이어서 전달' },
  ],
};
