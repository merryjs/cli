import { Plugin, Package } from '../../lib/plugin'
import http from 'http'
import path from 'path'
import chalk from 'chalk'
const debug = require('debug')('plugin:config')
export interface ConfigOptions {
	list: boolean
	dist: string
	pluginDir: string
}
export default (api: Plugin) => {
	const install = () => {
		api
			.command('config')
			.option('-L, --list [list]', 'list configurations')
			.option('-D, --dist [dist]', 'change dist folder')
			.option('-P, --plugin-dir [pluginDir]', 'change plugin dir')
			.action(async (options: ConfigOptions) => {
				if (options.list) {
					console.log(chalk.greenBright(JSON.stringify(api.conf, null, 2)))
				}
				if (options.dist || options.pluginDir) {
					const pkgPath = path.join(process.cwd(), 'package.json')
					if (api.fs.existsSync(pkgPath)) {
						try {
							const pkg: Package = api.fs.readJsonSync(pkgPath)
							if (!pkg.merry) {
								pkg[api.conf.namespace] = {}
							}
							if (options.dist) {
								pkg.merry.dist = options.dist
							}
							if (options.pluginDir) {
								pkg.merry.pluginDir = options.pluginDir
							}

							await api.fs.writeFile(
								pkgPath,
								await api.format(JSON.stringify(pkg, null, 2), {
									parser: 'json',
								})
							)
							console.log(chalk.green('updated'))
						} catch (error) {
							console.log(chalk.red('Can not update package.json %s', error))
						}
					}
				}
				debug('options: %o', options)
			})
	}
	install()
}
