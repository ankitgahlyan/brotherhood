import { queryClient } from '@/lib/ton';

export function getContext() {
  return {
    queryClient,
  };
}
export default function TanstackQueryProvider() {}
