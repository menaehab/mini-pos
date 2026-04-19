import { usePage } from '@inertiajs/react';

export default function useTranslation() {
    const { translations } = usePage().props;

    const __ = (key, replace = {}) => {
        let translation = key;

        if (!translations) {
            return translation;
        }

        // (e.g: 'keywords.login')
        if (key.includes('.')) {
            const keys = key.split('.');
            let current = translations;

            for (const k of keys) {
                if (current[k] !== undefined) {
                    current = current[k];
                } else {
                    current = undefined;
                    break;
                }
            }

            if (current !== undefined && typeof current === 'string') {
                translation = current;
            }
        } else if (translations[key] !== undefined) {
            translation = translations[key];
        }

        // Replace placeholders if any (e.g., "Hello :name")
        Object.keys(replace).forEach((replaceKey) => {
            const value = replace[replaceKey];
            translation = translation.replace(
                new RegExp(`:${replaceKey}`, 'g'),
                value,
            );
        });

        return translation;
    };

    return { __ };
}
