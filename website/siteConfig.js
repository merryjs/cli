/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* List of projects/orgs using your project for the users page */
const users = [
	// {
	//   caption: 'User1',
	//   image: '/cli/img/docusaurus.svg',
	//   infoLink: 'https://www.facebook.com',
	//   pinned: true,
	// },
]
const repoUrl = 'https://github.com/merryjs/cli'
const siteConfig = {
	title: 'Merry' /* title for your website */,
	tagline: 'A command line help you manage project related generators',
	url: 'https://merryjs.github.io' /* your website url */,
	baseUrl: '/cli/' /* base url for your project */,
	headerLinks: [
		{ doc: 'how', label: 'Plugins' },
		{ doc: 'api', label: 'API' },
		{
			href: repoUrl,
			label: 'GitHub',
		},
		{ languages: false },
	],
	editUrl: 'https://merryjs.github.io/cli/edit/master/docs/',
	// users,
	/* path to images for header/footer */
	// headerIcon: 'img/docusaurus.svg',
	// footerIcon: 'img/docusaurus.svg',
	favicon: 'img/favicon.png',
	/* colors for website */
	colors: {
		primaryColor: '#3F51B5',
		secondaryColor: '#9E9E9E',
	},
	/* custom fonts for website */
	fonts: {
		myFont: ['Times New Roman', 'Serif'],
		myOtherFont: ['-apple-system', 'system-ui'],
	},
	// This copyright info is used in /core/Footer.js and blog rss/atom feeds.
	copyright: 'Copyright © ' + new Date().getFullYear() + ' Merryjs.com',
	organizationName: 'merryjs', // or set an env variable ORGANIZATION_NAME
	projectName: 'cli', // or set an env variable PROJECT_NAME
	highlight: {
		// Highlight.js theme to use for syntax highlighting in code blocks
		theme: 'atom-one-light',
	},
	scripts: ['https://buttons.github.io/buttons.js'],
	// You may provide arbitrary config keys to be used as needed by your template.
	repoUrl: repoUrl,
	/* On page navigation for the current documentation page */
	onPageNav: 'separate',
}

module.exports = siteConfig
