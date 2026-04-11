import type { Config } from '@sinonjs/fake-timers';

export {};

declare module '@sinonjs/fake-timers' {
  export type FakeTimerInstallOpts = Config;
}
