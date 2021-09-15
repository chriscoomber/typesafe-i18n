import { isTruthy } from 'typesafe-utils'
import type { GeneratorConfigWithDefaultValues, OutputFormats } from './generate-files'
import { parseTypescriptVersion, TypescriptVersion } from './generator-util'

export const OVERRIDE_WARNING =
	"// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten."

type FileEnding = `.${'ts' | 'js' | 'd.ts'}`

let outputFormat: OutputFormats = 'TypeScript'
let tsVersion: TypescriptVersion = parseTypescriptVersion('4.3')

export const configureOutputHandler = (config: GeneratorConfigWithDefaultValues, version: TypescriptVersion): void => {
	outputFormat = config.outputFormat

	shouldGenerateJsDoc = outputFormat === 'JavaScript'
	fileEnding = shouldGenerateJsDoc ? '.js' : '.ts'
	fileEndingForTypesFile = shouldGenerateJsDoc ? '.d.ts' : '.ts'
	tsCheck = shouldGenerateJsDoc
		? `
// @ts-check`
		: ''
	jsDocTsIgnore = shouldGenerateJsDoc
		? `
	// @ts-ignore`
		: ''

	tsVersion = version
	supportsTemplateLiteralTypes =
		shouldGenerateJsDoc || (tsVersion.major === 4 && tsVersion.minor >= 1) || tsVersion.major >= 5
	supportsImportType = shouldGenerateJsDoc || (tsVersion.major === 3 && tsVersion.minor >= 8) || tsVersion.major >= 4

	importTypeStatement = `import${supportsImportType ? ' type' : ''}`

	importTypes = (from, ...types) =>
		shouldGenerateJsDoc ? '' : `${importTypeStatement} { ${types.join(', ')} } from '${from}'`
	type = (type) => (shouldGenerateJsDoc ? '' : `: ${type}`)
	typeCast = (type) => (shouldGenerateJsDoc ? '' : ` as ${type}`)
	generics = (...generics) => (shouldGenerateJsDoc ? '' : `<${generics.join(', ')}>`)

	jsDocImports = (...imports) =>
		shouldGenerateJsDoc
			? `
/**${imports.filter(isTruthy).map(
					({ from, type, alias }) => `
 * @typedef { import('${from}').${type} } ${alias || type}`,
			  )}
 */
`
			: ''

	jsDocFunction = (returnType, ...params) =>
		shouldGenerateJsDoc
			? `
/**${params.map(
					({ type, name }) => `
 * @param { ${type} } ${name}`,
			  )}
 * @return { ${returnType} }
 */`
			: ''

	jsDocType = (type) => (shouldGenerateJsDoc ? `/** @type { ${type} } */` : '')

	relativeFileImportPath = (fileName: string) => `./${fileName}${config.esmImports ? '.js' : ''}`

	relativeFolderImportPath = (folderName: string) => `./${folderName}${config.esmImports ? '/index.js' : ''}`
}

// --------------------------------------------------------------------------------------------------------------------

export let supportsTemplateLiteralTypes: boolean
export let supportsImportType: boolean
export let shouldGenerateJsDoc: boolean
export let fileEnding: FileEnding
export let fileEndingForTypesFile: FileEnding
export let tsCheck: string
export let importTypeStatement: string
export let jsDocTsIgnore: string

// --------------------------------------------------------------------------------------------------------------------

export let importTypes: (from: string, ...types: string[]) => string

export let type: (type: string) => string

export let typeCast: (type: string) => string

export let generics: (...generic: string[]) => string

export let jsDocImports: (...imports: ({ from: string; type: string; alias?: string } | undefined)[]) => string

export let jsDocFunction: (returnType: string, ...params: { type: string; name: string }[]) => string

export let jsDocType: (type: string) => string

export let relativeFileImportPath: (fileName: string) => string

export let relativeFolderImportPath: (folderName: string) => string
