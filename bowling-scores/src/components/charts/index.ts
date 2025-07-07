/**
 * Charts index file with lazy loading
 * Export all chart components for easier imports with performance optimization
 */

import { lazy } from 'react';

// Lazy load chart components to improve initial bundle size and loading performance
export const ScoreTrendChart = lazy(() => import('./ScoreTrendChart'));
export const FramePerformanceChart = lazy(
  () => import('./FramePerformanceChart')
);
export const PinDistributionChart = lazy(
  () => import('./PinDistributionChart')
);

// For backward compatibility, also export them directly (non-lazy)
// Use these when you need immediate rendering without Suspense
export { default as ScoreTrendChartDirect } from './ScoreTrendChart';
export { default as FramePerformanceChartDirect } from './FramePerformanceChart';
export { default as PinDistributionChartDirect } from './PinDistributionChart';
