import test from 'ava'
import { Plugin } from '../lib/plugin'
import { getProgram } from '../lib/commander'
import { getConf } from '../lib/config'

const [program, conf, cwd] = [
	getProgram(),
	getConf(),
	__dirname + '/merry-plugin-test/package.json',
]

test('Initialization Plugin without crashes', async t => {
	const plugin = new Plugin(program, conf, cwd)
	t.is(plugin.pkg.name, 'merry-plugin-test')
})

test('fs', async t => {
	const plugin = new Plugin(program, conf, cwd)
	t.is(plugin.conf.dist, 'src')
	const md = __dirname + '/test.md'
	await plugin.fs.writeFile(md, 'test')
	t.is(await plugin.fs.readFile(md, 'utf-8'), 'test')
	await plugin.fs.unlink(md)
	plugin.outputHelp()
})
