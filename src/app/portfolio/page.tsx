import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, FileTextIcon } from '@radix-ui/react-icons';
import { portfolioProjects } from '@/domain/portfolio/data';
import RichText from '@/domain/portfolio/components/rich-text';

export const metadata: Metadata = {
  title: 'Portfolio · Blend',
  description: '김민석 포트폴리오',
};

export default function PortfolioIndexPage() {
  const companies = [...new Set(portfolioProjects.map((project) => project.company))];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8 pb-20 break-keep sm:pt-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-[clamp(3.5rem,10vw,6.5rem)] leading-none font-medium">Portfolio</h1>
          <p className="text-gray-foreground mt-2 font-mono text-[11px] tracking-[0.08em] uppercase">
            김민석 · Backend Engineer
          </p>
        </div>
        <Link
          href="/portfolio/print"
          className="border-line hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors"
        >
          <FileTextIcon className="h-3 w-3" />
          전체 PDF 버전
        </Link>
      </div>

      {companies.map((company) => {
        const projects = portfolioProjects.filter((project) => project.company === company);
        return (
          <section key={company} className="mt-14">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-2xl font-medium">
                {company} <span className="text-gray-foreground text-base">{projects[0].team}</span>
              </h2>
              <span className="text-gray-foreground font-mono text-[11px]">{projects[0].period}</span>
            </div>
            <div className="border-foreground/50 mt-3 border-b" />
            <ul className="divide-line divide-y">
              {projects.map((project) => (
                <li key={project.slug}>
                  <Link href={`/portfolio/${project.slug}`} className="group grid gap-2 py-5 sm:grid-cols-[1fr_auto]">
                    <div>
                      <p className="group-hover:text-primary text-lg font-medium transition-colors">{project.title}</p>
                      <p className="text-foreground-light mt-1 text-sm leading-relaxed">
                        <RichText text={project.summary} />
                      </p>
                    </div>
                    <ArrowRightIcon className="text-gray group-hover:text-primary mt-1.5 hidden h-4 w-4 transition-colors sm:block" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
