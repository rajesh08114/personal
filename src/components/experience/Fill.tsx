import { Fragment } from 'react';
import { cn } from '@/utils/cn';

interface FillProps {
  value: string | undefined | null;
  placeholder: string;
  className?: string;
}

/**
 * Renders personal text, or a clearly-marked placeholder when the creator
 * hasn't written it yet. We never invent personal details.
 */
export function Fill({ value, placeholder, className }: FillProps) {
  const text = value?.trim();
  if (text) return className ? <span className={className}>{text}</span> : <>{text}</>;
  return (
    <span className={cn('bd-placeholder', className)} title="Personalise this in the Birthday Studio (/create)">
      {placeholder}
    </span>
  );
}

/** Splits a long message into readable paragraphs (blank line or single newline). */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function Paragraphs({
  value,
  placeholder,
  className,
  paragraphClassName,
}: {
  value: string;
  placeholder: string;
  className?: string;
  paragraphClassName?: string;
}) {
  const paras = splitParagraphs(value);
  if (paras.length === 0) {
    return (
      <div className={className}>
        <p className={paragraphClassName}>
          <Fill value="" placeholder={placeholder} />
        </p>
      </div>
    );
  }
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className={paragraphClassName}>
          {p.split('\n').map((line, j, arr) => (
            <Fragment key={j}>
              {line}
              {j < arr.length - 1 && <br />}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
