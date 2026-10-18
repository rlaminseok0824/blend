import type { CSSProperties } from 'react';
import type {
  CanvasDiagramSpec,
  DiagramSpec,
  FlowDiagramSpec,
  FlowEdge,
  FlowNode,
  SequenceDiagramSpec,
  Side,
} from '../types';

// Colors come from --pf-* variables so the same SVG follows the Blend theme on the web
// and stays black-on-white on the print sheet.

type Point = [number, number];

function anchor(node: FlowNode, side: Side): Point {
  const { x, y, w, h } = node;
  switch (side) {
    case 'top':
      return [x + w / 2, y];
    case 'bottom':
      return [x + w / 2, y + h];
    case 'left':
      return [x, y + h / 2];
    case 'right':
      return [x + w, y + h / 2];
  }
}

function sideToward(node: FlowNode, target: Point): Side {
  const dx = target[0] - (node.x + node.w / 2);
  const dy = target[1] - (node.y + node.h / 2);
  if (Math.abs(dx) / node.w > Math.abs(dy) / node.h) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'bottom' : 'top';
}

function center(node: FlowNode): Point {
  return [node.x + node.w / 2, node.y + node.h / 2];
}

function edgePoints(edge: FlowEdge, from: FlowNode, to: FlowNode): Point[] {
  const via = edge.via ?? [];
  const firstTarget = via[0] ?? center(to);
  const lastSource = via[via.length - 1] ?? center(from);
  const start = edge.fromAt ?? anchor(from, edge.fromSide ?? sideToward(from, firstTarget));
  const endSide = edge.toSide ?? sideToward(to, lastSource);
  const end = edge.toAt ?? anchor(to, endSide);

  if (via.length > 0) return [start, ...via, end];
  if (Math.abs(start[0] - end[0]) < 1 || Math.abs(start[1] - end[1]) < 1) return [start, end];

  const vertical = endSide === 'top' || endSide === 'bottom';
  if (vertical) return [start, [end[0], start[1]], end];
  return [start, [start[0], end[1]], end];
}

// Places the label beside the longest segment: above a horizontal run, to the right of a vertical one.
function labelPosition(points: Point[]): { at: Point; anchor: 'middle' | 'start' } {
  let best: [Point, Point] = [points[0], points[1]];
  let bestLength = -1;
  for (let i = 0; i < points.length - 1; i += 1) {
    const length = Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]);
    if (length > bestLength) {
      bestLength = length;
      best = [points[i], points[i + 1]];
    }
  }
  const mid: Point = [(best[0][0] + best[1][0]) / 2, (best[0][1] + best[1][1]) / 2];
  const horizontal = Math.abs(best[0][1] - best[1][1]) < 1;
  return horizontal ? { at: [mid[0], mid[1] - 9], anchor: 'middle' } : { at: [mid[0] + 6, mid[1]], anchor: 'start' };
}

function Lines({
  text,
  x,
  y,
  className,
  lineHeight,
  anchor = 'middle',
}: {
  text: string;
  x: number;
  y: number;
  className: string;
  lineHeight: number;
  anchor?: 'middle' | 'start' | 'end';
}) {
  const lines = text.split('\n');
  const top = y - ((lines.length - 1) * lineHeight) / 2;
  return (
    <text x={x} y={top} className={className} textAnchor={anchor} dominantBaseline="central">
      {lines.map((line, index) => (
        <tspan key={index} x={x} y={top + index * lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

function NodeShape({ node }: { node: FlowNode }) {
  const tone = `pf-tone-${node.tone ?? 'default'}`;
  const { x, y, w, h } = node;
  const cx = x + w / 2;
  const subLines = node.sub ? node.sub.split('\n').length : 0;
  const labelLines = node.label.split('\n').length;
  const blockHeight = labelLines * 14 + subLines * 12;
  const labelY = y + h / 2 - blockHeight / 2 + (labelLines * 14) / 2;
  const subY = labelY + (labelLines * 14) / 2 + (subLines * 12) / 2 + 1;

  let shape;
  if (node.shape === 'db') {
    const ry = 6;
    shape = (
      <g className={`pf-node ${tone}`}>
        <path d={`M${x},${y + ry} v${h - 2 * ry} a${w / 2},${ry} 0 0 0 ${w},0 v${-(h - 2 * ry)}`} />
        <ellipse cx={cx} cy={y + ry} rx={w / 2} ry={ry} />
      </g>
    );
  } else if (node.shape === 'diamond') {
    shape = (
      <polygon
        className={`pf-node ${tone}`}
        points={`${cx},${y} ${x + w},${y + h / 2} ${cx},${y + h} ${x},${y + h / 2}`}
      />
    );
  } else {
    shape = (
      <rect className={`pf-node ${tone}`} x={x} y={y} width={w} height={h} rx={node.shape === 'pill' ? h / 2 : 4} />
    );
  }

  return (
    <g>
      {shape}
      <Lines text={node.label} x={cx} y={labelY} className="pf-node-label" lineHeight={14} />
      {node.sub && <Lines text={node.sub} x={cx} y={subY} className="pf-node-sub" lineHeight={12} />}
    </g>
  );
}

function FlowDiagram({ spec }: { spec: FlowDiagramSpec }) {
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));
  const markerId = `pf-arrow-${spec.id}`;

  return (
    <svg
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      role="img"
      aria-label={spec.title}
      className="pf-diagram"
      style={{ '--pf-w': spec.width } as CSSProperties}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="pf-arrow-head" />
        </marker>
      </defs>

      {spec.groups?.map((group) => (
        <g key={group.label}>
          <rect
            className={`pf-group pf-tone-${group.tone ?? 'default'}`}
            x={group.x}
            y={group.y}
            width={group.w}
            height={group.h}
            rx={6}
          />
          <text x={group.x + 10} y={group.y + 16} className="pf-group-label">
            {group.label}
          </text>
        </g>
      ))}

      {spec.edges.map((edge, index) => {
        const from = nodes.get(edge.from);
        const to = nodes.get(edge.to);
        if (!from || !to) return null;
        const points = edgePoints(edge, from, to);
        const placed = edge.labelAt ? { at: edge.labelAt, anchor: 'middle' as const } : labelPosition(points);
        return (
          <g key={`${edge.from}-${edge.to}-${index}`}>
            <polyline
              points={points.map((p) => p.join(',')).join(' ')}
              className={edge.dashed ? 'pf-edge pf-edge-dashed' : 'pf-edge'}
              markerEnd={`url(#${markerId})`}
            />
            {edge.label && (
              <Lines
                text={edge.label}
                x={placed.at[0]}
                y={placed.at[1]}
                anchor={placed.anchor}
                className="pf-edge-label"
                lineHeight={12}
              />
            )}
          </g>
        );
      })}

      {spec.nodes.map((node) => (
        <NodeShape key={node.id} node={node} />
      ))}

      {spec.notes?.map((note, index) => (
        <text key={index} x={note.x} y={note.y} textAnchor={note.anchor ?? 'start'} className="pf-note">
          {note.text}
        </text>
      ))}
    </svg>
  );
}

const SEQ_COL = 150;
const SEQ_ROW = 30;
const SEQ_HEAD = 56;

function SequenceDiagram({ spec }: { spec: SequenceDiagramSpec }) {
  const columns = new Map(spec.participants.map((p, index) => [p.id, 80 + index * SEQ_COL]));
  const width = 160 + (spec.participants.length - 1) * SEQ_COL;
  const height = SEQ_HEAD + 24 + spec.messages.length * SEQ_ROW + 10;
  const markerId = `pf-arrow-${spec.id}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={spec.title}
      className="pf-diagram"
      style={{ '--pf-w': width } as CSSProperties}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="pf-arrow-head" />
        </marker>
      </defs>

      {spec.participants.map((p) => {
        const x = columns.get(p.id)!;
        return (
          <g key={p.id}>
            <line x1={x} y1={SEQ_HEAD} x2={x} y2={height - 6} className="pf-lifeline" />
            <rect x={x - 62} y={8} width={124} height={SEQ_HEAD - 16} rx={4} className="pf-node pf-tone-default" />
            <Lines text={p.label} x={x} y={8 + (SEQ_HEAD - 16) / 2} className="pf-node-label" lineHeight={13} />
          </g>
        );
      })}

      {spec.messages.map((message, index) => {
        const y = SEQ_HEAD + 30 + index * SEQ_ROW;
        if ('divider' in message) {
          return (
            <g key={index}>
              <line x1={14} y1={y} x2={width - 14} y2={y} className="pf-divider" />
              <text x={width / 2} y={y - 5} textAnchor="middle" className="pf-divider-label">
                {message.divider}
              </text>
            </g>
          );
        }
        const x1 = columns.get(message.from)!;
        const x2 = columns.get(message.to)!;
        const direction = x2 > x1 ? 1 : -1;
        const step = spec.messages.slice(0, index + 1).filter((m) => !('divider' in m)).length;
        return (
          <g key={index}>
            <line
              x1={x1}
              y1={y}
              x2={x2 - direction * 2}
              y2={y}
              className={`pf-edge ${message.dashed ? 'pf-edge-dashed' : ''} ${message.tone === 'accent' ? 'pf-edge-accent' : ''}`}
              markerEnd={`url(#${markerId})`}
            />
            <text x={(x1 + x2) / 2} y={y - 6} textAnchor="middle" className="pf-edge-label">
              {step}. {message.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function CanvasDiagram({ spec }: { spec: CanvasDiagramSpec }) {
  const markerId = `pf-arrow-${spec.id}`;

  return (
    <svg
      viewBox={`0 0 ${spec.width} ${spec.height}`}
      role="img"
      aria-label={spec.title}
      className="pf-diagram"
      style={{ '--pf-w': spec.width } as CSSProperties}
    >
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" className="pf-arrow-head" />
        </marker>
      </defs>
      {spec.items.map((item, index) => {
        switch (item.t) {
          case 'line':
            return (
              <line
                key={index}
                x1={item.x1}
                y1={item.y1}
                x2={item.x2}
                y2={item.y2}
                className={`pf-c-stroke pf-c-${item.cls ?? 'edge'}`}
                markerEnd={item.arrow ? `url(#${markerId})` : undefined}
              />
            );
          case 'path':
            return (
              <path
                key={index}
                d={item.d}
                className={`pf-c-stroke pf-c-${item.cls ?? 'edge'}`}
                markerEnd={item.arrow ? `url(#${markerId})` : undefined}
              />
            );
          case 'rect':
            return (
              <rect
                key={index}
                x={item.x}
                y={item.y}
                width={item.w}
                height={item.h}
                rx={item.rx ?? 3}
                className={`pf-c-fill pf-c-${item.cls ?? 'node'}`}
              />
            );
          case 'circle':
            return <circle key={index} cx={item.cx} cy={item.cy} r={item.r} className={`pf-c-${item.cls ?? 'dot'}`} />;
          case 'text':
            return (
              <Lines
                key={index}
                text={item.text}
                x={item.x}
                y={item.y}
                anchor={item.anchor === 'end' ? 'end' : (item.anchor ?? 'middle')}
                className={`pf-c-text pf-c-text-${item.cls ?? 'label'}`}
                lineHeight={13}
              />
            );
        }
      })}
    </svg>
  );
}

export default function Diagram({ spec }: { spec: DiagramSpec }) {
  if (spec.kind === 'flow') return <FlowDiagram spec={spec} />;
  if (spec.kind === 'sequence') return <SequenceDiagram spec={spec} />;
  return <CanvasDiagram spec={spec} />;
}
