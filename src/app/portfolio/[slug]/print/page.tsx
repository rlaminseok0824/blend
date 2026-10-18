import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPortfolioProject, portfolioProjects } from '@/domain/portfolio/data';
import PortfolioSheet from '@/domain/portfolio/components/portfolio-sheet';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = findPortfolioProject((await params).slug);
  return { title: project ? `${project.title} · 김민석 포트폴리오` : '김민석 포트폴리오' };
}

export default async function PortfolioPrintPage({ params }: PageProps) {
  const project = findPortfolioProject((await params).slug);
  if (!project) notFound();

  return (
    <div className="pf-print">
      <PortfolioSheet project={project} />
    </div>
  );
}
