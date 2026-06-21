import * as Sentry from '@sentry/react-native';
import { performance } from 'perf_hooks';
import { useEffect, useRef } from 'react';

// Measure async function performance
export const measureAsync = async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
  return Sentry.startSpan({ name, op: 'function' }, async () => {
    const startTime = performance.now();

    try {
      const result = await fn();
      const duration = performance.now() - startTime;

      console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });
};

// Measure sync function performance
export const measureSync = <T>(name: string, fn: () => T): T => {
  const startTime = performance.now();
  const result = fn();
  const duration = performance.now() - startTime;

  console.log(`⏱️  ${name}: ${duration.toFixed(2)}ms`);
  return result;
};

// React component render tracking
export const useRenderCount = (componentName: string) => {
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
  });
};
