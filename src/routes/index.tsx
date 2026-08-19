import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { ManagePage } from '../pages/manage/ManagePage';

export const manageSearchSchema = z.object({
  tab: z
    .enum([
      'identity',
      'economy',
      'social',
      'credit',
      'governance',
      'lottery',
      'admin',
      'transfer',
      'burn',
      'invite',
      'vote',
      'destroy',
      'issue',
      'allowance',
    ])
    .optional()
    .default('identity'),
});

export const Route = createFileRoute('/')({
  validateSearch: manageSearchSchema,
  // Client-only dashboard: rendering happens entirely in the browser (SPA).
  // Prerender still emits a static shell for GitHub Pages.
  ssr: false,
  component: ManageRoute,
});

function ManageRoute() {
  const { tab } = Route.useSearch();

  return <ManagePage initialTab={tab} />;
}
