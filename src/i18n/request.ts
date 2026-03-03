import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';
import {locales, defaultLocale} from './routing';

function isSupportedLocale(value: string): value is (typeof locales)[number] {
  return locales.includes(value as (typeof locales)[number]);
}

export default getRequestConfig(async ({locale}) => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const requestedLocale = locale ?? cookieLocale;
  const safeLocale = requestedLocale && isSupportedLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`./messages/${safeLocale}.json`)).default
  };
});