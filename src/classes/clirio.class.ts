import { ClirioCore } from './clirio-core.class';
import {
  OptionalKeys,
  Pipe,
  Filter,
  Module,
  Args,
  ClirioConfig,
} from '../types';
import { valid, form, getProcessArgs } from '../utils';

export class Clirio extends ClirioCore {
  public setConfig(partialConfig: OptionalKeys<ClirioConfig>): this {
    this.config = { ...this.config, ...partialConfig };
    return this;
  }

  public setGlobalPipe(globalPipe: Pipe): this {
    this.globalPipe = globalPipe;
    return this;
  }

  public setGlobalFilter(globalFilter: Filter): this {
    this.globalFilter = globalFilter;
    return this;
  }

  public addModule(module: Module): this {
    this.modules.push(module);
    return this;
  }

  public setModules(modules: Module[]): this {
    this.modules = modules;
    return this;
  }

  public async execute(args?: Args): Promise<never | void> {
    this.debug();

    await super.execute(args);
  }

  public static valid = valid;
  public static form = form;

  public static getProcessArgs = getProcessArgs;
}
