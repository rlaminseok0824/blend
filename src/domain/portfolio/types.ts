// Text fields accept **bold** markup, rendered by RichText.

export interface FlowNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sub?: string;
  shape?: 'box' | 'pill' | 'db' | 'diamond';
  tone?: 'default' | 'accent' | 'muted';
}

export type Side = 'top' | 'right' | 'bottom' | 'left';

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  fromSide?: Side;
  toSide?: Side;
  via?: Array<[number, number]>;
  fromAt?: [number, number];
  toAt?: [number, number];
  labelAt?: [number, number];
}

export interface FlowGroup {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  tone?: 'default' | 'accent' | 'muted';
}

export interface FlowDiagramSpec {
  kind: 'flow';
  id: string;
  title: string;
  caption: string;
  width: number;
  height: number;
  groups?: FlowGroup[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  notes?: Array<{ x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }>;
}

export interface SequenceMessage {
  from: string;
  to: string;
  label: string;
  dashed?: boolean;
  tone?: 'default' | 'accent';
}

export interface SequenceDiagramSpec {
  kind: 'sequence';
  id: string;
  title: string;
  caption: string;
  participants: Array<{ id: string; label: string }>;
  messages: Array<SequenceMessage | { divider: string }>;
}

// Free-form drawing for timelines and concept charts; coordinates are in viewBox units.
export type CanvasItem =
  | { t: 'line'; x1: number; y1: number; x2: number; y2: number; cls?: CanvasStroke; arrow?: boolean }
  | { t: 'path'; d: string; cls?: CanvasStroke; arrow?: boolean }
  | { t: 'rect'; x: number; y: number; w: number; h: number; cls?: CanvasFill; rx?: number }
  | { t: 'circle'; cx: number; cy: number; r: number; cls?: 'dot' | 'dot-accent' | 'dot-muted' }
  | {
      t: 'text';
      x: number;
      y: number;
      text: string;
      cls?: 'label' | 'strong' | 'sub' | 'accent' | 'muted';
      anchor?: 'start' | 'middle' | 'end';
    };

export type CanvasStroke = 'axis' | 'grid' | 'edge' | 'dashed' | 'accent' | 'accent-dashed' | 'muted' | 'boundary';
export type CanvasFill = 'node' | 'accent' | 'muted' | 'band' | 'band-accent' | 'band-muted';

export interface CanvasDiagramSpec {
  kind: 'canvas';
  id: string;
  title: string;
  caption: string;
  width: number;
  height: number;
  items: CanvasItem[];
}

export type DiagramSpec = FlowDiagramSpec | SequenceDiagramSpec | CanvasDiagramSpec;

export interface GlossaryTerm {
  term: string;
  description: string;
}

export interface ProblemPoint {
  title: string;
  body: string;
  diagram?: DiagramSpec;
}

export interface SolutionStep {
  title: string;
  body?: string;
  bullets?: string[];
  diagram?: DiagramSpec;
}

export interface Metric {
  value: string;
  label: string;
}

export interface ResultPoint {
  title: string;
  body: string;
}

export interface PortfolioProject {
  slug: string;
  order: number;
  company: string;
  team: string;
  period: string;
  // Pages that belong to the same resume project share this name and link to each other.
  projectName?: string;
  title: string;
  summary: string;
  stack: string[];
  metrics: Metric[];
  glossary?: GlossaryTerm[];
  problems: ProblemPoint[];
  diagrams: DiagramSpec[];
  solutions: SolutionStep[];
  resultsTitle?: string;
  results: ResultPoint[];
  notes?: string[];
}
