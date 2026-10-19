'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { BirthdayMessages, TemplateId } from '@/types/birthday';
import { Textarea, Input } from '@/components/ui/Field';
import { Suggestions } from './EditorSection';
import { TemplateSuggestionsModal } from './TemplateSuggestionsModal';
import { getTemplate } from '@/templates/registry';
import { getTemplateSuggestions } from '@/data/templateSuggestions';

interface MessageEditorProps {
  messages: BirthdayMessages;
  onChange: (patch: Partial<BirthdayMessages>) => void;
  templateId?: TemplateId;
}

export function MessageEditor({ messages, onChange, templateId }: MessageEditorProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const templateName = templateId ? getTemplate(templateId).name : 'this template';
  const suggestions = getTemplateSuggestions(templateId);

  const handleInsert = (text: string, field?: 'intro' | 'main' | 'wish' | 'surprise' | 'final' | 'memory') => {
    if (!field || field === 'main') {
      const nextMain = messages.main.trim() ? `${messages.main.trim()}\n\n${text}` : text;
      onChange({ main: nextMain });
    } else if (field === 'intro') {
      onChange({ intro: text });
    } else if (field === 'wish') {
      onChange({ wish: text });
    } else if (field === 'surprise') {
      onChange({ surprise: text });
    } else if (field === 'final') {
      onChange({ final: text });
    }
  };

  const mainIdeas = suggestions.quotes.map((q) => `"${q.text}"${q.author ? ` — ${q.author}` : ''}`);
  const wishIdeas = suggestions.wishes.slice(0, 3);
  const surpriseIdeas = suggestions.surprises.slice(0, 2);
  const closingIdeas = ['Keep smiling. Keep dreaming. Keep being you.', 'Here’s to you — today and always.'];

  return (
    <>
      {/* Suggestions and Quotes Modal Trigger */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand-soft/40 px-4 py-3 text-left transition-colors hover:border-brand/50 hover:bg-brand-soft/70"
      >
        <span className="flex items-center gap-2.5 text-sm font-semibold text-brand-700">
          <span className="flex size-7 items-center justify-center rounded-full bg-brand text-white shadow-xs">
            <Sparkles className="size-3.5" aria-hidden />
          </span>
          <span>Curated Quotes & Captions for {templateName}</span>
        </span>
        <span className="text-xs font-semibold text-brand-600 underline">Browse ideas →</span>
      </button>

      <div className="space-y-2">
        <Textarea
          label="Your personal birthday message"
          rows={7}
          maxLength={6000}
          showCount
          value={messages.main}
          onChange={(e) => onChange({ main: e.target.value })}
          placeholder="Write from the heart. Leave a blank line between paragraphs."
          hint="This is the heart of the website. Long messages are welcome — each paragraph is revealed beautifully."
        />
        {!messages.main.trim() && (
          <Suggestions
            label="Message ideas"
            items={mainIdeas.slice(0, 2)}
            onPick={(v) => onChange({ main: v })}
          />
        )}
      </div>

      <div className="space-y-2">
        <Textarea
          label="The final surprise"
          rows={3}
          maxLength={1200}
          showCount
          value={messages.surprise}
          onChange={(e) => onChange({ surprise: e.target.value })}
          placeholder="The hidden message they unlock at the very end"
        />
        {!messages.surprise.trim() && (
          <Suggestions
            label="Surprise ideas"
            items={surpriseIdeas}
            onPick={(v) => onChange({ surprise: v })}
          />
        )}
      </div>

      <div className="space-y-2">
        <Input
          label="Opening line (optional)"
          maxLength={200}
          value={messages.intro}
          onChange={(e) => onChange({ intro: e.target.value })}
          placeholder="Leave empty to use the template’s signature opening"
        />
        {suggestions.openings.length > 0 && !messages.intro && (
          <Suggestions
            label="Opening hooks"
            items={suggestions.openings.slice(0, 2)}
            onPick={(v) => onChange({ intro: v })}
          />
        )}
      </div>

      <div className="space-y-2">
        <Input
          label="After the wish"
          maxLength={300}
          value={messages.wish}
          onChange={(e) => onChange({ wish: e.target.value })}
          placeholder="May this year be your best one yet."
        />
        <Suggestions label="Wish ideas" items={wishIdeas} onPick={(v) => onChange({ wish: v })} />
      </div>

      <div className="space-y-2">
        <Input
          label="Closing line"
          maxLength={300}
          value={messages.final}
          onChange={(e) => onChange({ final: e.target.value })}
          placeholder="Keep smiling. Keep dreaming. Keep being you."
        />
        <Suggestions label="Closing ideas" items={closingIdeas} onPick={(v) => onChange({ final: v })} />
      </div>

      <TemplateSuggestionsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        templateId={templateId}
        templateName={templateName}
        onInsert={handleInsert}
      />
    </>
  );
}
