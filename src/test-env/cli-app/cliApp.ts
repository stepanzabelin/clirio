import { Clirio } from '../../index'
import { ClirioConfig } from '../../lib/clirioConfig'
import { ClirioException } from '../../types'
import { CommonModule } from './modules/common/CommonModule'
import { GitModule } from './modules/git/GitModule'
import { HelloModule } from './modules/hello/HelloModule'
import { MigrationModule } from './modules/migration/MigrationModule'
import { PingModule } from './modules/ping/PingModule'

export const cliApp = async ({
  config = {},
  globalExceptionCatch = null,
}: {
  config?: Partial<ClirioConfig>
  globalExceptionCatch?: null | ClirioException['catch']
} = {}) => {
  const cli = new Clirio()
  cli.setModules([HelloModule, CommonModule, GitModule, new MigrationModule(), PingModule])

  if (globalExceptionCatch) {
    cli.setGlobalException({
      catch(...args) {
        globalExceptionCatch(...args)
      },
    })
  }

  cli.setConfig(config)
  await cli.execute()
  return cli
}
