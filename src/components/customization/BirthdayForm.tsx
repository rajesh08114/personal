import type { BirthdayConfig, BirthdayMessages } from '@/types/birthday';
import { Input } from '@/components/ui/Field';
import { SegmentedControl } from '@/components/ui/Layout';
import { getTemplate } from '@/templates/registry';
import { createMemory, createTimelineItem, MAX_MEMORIES, MAX_TIMELINE } from '@/data/defaultConfig';
import { getTurningAge } from '@/utils/date';
import { EditorSection, Suggestions } from './EditorSection';
import { ImageUploader } from './ImageUploader';
import { MessageEditor } from './MessageEditor';
import { MemoryEditor } from './MemoryEditor';
import { ThemeSelector } from './ThemeSelector';
import { MusicUploader } from './MusicUploader';
import { TemplatePicker } from './TemplatePicker';

export type SectionId = 'template' | 'basics' | 'photos' | 'messages' | 'memories' | 'timeline' | 'theme' | 'music';

const RELATIONSHIPS = ['Best friend', 'Partner', 'Sister', 'Brother', 'Mom', 'Dad', 'Friend', 'Colleague'];

interface BirthdayFormProps {
  config: BirthdayConfig;
  setConfig: (fn: (prev: BirthdayConfig) => BirthdayConfig) => void;
  openSection: SectionId | null;
  onToggle: (id: SectionId) => void;
}

/** Every customisation step of the builder, as an accordion. */
export function BirthdayForm({ config, setConfig, openSection, onToggle }: BirthdayFormProps) {
  const template = getTemplate(config.templateId);
  const patch = (p: Partial<BirthdayConfig>) => setConfig((prev) => ({ ...prev, ...p }));
  const patchMessages = (p: Partial<BirthdayMessages>) => setConfig((prev) => ({ ...prev, messages: { ...prev.messages, ...p } }));
  const derivedAge = getTurningAge({ birthdayDate: config.birthdayDate });
  const memoryPhotos = config.memories.filter((m) => m.image).length;

  const section = (id: SectionId) => ({ id, open: openSection === id, onToggle: () => onToggle(id) });

  return (
    <div className="space-y-3">
      <EditorSection {...section('template')} step={1} title="Experience" summary={template.name} complete>
        <TemplatePicker value={config.templateId} onChange={(templateId) => patch({ templateId })} />
      </EditorSection>

      <EditorSection
        {...section('basics')}
        step={2}
        title="The basics"
        summary={config.birthdayPerson ? `For ${config.birthdayPerson}` : 'Who is this birthday for?'}
        complete={Boolean(config.birthdayPerson.trim() && config.senderName.trim())}
      >
        <Input
          label="Birthday person’s name"
          maxLength={60}
          value={config.birthdayPerson}
          onChange={(e) => patch({ birthdayPerson: e.target.value })}
          placeholder="e.g. Maya"
          autoComplete="off"
        />
        <Input
          label="Your name"
          maxLength={60}
          value={config.senderName}
          onChange={(e) => patch({ senderName: e.target.value })}
          placeholder="How they know you"
          hint="Shown in the signature and sign-offs."
        />
        <div className="space-y-2">
          <Input
            label="Relationship"
            maxLength={60}
            value={config.relationship}
            onChange={(e) => patch({ relationship: e.target.value })}
            placeholder="e.g. Best friend"
          />
          <Suggestions label="Relationship suggestions" items={RELATIONSHIPS} onPick={(relationship) => patch({ relationship })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Birthday date"
            type="date"
            value={config.birthdayDate ?? ''}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => patch({ birthdayDate: e.target.value || undefined })}
            hint="Used for the date, age and countdowns."
          />
          <Input
            label="Turning (age)"
            type="number"
            inputMode="numeric"
            min={1}
            max={129}
            value={config.age ?? ''}
            placeholder={derivedAge ? String(derivedAge) : 'Optional'}
            onChange={(e) => {
              const n = Number(e.target.value);
              patch({ age: e.target.value && n > 0 && n < 130 ? Math.round(n) : undefined });
            }}
            hint={derivedAge ? `Leave empty to use ${derivedAge}.` : 'Some templates celebrate the age.'}
          />
        </div>
        {config.templateId === 'four-seasons' && (
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink-800">Where do they live?</p>
            <SegmentedControl
              label="Hemisphere"
              showLabels
              value={config.hemisphere ?? 'north'}
              onChange={(h) => patch({ hemisphere: h === 'south' ? 'south' : undefined })}
              options={[
                { value: 'north', label: 'Northern hemisphere' },
                { value: 'south', label: 'Southern hemisphere' },
              ]}
            />
            <p className="text-xs text-ink-500">The year ends in the season of their birthday, e.g. a July birthday is summer up north, winter down south.</p>
          </div>
        )}
      </EditorSection>

      <EditorSection
        {...section('photos')}
        step={3}
        title="Main photos"
        summary={config.heroImage ? 'Hero photo added' : 'Add their best photo'}
        complete={Boolean(config.heroImage)}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink-800">Hero photo</p>
            <ImageUploader
              value={config.heroImage}
              onChange={(heroImage) => patch({ heroImage, heroFraming: undefined })}
              framing={config.heroFraming}
              onFramingChange={(heroFraming) => patch({ heroFraming })}
              label="Hero photo"
              emptyTitle="Add your hero photo"
              aspect="aspect-square"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-ink-800">Final photo</p>
            <ImageUploader
              value={config.finalImage}
              onChange={(finalImage) => patch({ finalImage, finalFraming: undefined })}
              framing={config.finalFraming}
              onFramingChange={(finalFraming) => patch({ finalFraming })}
              label="Final photo"
              emptyTitle="Add a closing photo"
              emptyHint="Optional — uses the hero photo if empty"
              aspect="aspect-square"
            />
          </div>
        </div>
      </EditorSection>

      <EditorSection
        {...section('messages')}
        step={4}
        title="Messages"
        summary={config.messages.main ? `${config.messages.main.trim().split(/\s+/).length} words written` : 'Write from the heart'}
        complete={Boolean(config.messages.main.trim() && config.messages.surprise.trim())}
      >
        <MessageEditor messages={config.messages} onChange={patchMessages} />
      </EditorSection>

      <EditorSection
        {...section('memories')}
        step={5}
        title="Memories"
        summary={`${config.memories.length} memories · ${memoryPhotos} photos`}
        complete={memoryPhotos >= 3}
      >
        <MemoryEditor
          items={config.memories}
          onChange={(memories) => patch({ memories })}
          create={() => createMemory()}
          max={MAX_MEMORIES}
          noun="Memory"
          titlePlaceholder="e.g. Road trip to the coast"
          captionPlaceholder="That day we’ll never forget."
          emptyPhotoTitle={(i) => (i === 0 ? 'Upload a special memory' : 'Add another moment')}
        />
      </EditorSection>

      <EditorSection
        {...section('timeline')}
        step={6}
        title="Your story"
        summary={`${config.timeline.length} chapters`}
        complete={config.timeline.length > 0}
      >
        <MemoryEditor
          items={config.timeline}
          onChange={(timeline) => patch({ timeline })}
          create={() => createTimelineItem()}
          max={MAX_TIMELINE}
          noun="Chapter"
          titlePlaceholder="e.g. The Beginning"
          captionPlaceholder="Where everything started."
          emptyPhotoTitle={() => 'Add a photo'}
        />
      </EditorSection>

      <EditorSection
        {...section('theme')}
        step={7}
        title="Colours & mood"
        summary={config.theme.preset === 'template' ? 'Template colours' : config.theme.preset.replace('-', ' ')}
        complete
      >
        <ThemeSelector
          theme={config.theme}
          templatePalette={template.palette}
          templateName={template.name}
          onChange={(theme) => patch({ theme })}
        />
      </EditorSection>

      <EditorSection
        {...section('music')}
        step={8}
        title="Music"
        summary={config.music.url ? (config.music.enabled ? config.music.name ?? 'Song added' : 'Music off') : 'Optional background song'}
        complete={Boolean(config.music.url)}
      >
        <MusicUploader music={config.music} onChange={(music) => patch({ music })} />
      </EditorSection>
    </div>
  );
}
