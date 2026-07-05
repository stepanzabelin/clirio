const assert = require('node:assert/strict');

const {
  Clirio,
  Command,
  Module,
  Param,
  Params,
} = require('../build/main');

class SmokeParamsDto {}

Param('name')(SmokeParamsDto.prototype, 'name');

class SmokeModule {
  smoke(params) {
    this.received = params;
  }
}

Reflect.defineMetadata(
  'design:paramtypes',
  [SmokeParamsDto],
  SmokeModule.prototype,
  'smoke',
);
Params()(SmokeModule.prototype, 'smoke', 0);
Command('smoke <name>')(SmokeModule.prototype, 'smoke');
Module()(SmokeModule);

(async () => {
  const smokeModule = new SmokeModule();

  await new Clirio()
    .setModules([smokeModule])
    .execute(Clirio.split('smoke package'));

  assert.deepEqual(smokeModule.received, { name: 'package' });
})();
