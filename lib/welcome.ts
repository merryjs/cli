import chalk from 'chalk'
import fs from 'fs-extra'
import path from 'path'

const pkg = fs.readJSONSync(path.join(__dirname, '..', 'package.json'))
const merry = `
${chalk.gray(pkg.description)}

${chalk.blue('88888b.d88b.')}   ${chalk.magenta('.d88b.')}  ${chalk.green(
	'888d888'
)} ${chalk.redBright('888d888')} ${chalk.yellow('888')}  ${chalk.yellow('888')}
${chalk.blue('888 "888 "88b')} ${chalk.magenta('d8P  Y8b')} ${chalk.green(
	'888P"'
)}   ${chalk.redBright('888P"')}   ${chalk.yellow('888')}  ${chalk.yellow(
	'888'
)}
${chalk.blue('888  888  888')} ${chalk.magenta('88888888')} ${chalk.green(
	'888'
)}     ${chalk.redBright('888')}     ${chalk.yellow('888')}  ${chalk.yellow(
	'888'
)}
${chalk.blue('888  888  888')} ${chalk.magenta('Y8b.')}     ${chalk.green(
	'888'
)}     ${chalk.redBright('888')}     ${chalk.yellow('Y88b')} ${chalk.yellow(
	'888'
)}
${chalk.blue('888  888  888')}  ${chalk.magenta('"Y8888')}  ${chalk.green(
	'888'
)}     ${chalk.redBright('888')}      ${chalk.yellow('"Y88888')}
                                            ${chalk.yellow('888')}
                                       ${chalk.yellow('Y8b d88P')}
					${chalk.yellow('"Y88P"')}

${chalk.cyan(pkg.version)}
`

console.log(merry)
