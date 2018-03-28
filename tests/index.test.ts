import test from 'ava'
import { App } from '../index'

class TestApp extends App {
	constructor() {
		super()
	}
	get getConf() {
		return this.conf
	}
}

test('Initialization App without crashes', async t => {
	const app = new TestApp()
	t.is(app.getConf.prefix, 'merry-plugin-')
})
