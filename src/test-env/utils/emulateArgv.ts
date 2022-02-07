import sinon from 'sinon';
import * as getProcessArgsModule from '../../lib/getProcessArgs';
import { Clirio } from '../../lib/Clirio';

export const emulateArgv = (sandbox: sinon.SinonSandbox, query: string) => {
  sandbox
    .stub(getProcessArgsModule, 'getProcessArgs')
    .returns(splitQuery(query));
};

export const splitQuery = (query: string): string[] => {
  return query
    .trim()
    .split(/\s+/)
    .filter((f) => f);
};

export const parse = (query: string) => Clirio.parse(splitQuery(query));
