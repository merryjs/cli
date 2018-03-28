---
id: how
title: How to create plugin
sidebar_label: How to
---

A `merry` plugin can write via `JavaScript` or `TypeScript`. both of them are identical.

You can create a new plugin using

```sh
merry plugin -h
```

we have a builtin plugin can help you
generate a new one. and It will ask you a few simple questions that how your plugin will
work.

## Example

A simple Plugin: the `api` parameter is a instance of [`Plugin`](api.html).

file `index.js`

```js
module.exports = api => {
	// note if you want use async you need set your node engine version >= 8
	// or using typescript
	api.command('pluginName [cmd]').action(async (cmd, options) => {
		// ...
	})
}
```

## Example React Component

Demonstrate how to create a plugin that generate a `React` Component
file `component.ts`

```ts
import { Plugin, Action } from '@merryjs/cli/lib/plugin'
import { getPath } from './utils'
export interface ComponentAnswers {
	name: string
	style: boolean
	isRouteComponent: boolean
	route?: string
	routeGroup: string
	componentTemplatePath?: string
}
/**
 * run component action
 * @param api
 * @param answers
 */
export const runComponentAction = async (
	api: Plugin,
	answers: ComponentAnswers
) => {
	const group = answers.routeGroup ? `{{properCase routeGroup}}/` : ''
	const componentTemplatePath = `./templates/component.hbs`

	const dist =
		answers.isRouteComponent && answers.route
			? `routes/${group}{{properCase route}}`
			: 'components'

	const options = { ...(answers as any), ...{ dist }, cwd: api.conf.dist }

	const actions: Action[] = [
		{
			path: getPath(options, 'index.tsx'),
			templateFile: componentTemplatePath,
			format: {
				parser: 'typescript',
			},
		},
	]

	// If they want a CSS file, add styles.css
	if (answers.style) {
		actions.push({
			path: getPath(options, 'styles.tsx'),
			templateFile: './templates/styles.hbs',
			format: {
				parser: 'typescript',
			},
		})
	}
	return await api.runActions(actions, answers)
}
/**
 * component generate
 */
export default async (api: Plugin) => {
	const answers = await api.prompt<ComponentAnswers>([
		{
			type: 'input',
			name: 'name',
			message: 'Whats your component Name?',
			validate: value => {
				if (/.+/.test(value)) {
					return true
				}

				return 'The name is required'
			},
		},
		{
			type: 'confirm',
			name: 'style',
			default: true,
			message: 'Does it have styling?',
		},
		{
			type: 'confirm',
			name: 'isRouteComponent',
			default: false,
			message: 'Create a Component under routes?',
		},
		{
			type: 'input',
			name: 'route',
			message: 'Which route do you want use?',
			when: data => data.isRouteComponent,
		},
		{
			type: 'input',
			name: 'routeGroup',
			default: '',
			message:
				'Do you want creating a grouped route component and which group do you want use ?',
			when: data => data.route,
		},
	])
	await runComponentAction(api, answers)
}
```

entry file `index.ts`

```ts
import { Plugin, Action } from '@merryjs/cli/lib/plugin'
import path from 'path'
import component from './component'

export enum GeneratorType {
	ROUTE = 'route',
	COMPONENT = 'component',
	FORM = 'form',
}
const supportedTypes = [
	GeneratorType.FORM,
	GeneratorType.ROUTE,
	GeneratorType.COMPONENT,
]

export interface ReactGeneratorOptions {
	swagger: string
	menu: string
}
/**
 * ReactGeneratorAnswers
 */
export interface ReactGeneratorAnswers {
	name: string
}

export default (api: Plugin) => {
	api
		.command('react [name]')
		.usage(supportedTypes.map(cmd => `[${cmd}]`).join(' | '))
		.action(async (name: GeneratorType, options: ReactGeneratorOptions) => {
			switch (name) {
				case GeneratorType.ROUTE:
					// ...
					break
				case GeneratorType.COMPONENT:
					await component(api)
					break
				case GeneratorType.FORM:
					// await checkOptions(api, options)
					// await form(api, options)
					break
				default:
					if (!name) {
						api.log('[%s] is not a known command', name)
					} else {
						api.log('unknown commands [%s]', name)
					}
					api.log(`supported commands: %O`, supportedTypes)
					break
			}
		})
}
```

file `component.hbs`

```hbs
/*
 * *****************************************
 * {{ properCase name }} => Component
 * *****************************************
 */

import React from 'react'
{{#if style}}
import styles from './style.css'
{{/if}}

export interface {{ properCase name }}Props {
  children?: React.ReactNode
}
export interface {{ properCase name }}State {

}

export class {{ properCase name }} extends React.Component<{{ properCase name }}Props, {{ properCase name }}State> {
  render() {
    return <div>
      This is {{properCase name}} Component !
    </div>
  }
}
```
