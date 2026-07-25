import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useState } from 'react';

import { QUERY_STALE_MS } from '@/config/constants';

export function QueryProvider({ children }: PropsWithChildren) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: QUERY_STALE_MS, retry: 2 } },
      }),
  );
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
