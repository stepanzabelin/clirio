import { Args, OptionalKeys, Result, Pipe, Exception, Module } from '../types';
import { ClirioConfig } from './clirioConfig';
import { ClirioCore } from './ClirioCore';
import { TRANSFORMATION } from './TRANSFORMATION';
import { VALIDATION } from './VALIDATION';

export class Clirio extends ClirioCore {
  public setConfig(partialConfig: OptionalKeys<ClirioConfig>): this {
    this.config = { ...this.config, ...partialConfig };
    return this;
  }

  public setArgs(args: Args): this {
    this.args = args;
    return this;
  }

  public setGlobalPipe(globalPipe: Pipe): this {
    this.globalPipe = globalPipe;
    return this;
  }

  public setGlobalException(globalException: Exception): this {
    this.globalException = globalException;
    return this;
  }

  public setGlobalResult(globalResult: Result): this {
    this.globalResult = globalResult;
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

  public async build() {
    // TODO exception
    this.debug();
    await this.execute();
  }

  public static VALIDATION = VALIDATION;

  public static TRANSFORMATION = TRANSFORMATION;
}
