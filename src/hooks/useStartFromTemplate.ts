'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { TemplateId } from '@/types/birthday';
import { useAuth } from '@/store/AuthProvider';
import { useDraft } from '@/store/DraftProvider';
import { useToast } from '@/components/ui/Toast';
import { errorMessage } from '@/utils/media';

/**
 * "Use this template": opens the studio with that template.
 *  - Signed in: starts a new birthday, so the one being worked on isn't changed behind the user's back.
 *  - Accounts on but signed out: logs in first, then arrives in the studio with the template.
 *  - No accounts: switches the single local draft to it.
 */
export function useStartFromTemplate() {
  const router = useRouter();
  const toast = useToast();
  const auth = useAuth();
  const { patch, newWork, accountMode } = useDraft();
  return useCallback(
    async (id: TemplateId) => {
      if (auth.accountsEnabled && !auth.user) {
        router.push(`/login?next=${encodeURIComponent(`/create?template=${id}`)}`);
        return;
      }
      try {
        if (accountMode) await newWork(id);
        else patch({ templateId: id });
        router.push('/create');
      } catch (err) {
        toast(errorMessage(err), 'error');
      }
    },
    [auth.accountsEnabled, auth.user, accountMode, newWork, patch, router, toast],
  );
}
