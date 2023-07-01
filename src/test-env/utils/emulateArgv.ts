import sinon from 'sinon';
import * as getProcessArgsModule from '../../lib/getProcessArgs';
import { Clirio } from '../../lib/Clirio';

export const emulateArgv = (sandbox: sinon.SinonSandbox, query: string) => {
  sandbox
    .stub(getProcessArgsModule, 'getProcessArgs')
    .returns(Clirio.split(query));
};
