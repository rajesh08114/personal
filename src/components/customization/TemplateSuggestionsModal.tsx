'use client';

import { useState } from 'react';
import { Copy, Sparkles, Check, Quote, MessageSquare, Heart, Image as ImageIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { getTemplateSuggestions } from '@/data/templateSuggestions';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/utils/cn';

interface TemplateSuggestionsModalProps {
  open: boolean;
  onClose: () => void;
  templateId?: string;
  templateName?: string;
  onInsert?: (text: string, field?: 'intro' | 'main' | 'wish' | 'surprise' | 'final' | 'memory') => void;
}

type Tab = 'quotes' | 'messages' | 'wishes' | 'memories';

export function TemplateSuggestionsModal({
  open,
  onClose,
  templateId,
  templateName = 'this template',
  onInsert,
}: TemplateSuggestionsModalProps) {
  const [tab, setTab] = useState<Tab>('quotes');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const toast = useToast();
  const suggestions = getTemplateSuggestions(templateId);

  const handleCopy = (text: string, id: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedIndex(id);
    toast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleInsert = (text: string, field: 'intro' | 'main' | 'wish' | 'surprise' | 'final' | 'memory') => {
    if (onInsert) {
      onInsert(text, field);
      toast('Applied to your birthday draft!', 'success');
      onClose();
    } else {
      handleCopy(text, field);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Quotes & Captions for ${templateName}`}
      description="Curated inspirations, timeless quotes, and tailored captions matching this template's mood."
      className="sm:max-w-2xl"
    >
      <div className="space-y-5">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 border-b border-ink-200 pb-2">
          <button
            type="button"
            onClick={() => setTab('quotes')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'quotes' ? 'bg-brand text-white shadow-xs' : 'text-ink-600 hover:bg-ink-100',
            )}
          >
            <Quote className="size-3.5" aria-hidden /> Quotes & Wisdom
          </button>
          <button
            type="button"
            onClick={() => setTab('messages')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'messages' ? 'bg-brand text-white shadow-xs' : 'text-ink-600 hover:bg-ink-100',
            )}
          >
            <MessageSquare className="size-3.5" aria-hidden /> Letter & Hooks
          </button>
          <button
            type="button"
            onClick={() => setTab('wishes')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'wishes' ? 'bg-brand text-white shadow-xs' : 'text-ink-600 hover:bg-ink-100',
            )}
          >
            <Heart className="size-3.5" aria-hidden /> Wishes & Toasts
          </button>
          <button
            type="button"
            onClick={() => setTab('memories')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'memories' ? 'bg-brand text-white shadow-xs' : 'text-ink-600 hover:bg-ink-100',
            )}
          >
            <ImageIcon className="size-3.5" aria-hidden /> Memory Captions
          </button>
        </div>

        {/* Tab 1: Quotes */}
        {tab === 'quotes' && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {suggestions.quotes.map((q, i) => {
              const fullText = `"${q.text}"${q.author ? ` — ${q.author}` : ''}`;
              const id = `q-${i}`;
              return (
                <div key={i} className="group relative rounded-2xl border border-ink-200/80 bg-paper p-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/20">
                  <p className="text-sm italic leading-relaxed text-ink-900 font-serif">"{q.text}"</p>
                  {q.author && <p className="mt-1 text-xs font-semibold text-ink-500">— {q.author}</p>}
                  <div className="mt-3 flex items-center justify-end gap-2 border-t border-ink-100 pt-2.5">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(fullText, id)}
                      icon={copiedIndex === id ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                    >
                      {copiedIndex === id ? 'Copied' : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleInsert(fullText, 'main')}
                      icon={<Sparkles className="size-3.5" />}
                    >
                      Insert in letter
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Letter & Hooks */}
        {tab === 'messages' && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Opening Hooks</p>
              <div className="space-y-2">
                {suggestions.openings.map((text, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper p-3 text-sm text-ink-800">
                    <span>{text}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleInsert(text, 'intro')}>
                      Use as opening
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">Final Surprise Messages</p>
              <div className="space-y-2">
                {suggestions.surprises.map((text, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper p-3 text-sm text-ink-800">
                    <span>{text}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleInsert(text, 'surprise')}>
                      Use as surprise
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Wishes & Toasts */}
        {tab === 'wishes' && (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {suggestions.wishes.map((text, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper p-3 text-sm text-ink-800">
                <span className="font-medium">{text}</span>
                <div className="flex gap-1.5 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => handleInsert(text, 'wish')}>
                    Use as wish
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleInsert(text, 'final')}>
                    Use as closing
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Memory Captions */}
        {tab === 'memories' && (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            <p className="text-xs text-ink-500">Inspiring ideas for memory titles and story highlights:</p>
            {suggestions.memoryCaptions.map((text, i) => (
              <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-ink-200 bg-paper p-3 text-sm text-ink-800">
                <span>{text}</span>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(text, `mem-${i}`)}>
                  {copiedIndex === `mem-${i}` ? 'Copied' : 'Copy'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
