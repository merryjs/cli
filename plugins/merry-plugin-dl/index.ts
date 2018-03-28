const download = require('download')
import { Plugin } from '../../plugin'

export default (api: Plugin) => {
	api
		.command('dl [url]')
		.option('-e, --extract [extract]', 'Try decompressing the file')
		.option('-o, --out [out]', 'Where to place the downloaded files')
		.option(
			'-s, --strip [strip]',
			'Strip leading paths from file names on extraction'
		)
		.option('--filename [filename]', 'Name of the saved file')
		.option('--proxy [proxy]', 'Proxy endpoint')
		.action(async (url, options) => {
			if (!url && !options.out) {
				api.log('url is required')
				return
			}
			try {
				const dl = download(url, options.out, options)

				if (!options.out) {
					dl.pipe(process.stdout)
				} else {
					api.log('file %s saved', url)
				}
			} catch (error) {
				api.log('download failed %s', error)
			}
		})
}
