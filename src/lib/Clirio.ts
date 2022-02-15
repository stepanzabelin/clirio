import { Args, Constructor, OptionalKeys } from '../types';
import { ClirioConfig } from './clirioConfig';
import { ClirioCore } from './ClirioCore';

export class Clirio extends ClirioCore {
  private errorCallback?: (err: Error) => void;
  private successCallback?: () => void;
  private completeCallback?: () => void;

  public setConfig(partialConfig: OptionalKeys<ClirioConfig>): this {
    this.config = Object.assign({}, this.config, { partialConfig });
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

  public onError(callback: (err: Error) => void): this {
    this.errorCallback = callback;
    return this;
  }

  public onSuccess(callback: () => void): this {
    this.successCallback = callback;
    return this;
  }

  public onComplete(callback: () => void): this {
    this.completeCallback = callback;
    return this;
  }

  public build() {
    this.debug();

    try {
      this.run();

      this.callSuccess();
    } catch (err: any) {
      this.callError(err);
    } finally {
      this.callComplete();
    }
  }

  private callComplete() {
    if (this.completeCallback) {
      this.completeCallback();
    }
  }

  private callSuccess() {
    if (this.successCallback) {
      this.successCallback();
    } else {
      process.exit(0);
    }
  }

  private callError(err: Error) {
    if (this.errorCallback) {
      this.errorCallback(err);
    } else {
      console.log('\x1b[31m%s\x1b[0m', err.message);
      process.exit(9);
    }
  }
}
