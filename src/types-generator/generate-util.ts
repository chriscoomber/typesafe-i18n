import { UTIL_FILE } from '../constants/constants'
import { writeFileIfContainsChanges } from './file-utils'

const getUtil = (baseLocale: string, locales: string[]): string => {
	const localesImports = locales
		.map(
			(locale) => `
import ${locale.replace('-', '_')} from './${locale}'`,
		)
		.join('')

	const localesTranslations = locales
		.map(
			(locale) => `
	${locale}${locale === baseLocale ? `: ${locale} as LangaugeTranslation` : ''},`,
		)
		.join('')

	const localesTranslationLoaders = locales
		.map(
			(locale) => `
	${locale}: () => import('./${locale}'),`,
		)
		.join('')

	return `// This types were auto-generated. Any manual changes will be overwritten.
/* eslint-disable */

import type { LocaleTranslations } from 'langauge'
import type {
	LangaugeTranslation,
	LangaugeTranslationArgs,
	LangaugeFormatters,
	LangaugeLocales,
} from './langauge-types'
import { getLangaugeInstance, initLangauge } from 'langauge'
import { initFormatters } from './formatters'
${localesImports}

export const localeTranslations: LocaleTranslations<LangaugeLocales, LangaugeTranslation> = {${localesTranslations}
}

export const getLocaleTranslations = (locale: LangaugeLocales) => localeTranslations[locale]

export const localeTranslationLoaders = {${localesTranslationLoaders}
}

export const loadLocaleTranslations = async (locale: LangaugeLocales) => (await localeTranslationLoaders[locale]()).default as LangaugeTranslation

export const getLangauge = () => initLangauge<LangaugeLocales, LangaugeTranslation, LangaugeTranslationArgs, LangaugeFormatters>(localeTranslations, initFormatters)

export const getLangaugeForLocale = (locale: LangaugeLocales) => getLangaugeInstance<LangaugeLocales, LangaugeTranslation, LangaugeTranslationArgs, LangaugeFormatters>(locale, localeTranslations, initFormatters)
`
}

export const generateUtil = async (
	outputPath: string,
	utilFile: string | undefined = UTIL_FILE,
	locales: string[],
	baseLocale: string,
): Promise<void> => {
	const util = getUtil(baseLocale, locales)
	await writeFileIfContainsChanges(outputPath, utilFile, util)
}
