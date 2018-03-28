const execa = require('execa')
const ora = require('ora')
const debug = require('debug')('npm')
const requireg = require('requireg')

/**
 * link plugin dependencies if them installed globally
 * @param cwd
 * @param pkg
 */
export const linkPluginDeps = async (
	cwd: string,
	moduleId: string,
	args: string = ''
) => {
	let exist: string | null = null

	try {
		exist = requireg.resolve(moduleId)
	} catch (error) {}

	debug('exist %o', exist)

	if (exist) {
		return await link(cwd, moduleId)
	}
	return await install(cwd, moduleId + ' ' + args)
}

/**
 * run npm link
 * @param cwd
 * @param args
 */
export const link = async (cwd: string, args: string) => {
	// install dependencies
	const spinner = ora('linking dependencies ').start()
	debug('link ' + args)
	await execa
		.shell('npm link ' + args, {
			cwd,
		})
		.then((res: any) => {
			console.log(res.stdout)
		})
		.catch((err: any) => {
			debug('Can not run npm link %o', err)
		})
	spinner.stop()
}
/**
 * run npm install
 * @param cwd
 * @param args
 */
export const install = async (cwd: string, args: string) => {
	// install dependencies
	const spinner = ora('installing dependencies ').start()
	debug('install ' + args)
	await execa
		.shell('npm install ' + args, {
			cwd,
		})
		.then((res: any) => {
			console.log(res.stdout)
		})
		.catch((err: any) => {
			debug('Can not run npm install %o', err)
		})
	spinner.stop()
}
