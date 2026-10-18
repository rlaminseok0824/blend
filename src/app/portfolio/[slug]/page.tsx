import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findPortfolioProject, portfolioProjects } from '@/domain/portfolio/data';
import PortfolioArticle from '@/domain/portfolio/components/portfolio-article';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return portfolioProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = findPortfolioProject((await params).slug);
  return { title: project ? `${project.title} · Portfolio` : 'Portfolio' };
}

export default async function PortfolioProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const index = portfolioProjects.findIndex((project) => project.slug === slug);
  if (index < 0) notFound();

  const project = portfolioProjects[index];
  const siblings = project.projectName
    ? portfolioProjects.filter((candidate) => candidate.projectName === project.projectName)
    : [project];

  return (
    <PortfolioArticle
      project={project}
      previous={portfolioProjects[index - 1]}
      next={portfolioProjects[index + 1]}
      siblings={siblings}
    />
  );
}
