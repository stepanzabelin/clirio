import { moduleCommandReg } from '../constrains/regexp.config'
import { ClirioDebugError } from '../exceptions'

import { moduleEntityMetadata } from '../metadata'
import { Constructor, Link, LinkType } from '../types'

export const Module = function (rawCommand?: string) {
  return function (constructor: Constructor) {
    const links: Link[] = []

    const command = rawCommand?.trim?.() ?? null

    let sub = command

    while (sub) {
      const commandMatch = sub.match(new RegExp(`^\\s*${moduleCommandReg.source}$\\s*`))

      if (!commandMatch) {
        throw new ClirioDebugError('Command value is invalid', {
          entity: constructor.name,
          value: command!,
          decorator: 'Module',
        })
      }

      const { action } = commandMatch!.groups!

      links.push({
        type: LinkType.Action,
        values: [action],
      })

      sub = sub.slice(commandMatch[0].length)
    }

    moduleEntityMetadata.set(constructor.prototype, {
      links,
      command,
    })
  }
}
