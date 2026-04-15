import { en } from './locales/en';
import { vi } from './locales/vi';
import { ja } from './locales/ja';
import { TranslationKeys } from './types';

export { TranslationKeys };

export const translations: Record<string, TranslationKeys> = {
    en,
    vi,
    ja
};

export type Locale = keyof typeof translations;
