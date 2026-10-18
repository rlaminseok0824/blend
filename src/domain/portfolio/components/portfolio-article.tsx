import type { CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, ArrowRightIcon, FileTextIcon } from '@radix-ui/react-icons';
import TableOfContents from '@/domain/post-detail/components/table-of-contents';
import type { TocItem } from '@/shared/lib/toc';
import type { DiagramSpec, PortfolioProject } from '../types';
import Diagram from './diagram';
import RichText, { nestBullets } from './rich-text';

function SectionTitle({ id, index, title }: { id: string; index: string; title: string }) {
  return (
    <div id={id} className="mt-16 mb-6 scroll-mt-20">
      <div className="flex items-baseline gap-3">
        <span className="text-primary font-mono text-xs tracking-[0.14em]">{index}</span>
        <h2 className="text-foreground font-serif text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
      </div>
      <div className="border-foreground/50 mt-3 border-b" />
    </div>
  );
}

function Figure({ diagram }: { diagram: DiagramSpec }) {
  return (
    <figure className="border-line bg-gray-2/40 overflow-x-auto border p-4 sm:p-6">
      <p className="text-foreground mb-4 text-sm font-medium">{diagram.title}</p>
      <div className="min-w-[560px]">
        <Diagram spec={diagram} />
      </div>
      <figcaption className="text-gray-foreground mt-4 font-mono text-[11px] leading-relaxed">
        {diagram.caption}
      </figcaption>
    </figure>
  );
}

function buildToc(project: PortfolioProject): TocItem[] {
  const toc: TocItem[] = [];
  if (project.glossary) toc.push({ id: 'glossary', title: '용어 정의', level: 1 });
  toc.push({ id: 'problem', title: '문제 정의', level: 1 });
  project.problems.forEach((problem, index) =>
    toc.push({ id: `problem-${index + 1}`, title: problem.title, level: 2 }),
  );
  toc.push({ id: 'solution', title: '아키텍처 및 해결 방법', level: 1 });
  project.solutions.forEach((step, index) => toc.push({ id: `solution-${index + 1}`, title: step.title, level: 2 }));
  toc.push({ id: 'result', title: project.resultsTitle ?? '성과', level: 1 });
  return toc;
}

interface PortfolioArticleProps {
  project: PortfolioProject;
  previous?: PortfolioProject;
  next?: PortfolioProject;
  siblings: PortfolioProject[];
}

export default function PortfolioArticle({ project, previous, next, siblings }: PortfolioArticleProps) {
  const problemsHaveFigures = project.problems.some((problem) => problem.diagram);
  const sectionIndex = (position: number) => String(position + (project.glossary ? 1 : 0)).padStart(2, '0');

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-28 lg:pb-20">
      <div className="flex justify-center gap-10">
        <article className="pf-web max-w-4xl min-w-0 flex-1 break-keep sm:pt-4">
          <div className="text-gray-foreground flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] tracking-[0.12em] uppercase">
            <Link href="/portfolio" className="hover:text-primary inline-flex items-center gap-1.5 transition-colors">
              <ArrowLeftIcon className="h-3 w-3" />
              Portfolio
            </Link>
            <Link
              href={`/portfolio/${project.slug}/print`}
              className="border-line hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-2.5 py-1 transition-colors"
            >
              <FileTextIcon className="h-3 w-3" />
              PDF 버전
            </Link>
          </div>

          <header className="mt-10">
            <p className="text-gray-foreground font-mono text-xs">
              {project.company} · {project.team} · {project.period}
            </p>
            {project.projectName && (
              <p className="text-primary mt-4 font-mono text-xs tracking-[0.08em]">{project.projectName}</p>
            )}
            <h1 className="text-foreground mt-2 font-serif text-[clamp(2rem,5vw,3.4rem)] leading-[1.12] font-medium tracking-tight">
              {project.title}
            </h1>
            <p className="text-foreground-light mt-5 max-w-3xl text-lg leading-relaxed">
              <RichText text={project.summary} />
            </p>
            <ul className="mt-5 flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <li key={item} className="border-line text-gray-foreground border px-2 py-0.5 font-mono text-[11px]">
                  {item}
                </li>
              ))}
            </ul>
            {siblings.length > 1 && (
              <ol className="border-line mt-6 flex flex-wrap gap-x-5 gap-y-1 border-l-2 pl-3 text-sm">
                {siblings.map((sibling, index) => (
                  <li key={sibling.slug}>
                    {sibling.slug === project.slug ? (
                      <span className="text-foreground font-medium">
                        {index + 1}. {sibling.title}
                      </span>
                    ) : (
                      <Link href={`/portfolio/${sibling.slug}`} className="text-gray-foreground hover:text-primary">
                        {index + 1}. {sibling.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </header>

          <div
            className="border-foreground mt-10 grid grid-cols-2 border-t md:[grid-template-columns:repeat(var(--pf-metric-count),minmax(0,1fr))]"
            style={{ '--pf-metric-count': project.metrics.length } as CSSProperties}
          >
            {project.metrics.map((metric) => (
              <div key={metric.label} className="border-line border-b py-5 pr-4 md:border-b-0">
                <p className="text-primary font-serif text-3xl font-medium tracking-tight sm:text-4xl">
                  {metric.value}
                </p>
                <p className="text-gray-foreground mt-1 font-mono text-[11px] leading-snug">{metric.label}</p>
              </div>
            ))}
          </div>

          {project.glossary && (
            <>
              <SectionTitle id="glossary" index="01" title="용어 정의" />
              <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {project.glossary.map((entry) => (
                  <div key={entry.term} className="border-line border-l-2 pl-4">
                    <dt className="text-foreground font-medium">{entry.term}</dt>
                    <dd className="text-foreground-light mt-1 text-sm leading-relaxed">
                      <RichText text={entry.description} />
                    </dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          <SectionTitle id="problem" index={sectionIndex(1)} title="문제 정의" />
          {problemsHaveFigures ? (
            <div className="space-y-12">
              {project.problems.map((problem, index) => (
                <section key={problem.title} id={`problem-${index + 1}`} className="scroll-mt-20">
                  <p className="text-gray-foreground font-mono text-[11px]">P{index + 1}</p>
                  <h3 className="text-foreground mt-1 text-xl font-medium">{problem.title}</h3>
                  <p className="text-foreground-light mt-2 leading-relaxed">
                    <RichText text={problem.body} />
                  </p>
                  {problem.diagram && (
                    <div className="mt-5">
                      <Figure diagram={problem.diagram} />
                    </div>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {project.problems.map((problem, index) => (
                <section
                  key={problem.title}
                  id={`problem-${index + 1}`}
                  className="border-line scroll-mt-20 border p-5"
                >
                  <p className="text-gray-foreground font-mono text-[11px]">P{index + 1}</p>
                  <h3 className="text-foreground mt-2 font-medium">{problem.title}</h3>
                  <p className="text-foreground-light mt-2 text-sm leading-relaxed">
                    <RichText text={problem.body} />
                  </p>
                </section>
              ))}
            </div>
          )}

          <SectionTitle id="solution" index={sectionIndex(2)} title="아키텍처 및 해결 방법" />
          <div className="space-y-8">
            {project.diagrams.map((diagram) => (
              <Figure key={diagram.id} diagram={diagram} />
            ))}
          </div>

          <ol className="mt-10 space-y-10">
            {project.solutions.map((step, index) => (
              <li
                key={step.title}
                id={`solution-${index + 1}`}
                className="grid scroll-mt-20 gap-2 sm:grid-cols-[3.5rem_minmax(0,1fr)]"
              >
                <span className="text-primary font-mono text-sm">{String(index + 1).padStart(2, '0')}</span>
                <div className="min-w-0">
                  <h3 className="text-foreground text-lg font-medium">{step.title}</h3>
                  {step.body && (
                    <p className="text-foreground-light mt-1.5 leading-relaxed">
                      <RichText text={step.body} />
                    </p>
                  )}
                  {step.bullets && (
                    <ul className="text-foreground-light mt-2 space-y-1.5 leading-relaxed">
                      {nestBullets(step.bullets).map((bullet) => (
                        <li key={bullet.text} className="before:text-gray before:mr-2 before:content-['-']">
                          <RichText text={bullet.text} />
                          {bullet.children.length > 0 && (
                            <ul className="mt-1 mb-2 space-y-1 pl-5 text-[0.95em]">
                              {bullet.children.map((child) => (
                                <li key={child} className="before:text-gray before:mr-2 before:content-['·']">
                                  <RichText text={child} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.diagram && (
                    <div className="mt-5">
                      <Figure diagram={step.diagram} />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          <SectionTitle id="result" index={sectionIndex(3)} title={project.resultsTitle ?? '성과'} />
          <ul className="divide-line border-line divide-y border-y">
            {project.results.map((result) => (
              <li key={result.title} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
                <p className="text-foreground font-medium">{result.title}</p>
                <p className="text-foreground-light text-sm leading-relaxed sm:text-base">{result.body}</p>
              </li>
            ))}
          </ul>

          {project.notes && (
            <div className="text-gray-foreground mt-6 space-y-1 font-mono text-[11px] leading-relaxed">
              {project.notes.map((note) => (
                <p key={note}>※ {note}</p>
              ))}
            </div>
          )}

          <nav className="border-line mt-16 grid gap-3 border-t pt-6 sm:grid-cols-2">
            {previous ? (
              <Link href={`/portfolio/${previous.slug}`} className="group">
                <span className="text-gray-foreground inline-flex items-center gap-1.5 font-mono text-[11px]">
                  <ArrowLeftIcon className="h-3 w-3" /> 이전
                </span>
                <p className="group-hover:text-primary mt-1 font-medium transition-colors">{previous.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/portfolio/${next.slug}`} className="group sm:text-right">
                <span className="text-gray-foreground inline-flex items-center gap-1.5 font-mono text-[11px]">
                  다음 <ArrowRightIcon className="h-3 w-3" />
                </span>
                <p className="group-hover:text-primary mt-1 font-medium transition-colors">{next.title}</p>
              </Link>
            )}
          </nav>
        </article>

        <TableOfContents toc={buildToc(project)} />
      </div>
    </div>
  );
}
