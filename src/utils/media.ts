import { ApiError } from '@/data/api/birthdayApi';

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export const AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/wave', 'audio/vnd.wave'];
export const AUDIO_ACCEPT = '.mp3,.wav,audio/mpeg,audio/wav';
export const MAX_AUDIO_BYTES = 12 * 1024 * 1024;

export class MediaError extends Error {}

const mb = (bytes: number) => `${Math.round(bytes / 1024 / 1024)} MB`;

export function validateImageFile(file: File): void {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!IMAGE_TYPES.includes(file.type) && !['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
    throw new MediaError('That file type isn’t supported. Please choose a JPG, PNG or WEBP photo.');
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new MediaError(`That photo is ${mb(file.size)}. Please choose one under ${mb(MAX_IMAGE_BYTES)}.`);
  }
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new MediaError('We couldn’t read that file. Please try another one.'));
    reader.readAsDataURL(blob);
  });
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> decoding */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new MediaError('This image appears to be damaged or unsupported. Please try a different photo.');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Validates, downsizes (longest edge ≤ maxEdge) and re-encodes a photo so the
 * experience stays fast and the draft fits comfortably in browser storage.
 */
export async function compressImage(file: File, maxEdge = 1600, quality = 0.82): Promise<string> {
  validateImageFile(file);
  const source = await decode(file);
  const w = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const h = 'naturalHeight' in source ? source.naturalHeight : source.height;
  if (!w || !h) throw new MediaError('This image appears to be empty.');
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new MediaError('Your browser couldn’t process this image.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  if ('close' in source) source.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
  const blob = (await toBlob('image/webp')) ?? (await toBlob('image/jpeg'));
  if (!blob) throw new MediaError('We couldn’t optimise this photo. Please try another one.');
  return readAsDataUrl(blob);
}

export async function readAudioFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!AUDIO_TYPES.includes(file.type) && !['mp3', 'wav'].includes(ext)) {
    throw new MediaError('Please choose an MP3 or WAV file.');
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new MediaError(`That song is ${mb(file.size)}. Please choose one under ${mb(MAX_AUDIO_BYTES)}.`);
  }
  const url = await readAsDataUrl(file);
  await new Promise<void>((resolve, reject) => {
    const audio = new Audio();
    const timer = window.setTimeout(() => reject(new MediaError('That audio file took too long to load.')), 10000);
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      window.clearTimeout(timer);
      resolve();
    };
    audio.onerror = () => {
      window.clearTimeout(timer);
      reject(new MediaError('Your browser can’t play this audio file. Try a standard MP3.'));
    };
    audio.src = url;
  });
  return url;
}

export function errorMessage(err: unknown): string {
  // MediaError and ApiError messages are written for people to read.
  if (err instanceof MediaError || err instanceof ApiError) return err.message;
  if (err instanceof DOMException && err.name === 'QuotaExceededError') {
    return 'Your browser storage is full. Try removing a few photos or the music file.';
  }
  return 'Something went wrong while processing that file. Please try again.';
}
