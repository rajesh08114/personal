import type { Metadata } from 'next';
import Link from 'next/link';
import { TEMPLATE_IDS } from '@/data/templateIds';
import { SiteHeader } from '@/components/ui/SiteHeader';
import { HeroActions } from '@/components/landing/HeroActions';
import { AccountBenefits } from '@/components/landing/AccountBenefits';
import { FeaturedTemplates } from '@/components/landing/FeaturedTemplates';

export const metadata: Metadata = {
  title: 'Birthday Studio — a birthday website they’ll keep',
  description:
    'Pick a hand-built template, add your photos, words and a song, and share a private link. A newspaper, a film, a biscuit tin, a night sky — your birthday, told properly.',
  alternates: { canonical: '/' },
};

const STEPS = [
  {
    title: 'Pick an experience',
    text: 'Each template is its own little world: a one-copy newspaper, a film with a projector countdown, a tin dug up from the garden.',
  },
  {
    title: 'Make it theirs',
    text: 'Add photos, write the messages, choose a song. You see it change live, on a desktop, tablet or phone frame.',
  },
  {
    title: 'Share one link',
    text: 'Send it by message. They open it on any device, with no app and no sign-up. Take it down whenever you like.',
  },
];

/** `/` — what Birthday Studio is, how it works, and where to start. */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#f4efe6] text-[#24201b]">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 pb-16 sm:px-8">
        <section aria-labelledby="hero" className="grid gap-10 pt-10 pb-16 sm:pt-20 sm:pb-24 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] text-[#8a7f70] uppercase">Birthday Studio</p>
            <h1 id="hero" className="mt-4 font-display text-5xl leading-[1.02] sm:text-7xl">
              A birthday they’ll keep, not just scroll past.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#5b5348]">
              Make a personal website for someone’s birthday in minutes. Choose from hand-built experiences, add your photos, your words and a
              song, then share it with a private link.
            </p>
            <div className="mt-8">
              <HeroActions />
            </div>
          </div>
          <aside aria-label="At a glance" className="grid grid-cols-3 gap-4 border-t border-[#24201b] pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            {[
              [String(TEMPLATE_IDS.length), 'templates'],
              ['0', 'apps to install'],
              ['1', 'link to share'],
            ].map(([figure, label]) => (
              <div key={label}>
                <p className="font-display text-4xl sm:text-5xl">{figure}</p>
                <p className="mt-1 text-sm text-[#5b5348]">{label}</p>
              </div>
            ))}
          </aside>
        </section>

        <section aria-labelledby="how" className="border-t border-[#24201b] py-16 sm:py-24">
          <p className="font-mono text-xs tracking-[0.2em] text-[#8a7f70] uppercase">How it works</p>
          <h2 id="how" className="mt-3 max-w-xl font-display text-3xl leading-tight sm:text-4xl">
            Three steps, no design skills.
          </h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t border-[#24201b]/30 pt-4">
                <span className="font-mono text-xs text-[#8a7f70]">0{i + 1}</span>
                <h3 className="mt-2 font-display text-2xl leading-tight">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-[#5b5348]">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <FeaturedTemplates />
        <AccountBenefits />

        <section aria-labelledby="start" className="border-t border-[#24201b] py-16 sm:py-24">
          <h2 id="start" className="max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Ready when you are.
          </h2>
          <div className="mt-8">
            <HeroActions placement="closing" />
          </div>
        </section>
      </main>

      <footer className="border-t border-[#24201b]/20">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-[#5b5348] sm:px-8">
          <p>© Birthday Studio</p>
          <nav aria-label="Footer" className="flex gap-5">
            <Link href="/templates" className="hover:text-[#24201b] hover:underline">
              Templates
            </Link>
            <Link href="/privacy" className="hover:text-[#24201b] hover:underline">
              Privacy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
