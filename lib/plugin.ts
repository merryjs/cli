import program from 'commander'
import fs, { WriteFileOptions } from 'fs-extra'
import inquirer, { Questions, Question, Answers } from 'inquirer'
import * as npm from './npm'
import prettier, { Options } from 'prettier'
import path from 'path'
import debug from 'debug'

import diff = require('diff')
import 'colors'
import { PkgConf } from './config'

import Handlebars from './handlebars'
// register autocomplete plugin
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
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
export class Plugin {
	public readonly fs = fs
	public readonly npm = npm
	public readonly prettier = prettier
	public readonly handlebars = Handlebars
	public readonly inquirer = inquirer
	public readonly pkg: Package

	/**
	 * plugin current working directory
	 */
	public readonly cwd: string
	constructor(
		private readonly program: program.CommanderStatic,
		public readonly conf: PkgConf,
		/**
		 * absolutely package path
		 */
		public pkgCwd: string
	) {
		this.program = program
		this.conf = conf
		this.pkgCwd = pkgCwd
		this.pkg = fs.readJSONSync(this.pkgCwd)
		this.cwd = path.dirname(this.pkgCwd)
	}
	/**
	 * register command with version and description builtin
	 * @param command
	 */
	public command(command: string): program.Command {
		return this.program
			.command(command)
			.version(this.pkg.version, '-v, --version')
			.description(this.pkg.description)
	}
	/**
	 * compile Handlebars template
	 * @param templateOrFilePath path to templates
	 * @param data data
	 * @param options
	 */
	public compile(
		templateOrFilePath: string,
		data: any,
		options?: CompileOptions
	) {
		//  content
		const isTemplateString =
			templateOrFilePath === path.basename(templateOrFilePath)
		let input: string
		if (isTemplateString) {
			input = templateOrFilePath
		} else {
			let filePath = templateOrFilePath
			if (!path.isAbsolute(templateOrFilePath)) {
				filePath = path.join(this.cwd, templateOrFilePath)
			}
			input = fs.readFileSync(filePath, 'utf-8')
		}
		return this.handlebars.compile(input, options)(data)
	}
	/**
	 * write files to destination
	 * @param path
	 * @param data
	 * @param options
	 */
	public async write(
		path: string,
		data: any,
		options: WriteFileOptions | string = 'utf-8'
	) {
		const exist = await fs.pathExists(path)
		if (exist) {
			const action = await this.expand(path)
			switch (action.overwrite) {
				case 'diff':
					const diffs = diff.diffChars(
						fs.readFileSync(path, {
							encoding: 'utf-8',
						}),
						data
					)
					diffs.forEach(function(part) {
						// green for additions, red for deletions
						// grey for common parts
						var color = part.added ? 'green' : part.removed ? 'red' : 'grey'
						process.stderr.write((part.value as any)[color])
					})
					break
				case 'overwrite':
					await this.writeFile(path, data, options)
					break
				case 'abort':
					break
				default:
					break
			}
		} else {
			await this.writeFile(path, data, options)
		}
	}
	/**
	 * write file
	 * @param path
	 * @param data
	 * @param options
	 */
	public async writeFile(
		path: string,
		data: any,
		options: WriteFileOptions | string = 'utf-8'
	) {
		try {
			await fs.ensureFile(path)
			await fs.writeFile(path, data, options)
			this.log('write file %s success', path)
		} catch (error) {
			this.log('write file failed %O', error)
		}
	}
	/**
	 * compile and write file to destination
	 * @param template path/to/hbs
	 * @param dist path/file/will/write/to
	 * @param data data will pass to templates
	 */
	public async tmpl(template: string, dist: string, data: any) {
		dist = dist.replace(/\\/g, '/')
		dist = this.handlebars.compile(dist)(data)
		return this.write(dist, this.compile(template, data))
	}
	/**
	 * compile and write file to destination
	 * @param template path/to/hbs
	 * @param dist path/file/will/write/to
	 * @param data data will pass to templates
	 */
	public async tmplWithFormat(
		template: string,
		dist: string,
		data: any,
		options?: Options
	) {
		const code = this.compile(template, data)
		dist = this.handlebars.compile(dist)(data)
		return this.write(dist, await this.format(code, options))
	}
	/**
	 * compile and write file to destination
	 * @param template path/to/hbs
	 * @param data data will pass to templates
	 */
	public async format(code: string, options?: Options) {
		// resolve user configurations
		const config = await prettier.resolveConfig(process.cwd())
		if (config !== null && !options) {
			options = config
		}
		if (config && options) {
			options = { ...config, ...options }
		}
		return prettier.format(code, options)
	}
	/**
	 * questions
	 * @param questions
	 */
	public async prompt<T = Answers>(questions: Questions<T>) {
		const answers = await inquirer.prompt(questions)
		return answers as T
	}
	public async expand(file: string) {
		return this.prompt<{
			overwrite: 'overwrite' | 'diff' | 'abort'
		}>([
			{
				type: 'expand',
				message: `Conflict on '${file}': `,
				name: 'overwrite',
				choices: [
					{
						key: 'y',
						name: 'Overwrite',
						value: 'overwrite',
					},
					{
						key: 'd',
						name: 'Show diff',
						value: 'diff',
					},
					new inquirer.Separator(),
					{
						key: 'x',
						name: 'Abort',
						value: 'abort',
					},
				],
			},
		])
	}
	/**
	 * get pretty name
	 * @param  {string} name
	 */
	public getPrettyName(name: string) {
		return `${this.conf.prefix}${name}`
	}
	/**
	 * run actions
	 * @param  {(Action|null)[]} actions
	 * @param  {T} answers
	 */
	public runActions = async <T>(actions: (Action | null)[], answers: T) => {
		for (const action of actions) {
			// skip null or action have no path
			if (!action || !action.path) {
				continue
			}
			if (action.format) {
				await this.tmplWithFormat(
					action.templateFile,
					action.path,
					answers,
					action.format === true ? undefined : action.format
				)
			} else {
				await this.tmpl(action.templateFile, action.path, answers)
			}
		}
	}
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
	public log = (formatter: string, ...args: any[]) => {
		const log = this.debug()
		// we use debug as logger and force enable it for current plugin
		log.enabled = true
		log(formatter, ...args)
	}

	/**
	 * get a instance of node debug
	 * @param {string} namespace  you can use a customized namespace or
	 * using the default one plugin:[your-plugin]
	 * @memberof Plugin
	 */
	public debug = (
		namespace = `plugin:${this.pkg.name.replace(this.conf.prefix, '')}`
	) => {
		return debug(namespace)
	}
}
