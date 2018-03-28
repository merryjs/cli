import { Plugin } from '../../lib/plugin'
import path from 'path'
const debug = require('debug')('plugin:new')
import degit from 'degit'

/**
 * NewAnswers
 */
export interface NewAnswers {
	name: string
	template: string
}
export interface NewOptions {
	template: string
	cache: boolean
	force: boolean
}
export default (api: Plugin) => {
	api
		.command('new [name]')
		.option(
			'-T, --template [template]',
			'some-user/some-repo  more info https://github.com/Rich-Harris/degit'
		)
		.option('-C, --cache', 'add to cache', true)
		.option('-F, --force', 'force write to dist', true)

		.action(async (name: string, options: NewOptions) => {
			// define your own questions or remove it if you don't need it
			const answers = await api.prompt<NewAnswers>([
				{
					name: 'name',
					message: 'Your project name',
					validate: newName => {
						if (!newName) {
							return 'project name are required'
						}
						return true
					},
					default: name,
				},
				{
					name: 'template',
					message: 'Please provide the template address user/repo',
					validate: newName => {
						if (!newName) {
							return 'template are required'
						}
						return true
					},
					default: options.template || '',
				},
			])

			const emitter = degit(answers.template, {
				cache: options.cache,
				force: options.force,
				verbose: true,
			})

			emitter.on('info', (info: any) => {
				console.log(info.message)
			})

			emitter
				.clone(answers.name)
				.then(() => {
					console.log('done')
				})
				.catch((err: any) => {
					console.log(err)
				})
		})
}
