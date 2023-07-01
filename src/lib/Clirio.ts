import { Args, OptionalKeys, Result, Pipe, Exception, Module } from '../types';
import { ClirioConfig } from './clirioConfig';
import { ClirioCore } from './ClirioCore';

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

  public static VD = {
    LOGICAL: (value: string | null): boolean => {
      return [null, 'true', 'false'].includes(value);
    },
  };

  public static TF = {
    LOGICAL: (value: string | null): boolean => {
      switch (true) {
        case value === null: {
          return true;
        }
        case value === 'true': {
          return true;
        }

        default:
          return false;
          break;
      }
    },
  };

  public static debug(message: string, payload: any = {}) {
    const err = new Error(message);
    Object.assign(err, payload);
    return err;
  }
}
