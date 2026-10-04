import type { BirthdayMessages } from '@/types/birthday';
import { Textarea, Input } from '@/components/ui/Field';
import { Suggestions } from './EditorSection';

const MAIN_IDEAS = [
  'Happy birthday to the person who makes every ordinary day feel special. Thank you for being exactly who you are.',
  'Another year of laughing until it hurts, of adventures and of you being wonderfully you. I’m so grateful we get to do life together.',
];
const SURPRISE_IDEAS = [
  'No matter how many birthdays come and go, I hope you always remember how special you are.',
  'You make the world softer and brighter just by being in it. Never stop being you.',
];
const WISH_IDEAS = ['May this year be your best one yet.', 'May every wish you made today find its way to you.'];
const FINAL_IDEAS = ['Keep smiling. Keep dreaming. Keep being you.', 'Here’s to you — today and always.'];

interface MessageEditorProps {
  messages: BirthdayMessages;
  onChange: (patch: Partial<BirthdayMessages>) => void;
}

export function MessageEditor({ messages, onChange }: MessageEditorProps) {
  return (
    <>
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
        {!messages.main.trim() && <Suggestions label="Message ideas" items={MAIN_IDEAS} onPick={(v) => onChange({ main: v })} />}
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
          <Suggestions label="Surprise ideas" items={SURPRISE_IDEAS} onPick={(v) => onChange({ surprise: v })} />
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
      </div>
      <div className="space-y-2">
        <Input
          label="After the wish"
          maxLength={300}
          value={messages.wish}
          onChange={(e) => onChange({ wish: e.target.value })}
          placeholder="May this year be your best one yet."
        />
        <Suggestions label="Wish ideas" items={WISH_IDEAS} onPick={(v) => onChange({ wish: v })} />
      </div>
      <div className="space-y-2">
        <Input
          label="Closing line"
          maxLength={300}
          value={messages.final}
          onChange={(e) => onChange({ final: e.target.value })}
          placeholder="Keep smiling. Keep dreaming. Keep being you."
        />
        <Suggestions label="Closing ideas" items={FINAL_IDEAS} onPick={(v) => onChange({ final: v })} />
      </div>
    </>
  );
}
