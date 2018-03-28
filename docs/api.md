---
id: api
title: API References
sidebar_label: API
---

There have a `TypeScript` type definitions which reflect the `api's` documentation

An `api` is a instance of `Plugin`

## Plugin Definitions

```typescript
/// <reference types="handlebars" />
/// <reference types="inquirer" />
/// <reference types="debug" />
import program from 'commander'
import fs, { WriteFileOptions } from 'fs-extra'
import inquirer, { Questions, Answers } from 'inquirer'
import * as npm from './npm'
import prettier, { Options } from 'prettier'
import debug from 'debug'
import 'colors'
import { PkgConf } from './config'
import Handlebars from './handlebars'
/**
 * Action
 */
export interface Action {
	/**
	 * path to new file write to
	 */
	path: string
	/**
	 * path to template file
	 */
	templateFile: string
	/**
	 * format code
	 * - provide a prettier configurations if is an object
	 * - true use default options
	 */
	format?: Options | boolean
}
export interface Package {
	name: string
	version: string
	description: string
	dependencies: {
		[key: string]: string
	}
	devDependencies: {
		[key: string]: string
	}
	merry: PkgConf
	[key: string]: any
}
export declare class Plugin {
	private readonly program
	readonly conf: PkgConf
	/**
	 * absolutely package path
	 */
	pkgCwd: string
	readonly fs: typeof fs
	readonly npm: typeof npm
	readonly prettier: typeof prettier
	readonly handlebars: typeof Handlebars
	readonly inquirer: inquirer.Inquirer
	readonly pkg: Package
	/**
	 * plugin current working directory
	 */
	readonly cwd: string
	constructor(
		program: program.CommanderStatic,
		conf: PkgConf,
		/**
		 * absolutely package path
		 */
		pkgCwd: string
	)
	/**
	 * register command with version and description builtin
	 * @param command
	 */
	command(command: string): program.Command
	/**
	 * compile Handlebars template
	 * @param templateOrFilePath path to templates
	 * @param data data
	 * @param options
	 */
	compile(
		templateOrFilePath: string,
		data: any,
		options?: CompileOptions
	): string
	/**
	 * write files to destination
	 * @param path
	 * @param data
	 * @param options
	 */
	write(
		path: string,
		data: any,
		options?: WriteFileOptions | string
	): Promise<void>
	/**
	 * write file
	 * @param path
	 * @param data
	 * @param options
	 */
	writeFile(
		path: string,
		data: any,
		options?: WriteFileOptions | string
	): Promise<void>
	/**
	 * compile and write file to destination
	 * @param template path/to/hbs
	 * @param dist path/file/will/write/to
	 * @param data data will pass to templates
	 */
	tmpl(template: string, dist: string, data: any): Promise<void>
	/**
	 * compile and write file to destination
	 * @param template path/to/hbs
	 * @param dist path/file/will/write/to
	 * @param data data will pass to templates
	 */
	tmplWithFormat(
		template: string,
		dist: string,
		data: any,
		options?: Options
	): Promise<void>
	/**
	 * compile and write file to destination
	 * @param template path/to/hbs
	 * @param data data will pass to templates
	 */
	format(code: string, options?: Options): Promise<string>
	/**
	 * questions
	 * @param questions
	 */
	prompt<T = Answers>(questions: Questions): Promise<T>
	expand(
		file: string
	): Promise<{
		overwrite: 'overwrite' | 'diff' | 'abort'
	}>
	/**
	 * get pretty name
	 * @param  {string} name
	 */
	getPrettyName(name: string): string
	/**
	 * run actions
	 * @param  {(Action|null)[]} actions
	 * @param  {T} answers
	 */
	runActions: <T>(actions: (Action | null)[], answers: T) => Promise<void>
	/**
	 * log for plugin
	 *
	 * @param formatter
	 *
	 *  ### Formatters
	 *	Debug uses [printf-style](https://wikipedia.org/wiki/Printf_format_string) formatting.
	 *	Below are the officially supported formatters:
	 *
	 *	| Formatter | Representation |
	 *	|-----------|----------------|
	 *	| `%O`      | Pretty-print an Object on multiple lines. |
	 *	| `%o`      | Pretty-print an Object all on a single line. |
	 *	| `%s`      | String. |
	 *	| `%d`      | Number (both integer and float). |
	 *	| `%j`      | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
	 *	| `%%`      | Single percent sign ('%'). This does not consume an argument. |
	 *
	 * @memberof Plugin
	 */
	log: (formatter: string, ...args: any[]) => void
	/**
	 * get a instance of node debug
	 * @param {string} namespace  you can use a customized namespace or
	 * using the default one plugin:[your-plugin]
	 * @memberof Plugin
	 */
	debug: (namespace?: string) => debug.IDebugger
}
```
