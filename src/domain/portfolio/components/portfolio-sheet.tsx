import type { DiagramSpec, PortfolioProject } from '../types';
import Diagram from './diagram';
import RichText, { nestBullets } from './rich-text';

function SheetFigure({ diagram }: { diagram: DiagramSpec }) {
  return (
    <figure>
      <Diagram spec={diagram} />
      <figcaption>{diagram.caption}</figcaption>
    </figure>
  );
}

// A4 layout that mirrors the existing PDF portfolio: company header, title, sections, figures.
export default function PortfolioSheet({ project }: { project: PortfolioProject }) {
  return (
    <article className="pf-sheet">
      <div className="pf-sheet-top">
        <span>김민석 포트폴리오 · Backend Engineer</span>
        <span>xornjsrlaals@gmail.com · github.com/rlaminseok0824</span>
      </div>

      <div className="pf-sheet-company">
        <div>
          <strong>{project.company}</strong>
          <em>{project.team}</em>
        </div>
        <time>{project.period}</time>
      </div>

      {project.projectName && <p className="pf-sheet-project">{project.projectName}</p>}
      <h1>{project.title}</h1>
      <p className="pf-sheet-summary">
        <RichText text={project.summary} />
      </p>
      <p className="pf-sheet-stack">
        <b>Tech Stack</b> · {project.stack.join(', ')}
      </p>

      <div className="pf-sheet-metrics" style={{ gridTemplateColumns: `repeat(${project.metrics.length}, 1fr)` }}>
        {project.metrics.map((metric) => (
          <div key={metric.label}>
            <b>{metric.value}</b>
            <span>{metric.label}</span>
          </div>
        ))}
      </div>

      {project.glossary && (
        <>
          <h2>용어 정의</h2>
          <dl className="pf-sheet-glossary">
            {project.glossary.map((entry) => (
              <div key={entry.term}>
                <dt>{entry.term}</dt>
                <dd>
                  <RichText text={entry.description} />
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      <h2>문제 정의</h2>
      <ul>
        {project.problems.map((problem) => (
          <li key={problem.title}>
            <b>{problem.title}</b> · <RichText text={problem.body} />
            {problem.diagram && <SheetFigure diagram={problem.diagram} />}
          </li>
        ))}
      </ul>

      <h2>아키텍처 및 해결 방법</h2>
      {project.diagrams.map((diagram) => (
        <SheetFigure key={diagram.id} diagram={diagram} />
      ))}
      {project.solutions.map((step, index) => (
        <div key={step.title} className="pf-sheet-step">
          <h3>
            {index + 1}. {step.title}
          </h3>
          {step.body && (
            <p>
              <RichText text={step.body} />
            </p>
          )}
          {step.bullets && (
            <ul>
              {nestBullets(step.bullets).map((bullet) => (
                <li key={bullet.text}>
                  <RichText text={bullet.text} />
                  {bullet.children.length > 0 && (
                    <ul className="pf-sheet-sub">
                      {bullet.children.map((child) => (
                        <li key={child}>
                          <RichText text={child} />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
          {step.diagram && <SheetFigure diagram={step.diagram} />}
        </div>
      ))}

      <h2>{project.resultsTitle ?? '성과'}</h2>
      <ul>
        {project.results.map((result) => (
          <li key={result.title}>
            <b>{result.title}</b> · {result.body}
          </li>
        ))}
      </ul>

      {project.notes?.map((note) => (
        <p key={note} className="pf-sheet-note">
          ※ {note}
        </p>
      ))}
    </article>
  );
}
