import { Args, Constructor, OptionalKeys } from '../types';
import { ClirioConfig } from './clirioConfig';
import { ClirioCore } from './ClirioCore';

export class Clirio extends ClirioCore {
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

  public onError(callback: (err: unknown) => void): this {
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
    this.run();
  }

  public async run() {
    try {
      await this.execute();
      this.callSuccess();
    } catch (err: unknown) {
      this.callError(err);
    } finally {
      this.callComplete();
    }
  }
}
