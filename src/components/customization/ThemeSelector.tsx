import { useId } from 'react';
import { Check } from 'lucide-react';
import type { ThemeColors, ThemeSettings } from '@/types/birthday';
import { THEME_PRESETS } from '@/themes/presets';
import { cn } from '@/utils/cn';

interface ThemeSelectorProps {
  theme: ThemeSettings;
  templatePalette: ThemeColors;
  templateName: string;
  onChange: (theme: ThemeSettings) => void;
}

function Swatches({ colors }: { colors: ThemeColors }) {
  return (
    <span className="flex -space-x-1.5" aria-hidden>
      {[colors.primary, colors.secondary, colors.accent].map((c, i) => (
        <span key={i} className="size-6 rounded-full border-2 border-white shadow-sm" style={{ background: c }} />
      ))}
    </span>
  );
}

export function ThemeSelector({ theme, templatePalette, templateName, onChange }: ThemeSelectorProps) {
  const options = [
    { id: 'template' as const, name: 'Template colours', description: `${templateName}’s original palette`, colors: templatePalette },
    ...THEME_PRESETS.map((p) => ({ id: p.id, name: p.name, description: p.description, colors: p.colors })),
  ];
  const current: ThemeColors =
    theme.preset === 'custom'
      ? theme
      : (options.find((o) => o.id === theme.preset)?.colors ?? templatePalette);

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Colour mood" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const active = theme.preset === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange({ ...theme, preset: o.id, ...o.colors })}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200',
                active ? 'border-brand bg-brand-soft/60 ring-2 ring-brand/20' : 'border-ink-200 bg-white hover:border-ink-300',
              )}
            >
              <Swatches colors={o.colors} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink-900">{o.name}</span>
                <span className="block truncate text-xs text-ink-500">{o.description}</span>
              </span>
              {active && <Check className="size-4 shrink-0 text-brand" aria-hidden />}
            </button>
          );
        })}
      </div>

      <fieldset className="rounded-2xl border border-ink-200 p-4">
        <legend className="px-1 text-sm font-semibold text-ink-800">Custom colours</legend>
        <p className="mb-3 text-xs text-ink-500">Fine-tune any colour — this switches the mood to “Custom”.</p>
        <div className="grid grid-cols-3 gap-3">
          {(['primary', 'secondary', 'accent'] as const).map((key) => (
            <ColorField
              key={key}
              label={key[0].toUpperCase() + key.slice(1)}
              value={current[key]}
              onChange={(v) => onChange({ ...theme, ...current, preset: 'custom', [key]: v })}
            />
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="flex flex-col items-center gap-1.5">
      <label htmlFor={id} className="relative block size-12 overflow-hidden rounded-2xl border border-ink-200 shadow-inner" style={{ background: value }}>
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </label>
      <span className="text-xs font-semibold text-ink-700">{label}</span>
      <span className="font-mono text-[0.65rem] text-ink-500 uppercase">{value}</span>
    </div>
  );
}
