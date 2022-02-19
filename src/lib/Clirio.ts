import {
  ClirioComplete,
  ClirioDebug,
  ClirioError,
  ClirioSuccess,
  ClirioWarning,
} from '../exceptions';
import { Args, Constructor, OptionalKeys } from '../types';
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

  public addModule(module: Constructor): this {
    this.modules.push(module);
    return this;
  }

  public setModules(modules: Constructor[]): this {
    this.modules = modules;
    return this;
  }

  public onDebug(callback: (err: ClirioDebug) => void): this {
    this.debugCallback = callback;
    return this;
  }

  public onError(callback: (err: ClirioError) => void): this {
    this.errorCallback = callback;
    return this;
  }

  public onWarning(callback: (data: ClirioWarning) => void): this {
    this.warningCallback = callback;
    return this;
  }

  public onComplete(callback: (err: ClirioComplete) => void): this {
    this.completeCallback = callback;
    return this;
  }

  public onSuccess(callback: (data: ClirioSuccess) => void): this {
    this.successCallback = callback;
    return this;
  }

  public async build() {
    try {
      this.debug();
      await this.execute();
    } catch (err: unknown) {
      if (err instanceof ClirioDebug) {
        this.callDebug(err);
      } else if (err instanceof ClirioWarning) {
        this.callWarning(err);
      } else if (err instanceof ClirioSuccess) {
        this.callSuccess(err);
      } else if (err instanceof ClirioComplete) {
        this.callComplete(err);
      } else if (err instanceof ClirioError) {
        this.callError(err);
      } else {
        this.callError(
          new ClirioError(err instanceof Error ? err.message : String(err))
        );
      }
    }
  }
}
