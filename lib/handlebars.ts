import Handlebars from 'handlebars'

const debug = require('debug')('handlebars')

import changeCase from 'change-case'

const MyHelpers: {
	[key: string]: (...args: any[]) => string
} = {
	camelCase: changeCase.camel,
	properCase: changeCase.pascal,
}
const helpers = require('handlebars-helpers')({
	handlebars: Handlebars,
})

Object.keys(MyHelpers).forEach(h => Handlebars.registerHelper(h, MyHelpers[h]))

debug('register Handlebars helpers')

export default Handlebars
