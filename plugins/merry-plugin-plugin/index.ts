import { Action, Plugin } from '../../lib/plugin'
import path from 'path'
import { linkPluginDeps, install } from '../../lib/npm'
export interface PluginAnswers {
	name: string
	description?: string
	typescript: boolean
}
export interface PluginOptions {
	install: boolean
	local: boolean
	registry: string
}
export default (api: Plugin) => {
	api
		.command('plugin [name]')
		.option('-I, --no-install', 'skip npm install')
		.option(
			'-L, --local [local]',
			'create a local plugin and put it in plugins folder'
		)
		.option('-R, --registry [registry]', 'npm registry')
		.action(async (name: string, options: PluginOptions) => {
			const answers = await api.prompt<PluginAnswers>([
				{
					name: 'name',
					message: 'Your plugin name?',
					validate: pluginName => {
						if (!pluginName) {
							return 'plugin name are required'
						}
						return true
					},
					default: name,
				},
				{
					name: 'description',
					message: 'Descriptions for plugin?',
				},
				{
					name: 'typescript',
					type: 'confirm',
					default: true,
					message: 'Do you want write your plugin with TypeScript?',
				},
			])

			const cwd = options.local
				? path.join(api.conf.pluginDir, api.getPrettyName(answers.name))
				: path.join(process.cwd(), api.getPrettyName(answers.name))
			// common
			const actions: Action[] = [
				{
					templateFile: './templates/readme.hbs',
					path: 'README.md',
				},
				{
					templateFile: './templates/package.hbs',
					path: 'package.json',
				},
			]
			// typescript only
			if (answers.typescript) {
				actions.push({
					templateFile: './templates/index_ts.hbs',
					path: 'index.ts',
					format: {
						parser: 'typescript',
					},
				})
				actions.push({
					templateFile: './templates/tsconfig.hbs',
					path: 'tsconfig.json',
					format: {
						parser: 'typescript',
					},
				})
			} else {
				actions.push({
					templateFile: './templates/index_js.hbs',
					path: 'index.js',
					format: true,
				})
			}
			// local plugins only
			if (!options.local) {
				actions.push({
					templateFile: './templates/prettierrc.hbs',
					path: '.prettierrc',
				})
				actions.push({
					templateFile: './templates/gitignore.hbs',
					path: '.gitignore',
				})
				actions.push({
					templateFile: './templates/npmignore.hbs',
					path: '.npmignore',
				})
			}

			await api.runActions(
				actions.map(a => {
					a.path = path.join(cwd, a.path)
					return a
				}),
				answers
			)

			if (options.install && answers.typescript) {
				const registry = options.registry
					? ' --registry=' + options.registry
					: ''
				await linkPluginDeps(cwd, '@merryjs/cli', registry)
				await linkPluginDeps(cwd, 'typescript', registry)
				await install(cwd, registry)
			}
		})
}
