import fs from 'fs-extra'
import path from 'path'
import program from 'commander'
import { getProgram } from './commander'
import pkgUp from 'pkg-up'
import resolvePkg from 'resolve-pkg'
import { PkgConf, getConf } from './config'
const debug = require('debug')('app:main')
import { Plugin, Package } from './plugin'
const requireg = require('requireg')
const globalDirs = require('global-dirs')

export class App {
	/**
	 * program
	 */
	protected readonly program: program.CommanderStatic
	/**
	 * user configurations
	 */
	protected conf: PkgConf
	/**
	 * plugin's name
	 */
	protected plugins: any[] = []
	constructor() {
		this.conf = getConf()
		this.program = getProgram()
	}
	/**
	 * is plugin folder
	 */
	private isPluginFolder = (folder: string) => {
		return new RegExp(this.conf.prefix).test(folder)
	}
	/**
	 * add plugin
	 * @param pluginName plugin name
	 * @param cwd plugin cwd
	 */
	private async addPlugin(pluginName: string, cwd: string, checkDeps = true) {
		debug('add plugin: %o at %o', pluginName, cwd)
		const pkgCwd = pkgUp.sync(cwd)
		if (!pkgCwd) {
			return
		}
		if (checkDeps) {
			// add missing deps
			await require('check-dependencies')({
				install: true,
				verbose: false,
				packageDir: cwd,
			})
		}
		if (!this.plugins.includes(pluginName)) {
			const plugin = requireg(cwd)
			const plug = plugin.default || plugin
			if (typeof plug === 'function') {
				try {
					const Plug = new Plugin(this.program, this.conf, pkgCwd)
					plug(Plug)
					this.plugins.push(pluginName)
					debug('loading plugin at path: %o succeed', cwd)
				} catch (error) {
					debug('loading plugin at path: %o failed with errors: %o', cwd, error)
				}
			} else {
				debug(
					'loading plugin at path: %o failed\n%s must be a function instead of %o',
					cwd,
					pluginName,
					typeof plug
				)
			}
		}
	}
	/**
	 * load local plugins defined by user
	 * @param dir dir for local plugins
	 */
	private async loadPluginsByDir(dir: string, checkDeps = true) {
		if (!fs.pathExistsSync(dir)) {
			debug('Not found local plugins at: %o', dir)
			return
		}
		let folders = await fs.readdir(dir)
		if (folders && folders.length) {
			folders = folders.filter(f => this.isPluginFolder(f))
			for (const f of folders) {
				const cwd = path.join(dir, f)
				await this.addPlugin(f, cwd, checkDeps)
			}
		}
	}
	/**
	 * load ./plugins
	 */
	private async loadUserLocalPlugins() {
		const cwd = path.join(process.cwd(), this.conf.pluginDir)
		await this.loadPluginsByDir(cwd)
	}
	/**
	 * loading plugins which install it as a dependence in package.json
	 */
	private async loadPlugins() {
		const cwdPkg = path.join(process.cwd(), 'package.json')
		if (!fs.existsSync(cwdPkg)) {
			return
		}
		debug('finding npm plugins in %o ', cwdPkg)
		const pkg: Package = await fs.readJSON(cwdPkg)
		if (pkg.dependencies || pkg.devDependencies) {
			const deps = { ...pkg.dependencies, ...pkg.devDependencies }
			const npmPlugins = Object.keys(deps).filter(f => this.isPluginFolder(f))
			debug('npm plugins: %o', npmPlugins)
			for (const dep of npmPlugins) {
				const cwd = resolvePkg(dep)
				if (cwd) {
					await this.addPlugin(dep, cwd, false)
				} else {
					console.log(
						'can not find %o, make sure you have installed it already',
						dep
					)
				}
			}
		}
	}
	private async loadGlobalPlugins() {
		await this.loadPluginsByDir(globalDirs.npm.packages, false)
		await this.loadPluginsByDir(globalDirs.yarn.packages, false)
	}
	/**
	 * install plugins the order is:
	 *  - user local plugins
	 *  - system local plugins
	 *  - plugins
	 */
	public async install() {
		await this.loadPluginsByDir(path.join(__dirname, 'plugins'))
		await this.loadUserLocalPlugins()
		await this.loadPlugins()
		await this.loadGlobalPlugins()
	}

	/**
	 * run a plugin immediately
	 * @param plugin local plugin for debug
	 *  - ./path/to/plugin-entry
	 *  - /path/to/plugin-entry
	 *  - merry-plugin-awesome-plugin
	 * @param options
	 */
	private async debug(plugin: string, options: any) {
		debug('isAbsolute: %o', path.isAbsolute(plugin))

		if (!path.isAbsolute(plugin) && this.isPluginFolder(plugin)) {
			await this.addPlugin(plugin, process.cwd())
		} else {
			plugin = path.isAbsolute(plugin)
				? plugin
				: path.join(process.cwd(), plugin)

			if (fs.existsSync(plugin)) {
				try {
					const p = require(plugin)
					const plug = p.default || p
					const pkgCwd = pkgUp.sync(plugin)
					const Plug = new Plugin(this.program, this.conf, pkgCwd)
					plug(Plug)
					debug('loading plugin at path: %o succeed', pkgCwd)
				} catch (error) {
					debug('error: %o', error)
				}
			}
		}
	}
	/**
	 * install plugins and run
	 */
	public async run() {
		await this.install()
		// only install debug plugin in DEBUG mode
		if (!!process.env.DEBUG) {
			this.program
				.command('debug [plugin]')
				.action((p: string, options: any) => {
					this.debug(p, options)
				})
		}
		this.program.parse(process.argv)

		if (!process.argv.slice(2).length) {
			this.program.outputHelp()
		}
	}
}

export default new App()
