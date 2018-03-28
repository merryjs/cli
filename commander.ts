import program from 'commander'
import fs from 'fs-extra'
import path from 'path'
let p: program.CommanderStatic

const pkg = fs.readJSONSync(path.join(__dirname, 'package.json'))

program.version(pkg.version).description(pkg.description)

export const getProgram = () => {
	if (!p) {
		p = program
	}
	return p
}
