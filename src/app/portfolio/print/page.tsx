import type { Metadata } from 'next';
import { portfolioProjects } from '@/domain/portfolio/data';
import PortfolioSheet from '@/domain/portfolio/components/portfolio-sheet';

export const metadata: Metadata = {
  title: '김민석 포트폴리오',
};

export default function PortfolioPrintAllPage() {
  return (
    <div className="pf-print">
      {portfolioProjects.map((project) => (
        <PortfolioSheet key={project.slug} project={project} />
      ))}
    </div>
  );
}
