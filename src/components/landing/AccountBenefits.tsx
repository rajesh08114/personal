'use client';

import { FolderOpen, Lock, Save, Smartphone } from 'lucide-react';
import { useAuth } from '@/store/AuthProvider';

const BENEFITS = [
  {
    icon: Save,
    title: 'Every birthday, kept',
    text: 'Your work saves itself to your account. Come back next year, change a line, and publish again to the same link.',
  },
  {
    icon: Smartphone,
    title: 'Pick up on any device',
    text: 'Start on your laptop, finish on your phone. Nothing is trapped in one browser.',
  },
  {
    icon: FolderOpen,
    title: 'A library of your own',
    text: 'Upload a photo or a song once, then reuse it in any birthday you make.',
  },
  {
    icon: Lock,
    title: 'Private until you share',
    text: 'Only birthdays you publish have a link. Your drafts and library are visible to you alone, and you can unpublish at any time.',
  },
];

/** Why there is a login at all. Hidden on servers that run without accounts. */
export function AccountBenefits() {
  const auth = useAuth();
  if (auth.status === 'ready' && !auth.accountsEnabled) return null;
  return (
    <section aria-labelledby="why-account" className="border-t border-[#24201b]/20 py-16 sm:py-24">
      <p className="font-mono text-xs tracking-[0.2em] text-[#8a7f70] uppercase">Your account</p>
      <h2 id="why-account" className="mt-3 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
        A free account keeps everything you make in one private place.
      </h2>
      <ul className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex gap-4">
            <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[#24201b] shadow-sm">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 leading-relaxed text-[#5b5348]">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
