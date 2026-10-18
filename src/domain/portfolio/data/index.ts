import type { PortfolioProject } from '../types';
import { fulfillmentOptimization } from './fulfillment-optimization';
import { naverLlmops } from './naver-llmops';
import { naverStreamRecovery } from './naver-stream-recovery';
import { orderCancel } from './order-cancel';
import { returnzeroMailPipeline } from './returnzero-mail-pipeline';
import { returnzeroRateLimiter } from './returnzero-rate-limiter';
import { slm } from './slm';

export const portfolioProjects: PortfolioProject[] = [
  fulfillmentOptimization,
  orderCancel,
  slm,
  naverStreamRecovery,
  naverLlmops,
  returnzeroMailPipeline,
  returnzeroRateLimiter,
].sort((a, b) => a.order - b.order);

export function findPortfolioProject(slug: string) {
  return portfolioProjects.find((project) => project.slug === slug);
}
