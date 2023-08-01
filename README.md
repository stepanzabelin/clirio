# Clirio

A mini framework for node.js command-line interfaces based on TypeScript, decorators, DTOs

Clirio is a library for routing terminal command lines. Clirio promotes using SOLID and data typing (an alternative to [commander](https://www.npmjs.com/package/commander), [args](https://www.npmjs.com/package/args), [argparse](https://www.npmjs.com/package/argparse) and etc.).
The [author](https://github.com/stepanzabelin) is inspired by [angular](https://github.com/angular), [nestjs](https://github.com/nestjs/nest)
You can integrate Clirio with other interactive command line libs (like [inquirer](https://www.npmjs.com/package/inquirer), [terminal-kit](https://www.npmjs.com/package/terminal-kit), [chalk](https://www.npmjs.com/package/chalk) and etc.)

Clirio starter kit is [here](https://github.com/stepanzabelin/clirio-starter-kit)

[GIF]

#### Table of Contents

- [Clirio](#clirio)
  - [Installation](#installation)
  - [Quick Start](#quick-start)
  - [Starter kit](#starter-kit)
  - [Definitions](#definitions)
  - [Parsing args](#parsing-args)
  - [App configuration](#app-configuration)
  - [Modules](#modules)
  - [Actions](#actions)
    - [Command pattens](#command-patterns)
    - [Empty command](#empty-command)
    - [Failure command](#failure-command)
  - [Data control](#data-control)
    - [Params](#params-data-control)
    - [Options](#options-data-control)
  - [Input DTO](#input-dto)
    - [Validation](#validation)
    - [Transformation](#transformation)
  - [Pipes](#none)
  - [Exceptions](#exceptions)
  - [Filters](#filter)
  - [Displaying help](#displaying-help)
    - [Helper](#clirio-helper)
    - [Hidden actions](#hidden-actions)
  - [Displaying Version](#displaying-version)
  - [Clirio API](#clirio-api)
    - [setConfig](#setconfig)
    - [setGlobalPipe](#setglobalpipe)
    - [setGlobalFilter](#setglobalfilter)
    - [addModule](#addmodule)
    - [setModules](#setmodules)
    - [execute](#execute)
  - [Clirio utils](#clirio-utils)
    - [valid](#valid)
    - [form](#form)
    - [parse](#form)
    - [describe](#form)
  - [Decorators](#decorators)
    - [Command](#command-decorator)
    - [Empty](#empty-decorator)
    - [Filter](#filter-decorator)
    - [Failure](#failure-decorator)
    - [Helper](#helper-decorator)
    - [Module](#module-decorator)
    - [Option](#option-decorator)
    - [Options](#options-decorator)
    - [Param](#param-decorator)
    - [Params](#params-decorator)
    - [Pipe](#pipe-decorator)
    - [Transform](#transform-decorator)
    - [Validate](#validate-decorator)

## Installation

```bash
npm install clirio

```

```bash
yarn add clirio

```

## Quick Start

There are 3 easy steps to build Clirio App.
The example for emulating `git status` cli command with options

1. Create Dto to define input options

```ts
import { Option } from 'clirio';

class GitStatusDto {
  @Option('--branch, -b')
  readonly branch?: string;

  @Option('--ignore-submodules')
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';

  @Option('--short, -s')
  readonly short?: boolean;
}
```

2. Create module to compose a set of commands

```ts
import { Module, Command, Options } from 'clirio';

@Module()
export class GitModule {
  @Command('git status')
  public status(@Options() options: GitStatusDto) {
    // here you can use handled data
    console.log(options);
  }
}
```

3. Configure the main class

```ts
import { Clirio } from 'clirio';

const clirio = new Clirio();
clirio.addModule(GitModule);
clirio.execute();
```

##### Result

```bash

$ my-custom-cli git status -b master --ignore-submodules  all --short

```

The application will route the command `git status` with options to the `GitModule.status` method.

```console
{ branch: 'master', ignoreSubmodules: 'all', short: true }
```

Then you can use the received data for its intended purpose

The implementation of own cli prefix (like `my-custom-cli`) is described in [starter kit](https://github.com/stepanzabelin/clirio-starter-kit)

## Starter kit

Clirio is developed according to SOLID principles, so you can apply OOP, dependency injection and other programming patterns.

**[Clirio starter kit](https://github.com/stepanzabelin/clirio-starter-kit)** contains the recommended assembly. But you can integrate any other libraries and custom decorators.

### Definitions

Anatomy of a shell CLI is described in [wiki](https://en.wikipedia.org/wiki/Command-line_interface#Anatomy_of_a_shell_CLI)

The author suggests using the following definitions to describe the Clirio specification.

##### Bash example

```bash
$  node migration-cli.js run 123556 -u user -p pass --db="db-name"
```

##### The incoming command line

| node migration-cli.js | run 123556 -u user -p pass --db="db-name" |
| :-------------------: | :---------------------------------------: |
|      launch path      |                 arguments                 |

##### The parsed command line

| node migration-cli.js | run 123556 | -u user -p pass --db="db-name" |
| :-------------------: | :--------: | :----------------------------: |
|      launch path      |  command   |            options             |

##### The matched command line

| node migration-cli.js |  run   | 123556 | -u user | -p pass | --db="db-name" |
| :-------------------: | :----: | :----: | :-----: | :-----: | :------------: |
|      launch path      | action | param  | option  | option  |     option     |

##### Arguments Definition

"Arguments" are all space-separated command line parts after `launch path`

##### Command Definition

"Command" are space-separated command line parts without leading dashes

##### Params Definition

"Params" are obtained values by matching the command in accordance with the given pattern

##### Options Definition

"Options" are command line parts using a leading dashes
Each option is either a key-value or a key. If in the beginning 2 dashes is a long key if one dash is a short key which must be 1 character long:
`--name=Alex`, `--name Alex`, `-n Alex`, `--version`, `-v`

### Parsing args

Parsing command line by Clirio

```ts
Clirio.parse('test --foo 15 -b -a -r 22');
```

```ts
Clirio.describe(['test', '--foo=15', '-b', '-a', '-r', '22']);
```

Result

```json
[
  { "type": "action", "key": "0", "value": "test" },
  { "type": "option", "key": "foo", "value": "15" },
  { "type": "option", "key": "b", "value": null },
  { "type": "option", "key": "a", "value": null },
  { "type": "option", "key": "r", "value": "22" }
]
```

Another example

```bash
$ set-time 10:56 --format=AM -ei 15
```

| type   | key    | value    |
| ------ | ------ | -------- |
| action | 0      | set-time |
| action | 1      | 10:56    |
| option | format | AM       |
| option | e      | null     |
| option | i      | 15       |

##### Summary

- all parts without a leading dash will be described as actions
- an option with a missing value will be null
- options starting with a single dash will be separated by letters

### App configuration

The application structure should consist of the following parts:

1. the main class - `Clirio`
2. modules (custom classes or their instances)
3. actions (methods in class-modules with decorators )

`Clirio` - is the main class which configures the application and links modules

```ts
const cli = new Clirio();
cli.setModules([HelloModule, CommonModule, GitModule, MigrationModule]);
cli.execute();
```

Modules can be instantiated to apply dependency injection

```ts
cli.setModules([
  HelloModule,
  new CommonModule(),
  diContainer.resolve(CommonModule),
]);
```

The example is [here](https://github.com/stepanzabelin/clirio-starter-kit)

### Modules

Clirio modules are custom classes with the `@Module()` decorator (they can be considered as controllers).
An application can have either one or many modules. Each module contains actions (patterns for commands)

Using common module

```ts
@Module()
export class CommonModule {
  @Command('hello there')
  public helloThere() {
    // ...
  }

  @Command('migration run')
  public migrationRun() {
    // ...
  }
}
```

As a result 2 commands will be available:

```bash
$ cli hello there
$ cli migration run
```

Using multiple modules to separate unrelated commands and structure the code

```ts
@Module('hello')
export class HelloModule {
  @Command('there')
  public helloThere() {
    // ...
  }
}

@Module('migration')
export class MigrationModule {
  @Command('run')
  public run() {
    // ...
  }
}
```

### Actions

Clirio actions are methods in class-modules with decorators

```ts
@Module()
export class HelloModule {
  @Command('hello')
  public helloThere() {
    console.log('Hello! It works!');
  }

  @Command('bye')
  public help() {
    console.log('Bye! See you later');
  }

  @Empty()
  public empty() {
    console.log(chalk.yellow('You have not entered anything'));
  }

  @Failure()
  public failure() {
    console.log(chalk.red('You have entered a non-existent command'));
  }
}
```

#### Command pattens

The `@Command()` decorator is designed to specify the command pattern

```ts
@Module()
export class MigrationModule {
  @Command('init')
  public initMigration() {}

  @Command('migration run|up')
  public runMigration() {}

  @Command('migration to <name>')
  public migrateTo() {}

  @Command('migration merge <name1> <name2>')
  public mergeMigrations() {}

  @Command('migration delete <...names>')
  public deleteMigrations() {}
}
```

The total pattern based on `@Module(...)` and `@Commands(...)` will be matched with the command line
Pattern can consist of one or more space-separated arguments

##### Case 1. Exact match

The exact command will be matched

```ts
  @Command('hello')
  @Command('hello my friends')
```

| Command pattern  | Matching command line |
| ---------------- | --------------------- |
| hello            | hello                 |
| hello there      | hello there           |
| hello my friends | hello my friends      |

##### Case 2. Match variants

Using the `|` operator to set match variants for params.
Multiple command lines will be matched to one route
The number of links separated by a space should be the same.

```ts
  @Command('migration run|up')
  @Command('hello|hey|hi')
```

| Command pattern   | Matching command line          |
| ----------------- | ------------------------------ |
| migration run\|up | migration run<br> migration up |
| hello\|hey\|hi    | hello<br> hey<br> hi           |

##### Case 3. Pattern with value masks

Using the `< >` operator to specify a place for any value
The number of links separated by a space should be the same

```ts
  @Command('hello <first-name> <last-name>')
  @Command('set-time <time>')
```

| Command pattern                    | Matching command line                                                |
| ---------------------------------- | -------------------------------------------------------------------- |
| hello \<first-name\> \<last-name\> | hello Alex Smith<br>hello John Anderson<br> ... etc.                 |
| set-time \<time\>                  | set-time 11:50<br> set-time now<br> set-time 1232343545<br> ... etc. |

Use [Params data control](#params-data-control) to get the entered values

##### Case 4. Pattern with rest values mask

Using the `<... >` operator to specify a place for array of values
This kind of mask can be only one per command pattern and should be at the end

```ts
  @Command('hello <...all-names>')
  @Command('get cities <...cities>')
```

| Command pattern          | Matching command line                                               |
| ------------------------ | ------------------------------------------------------------------- |
| hello \<...all-names\>   | hello Alex John Sarah Arthur<br/> hello Max<br> ... etc.            |
| get cities \<...cities\> | get cities Prague New-York Moscow<br>get cities Berlin<br> ... etc. |

Use [Params data control](#params-data-control) to get the entered values

##### Case 5. Option match

This pattern is designed for special cases like "help" and "version". This is an exact match of the option key and value. Match variants can be separated by comma

```ts
  @Command('--help, -h')
  @Command('--mode=check')
```

| Command pattern | Matching command line |
| --------------- | --------------------- |
| --help, -h      | --help<br/> -h        |
| --version, -v   | --version<br/> -v     |
| --mode=check    | --mode=check          |

Use [Options data control](#optiond-data-control) to add other options
To avoid problems, do not mix this pattern with the rest ones

### Empty command

The `@Empty()` action decorator is a way to catch the case when nothing is entered
Each module can have its own `@Empty()` decorator in an action

```ts
@Module()
export class CommonModule {
  @Command('hello')
  public hello() {}

  @Empty()
  public empty() {
    console.log("You haven't entered anything");
  }
}
```

```bash
$ cli
```

```console
You haven't entered anything
```

When a module has a command prefix, it will be matched and ranked

```ts
@Module('migration')
export class MigrationModule {
  @Command('init')
  public initMigration() {}

  @Empty()
  public empty() {
    console.log(
      'The migration module requires additional instruction. Type --help',
    );
  }
}
```

```bash
$ cli migration
```

```console
The migration module requires additional instruction. Type --help
```

#### Failure

The `@Failure()` action decorator is a way to catch the case when the specified command patterns don't match.
Each module can have its own `@Failure()` decorator in an action
if this decorator is not specified, then a default error will be displayed

```ts
@Module()
export class CommonModule {
  @Command('hello')
  public hello() {}

  @Failure()
  public failure() {
    console.log('There is no such a command!');
  }
}
```

```bash
$ cli goodbye
```

```console
There is no such a command!
```

When a module has a command prefix, it will be matched and ranked

```ts
@Module('migration')
export class MigrationModule {
  @Command('init')
  public initMigration() {}

  @Failure()
  public failure() {
    console.log('The migration module got the wrong instruction');
  }
}
```

```bash
$ cli migration stop
```

```console
The migration module got the wrong instruction
```

### Data control

Using [Parameter Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to control input data
The `@Params()` and `@Options()` decorators provided

```ts
@Module()
export class LocatorModule {
  @Command('get-location <city>')
  public getLocation(@Params() params: unknown, @Options() options: unknown) {
    console.log(params);
    console.log(options);
  }
}
```

```bash
$ cli get-location Prague --format=DMS --verbose
```

```console
{ city: "Prague" }
{ format: "DMS", verbose: true }
```

#### Params data control

To handle incoming data, use DTO (instead of unknown type)

The `@Param()` decorator for dto properties provided. It can take a key in an param mask to map DTO properties

```ts
export class HelloParamsDto {
  @Param('first-name')
  readonly firstName?: string;

  @Param('last-name')
  readonly lastName?: string;
}
```

```ts
@Module()
export class HelloModule {
  @Command('hello <first-name> <last-name>')
  public hello(@Params() params: HelloParamsDto) {
    console.log(params);
  }
}
```

Here the second and third parts are the masks for any values that the user enters
The `hello` method will be called if the user enters a three-part command. The last 2 parts are passed to the params argument as keys and values

```bash
$ cli hello Alex Smith
```

```console
{ firstName: "Alex", lastName: "Smith" }
```

The `@Param()` decorator can have no arguments. In this case DTO properties will map to input keys
If the `@Param()` decorator is absent then there will be no mapping

```ts
export class HelloParamsDto {
  @Param()
  readonly 'first-name'?: string;

  @Param()
  readonly 'last-name'?: string;
}
```

```bash
$ cli hello Alex Smith
```

```console
{ "first-name": "Alex", "last-name": "Smith" }
```

##### Example with the rest values mask

```ts
@Module()
export class GitModule {
  @Command('git add <...all-files>')
  public add(@Params() params: AddParamsDto) {
    // Type checking works for "params" variable
    console.log(params.allFiles);
  }
}
```

```ts
class AddParamsDto {
  @Param('all-files')
  readonly allFiles: string[];
}
```

```bash
$ cli git add test.txt logo.png
```

```console
['test.txt', 'logo.png']
```

#### Options data control

The `@Options()` decorator provided

```ts
@Module()
export class GitModule {
  @Command('git status')
  public status(@Options() options: GitStatusOptionsDto) {
    console.log(options);
  }
}
```

#### Options Dto

The `@Option()` decorator for dto properties provided. It can accept comma separated key aliases to map DTO properties

```ts
class GitStatusOptionsDto {
  @Option('--branch, -b')
  readonly branch?: string;

  @Option('--ignore-submodules, -i')
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';

  @Option('--short, -s')
  readonly short?: boolean;
}
```

```bash
$ cli git status --branch=master --ignore-submodules=all --short

$ cli git status --branch master --ignore-submodules all --short

$ cli git status -b master -i all -s

```

Each input data will lead to one result:

```console
{ branch: 'master', ignoreSubmodules: 'all', short: true }
```

If the `@Option()` decorator is absent then there will be no mapping

```bash
$ cli git status --branch=master --ignore-submodules=all --short
```

```console
{ branch: 'master', "ignore-submodule": 'all', short: true }
```

### Input DTO

DTOs used to control inputs can have additional decorators, including custom ones
All incoming key values can be `null` or `string` either an `array` of `null` or a `string`

```ts
type Value = string | null | (string | null)[];
```

##### example of data control (options and params)

```ts
@Module()
export class SomeModule {
  @Command('set-limit <limit>')
  public setLimit(
    @Params() params: SetLimitParamsDto,
    @Options() options: SetLimitOptionDto,
  ) {
    console.log(params);
    console.log(options);
  }
}
```

Clirio provides the `@Validate()` and `@Transform()` decorators
In this example you can use them for DTO properties `SetLimitParamsDto`, `SetLimitOptionDto`

```ts
import { Option, Validate, Transform } from 'clirio';
import { MyCustomDecorator } from 'src/my-decorators';

class SetLimitParamsDto {
  @Param('limit')
  @Validate((v) => /^[0-9]+$/.test(v)) // checking for numbers only
  @Transform((v) => Number(v)) // string to number
  @MyCustomDecorator() // will be handled in "Pipe"
  readonly limit: number;
}
```

#### Validation

The `@Validate()` decorator provided to check input params and options.
It must be used for DTO properties in conjunction with `@Option()` or `@Param()` (this depends on the type of controlled data)
The `@Validate()` takes a function or an array of functions as an argument. Each function must return `boolean` or `null`:

- if `false` is returned then an error throws
- if `null` is returned then the key validation clause skips
- if `true` is returned then the key validation will complete successfully

```ts
import { Module, Command, Options } from 'clirio';

@Module()
export class GitModule {
  @Command('git status')
  public status(@Options() options: GitStatusDto) {
    console.log(options);
  }
}
```

```ts
import { Option, Validate } from 'clirio';

class GitStatusDto {
  @Option('--branch, -b')
  @Validate((v) => typeof v === 'string')
  readonly branch: string;

  @Option('--ignore-submodules')
  @Validate(
    (v) => v === undefined || ['none', 'untracked', 'dirty', 'all'].includes(v),
  )
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';

  @Option('--short, -s')
  readonly short?: boolean;
}
```

```bash
$ cli git status --ignore-submodules
```

```console
The "branch" is wrong
```

For any case of failed validation, the same error will be thrown `The "KEY_NAME" is wrong`
To have more flexible validations, use [Pipes](#pipes)
It is possible to [configure](#config) throwing errors on unknown keys or in options

##### Validation of optional key

```ts
class OptionsDto {
  @Option('--id')
  @Validate([(v) => v === undefined || null, /^[0-9]+$/.test(v)])
  readonly ignoreSubmodules?: number;
}
```

##### Using Clirio-made checks

```ts
class OptionsDto {
  @Option('--id')
  @Validate([Clirio.valid.OPTIONAL, Clirio.valid.NUMBER])
  readonly id?: number;
}
```

##### Validation of nullable key

```ts
class OptionsDto {
  @Option('--type')
  @Validate([Clirio.valid.NULLABLE, Clirio.valid.STRING])
  readonly type: string | null;
}
```

See [Clirio-made checks](#valid)

```bash
$ cli git status --log=true
```

### Transformation

The `@Transform()` decorator provided to transform input params and options.
It must be used for DTO properties in conjunction with `@Option()` or `@Param()` (this depends on the type of controlled data)
The `@Transform()` takes a transform function as an argument

```ts
import { Option, Transform } from 'clirio';

class SetAutoParamsDto {
  @Param();
  @Transform((v) => v.toUpperCase())
  readonly model: string;

  @Param('speed-limit')
  @Transform((v) => Number(v))
  readonly speedLimit: number;
}

class SetAutoOptionsDto {
  @Option('--turbo')
  @Transform((v) => v === null || v === 'yes')
  readonly turbo: boolean;
}

```

```ts
import { Module, Command, Options } from 'clirio';

@Module('auto')
export class AutoModule {
  @Command('set <model> <speed-limit>')
  public set(
    @Params() params: SetAutoParamsDto,
    @Options() options: SetAutoOptionsDto,
  ) {
    console.log(params);
    console.log(options);
  }
}
```

```bash
$ auto set bmw 300 --turbo=yes
```

```console
{ model: 'BMW', speedLimit: 300 }
{ turbo: true }
```

##### Summation and concatenation

```ts
@Module()
export class SumModule {
  @Command('sum <first> <second>')
  public sum(@Params() params: SumParamsDto) {
    console.log(params.first + params.second);
  }
}
```

Without transformation

```ts
class SumParamsDto {
  @Param()
  readonly first: unknown;

  @Param()
  readonly second: unknown;
}
```

```bash
$ cli sum 5 15
```

```console
'515'
```

With transformation

```ts
class SumParamsDto {
  @Param()
  @JoiSchema(Joi.number().required())
  readonly first: number;

  @Param()
  @JoiSchema(Joi.number().required())
  readonly second: number;
}
```

```bash
$ cli sum 5 15
```

```console
20
```

##### Using Clirio-made forms

```ts
class SetAutoOptionsDto {
  @Option('--turbo')
  @Transform(Clirio.form.FLAG)
  readonly turbo: boolean;
}
```

See [Clirio-made forms](#form)

### Pipes

Pipes are designed to [validate](#validation) and [transform](#transformation) controlled data (params and options).
Using pipes is more functional than the `@Validate()` and `@Transform()` decorators and gives more flexibility

```ts
import { ClirioPipe, PipeContext, ClirioValidationError } from '@clirio';

export class CustomPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    // controlled params
    if (input.dataType === 'params') {
      // validation
      if (check(data)) {
        throw new ClirioValidationError('error message', {
          dataType: input.dataType,
          propertyName: 'typeId',
        });
      }

      // transformation
      return { ...data };
    }

    // controlled options

    if (input.dataType === 'options') {
      // validation
      if (check(data)) {
        throw new ClirioValidationError('error message', {
          dataType: input.dataType,
          propertyName: 'typeId',
        });
      }

      // transformation
      return { ...data };
    }

    return data;
  }
}
```

The `input: PipeContext` argument contains the value input.entity (it is a DTO). It is possible to extract reflection data and use custom decorators.

##### Example

```ts
@Module()
export class MigrationModule {
  @Command('migration up <migration-id>')
  @Pipe(MigrationUpPipe)
  public up(
    @Params() params: MigrationUpParamsDto,
    @Options() options: MigrationUpOptionsDto,
  ) {
    console.log('transformed params after pipes:', params);
    console.log('transformed options after pipes:', options);
  }
}
```

```ts
export class MigrationUpParamsDto {
  @Param('migration-id')
  readonly migrationId: number;
}
```

```ts
import { ClirioPipe, PipeContext, ClirioValidationError } from '@clirio';

export class MigrationUpPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    if (input.dataType === 'params') {
      // validation
      if (/^[0-9]+$/.test(data.migrationId)) {
        throw new ClirioValidationError('"migration-id" is not number', {
          dataType: input.dataType,
          propertyName: 'migrationId',
        });
      }

      // transformation string to number
      return { migrationId: Number(data.migrationId) };
    }

    return data;
  }
}
```

It is possible to add pipes for each action or globally for all at once

#### Example of a global pipe

```ts
const cli = new Clirio();
cli.addModule(MigrationModule);
cli.setGlobalPipe(CommonPipe);
cli.execute();
```

### Exceptions

Exceptions can be thrown in pipes or in actions. Special exceptions designed to complete the script with the desired result

- ClirioValidationError
- ClirioCommonError

```ts
import { Module, Command, ClirioCommonError } from 'clirio';

@Module()
export class CommonModule {
  @Command('check')
  public check() {
    throw new ClirioCommonError('Not working!', { errCode: 'CUSTOM_ERR_CODE' });
  }
}
```

```ts
import { Clirio, ClirioValidationError, ClirioCommonError } from 'clirio';

const cli = new Clirio();
cli.setModules([GitModule]);
cli.execute().catch((err) => {
  if (err instanceof ClirioValidationError) {
    console.log('Validation error', err.message);
    process.exit(9);
  }

  if (err instanceof ClirioCommonError) {
    console.log('Common error', err.message);
    process.exit(5);
  }

  console.log('unknown error', err.message);
  process.exit(1);
});
```

### Filters

Filters are designed to catch exceptions

```ts
@Module('ping')
export class PingModule {
  @Command('pong')
  @Filter(PingPingsFilter)
  public pong() {
    throw new ClirioCommonError('Not working!', { errCode: 'CUSTOM_ERR_CODE' });
  }
}
```

```ts
import {
  ClirioCommonError,
  ClirioFilter,
  ClirioValidationError,
} from '@clirio';
import { FilterContext } from '../../../../types';

export class PingPingsFilter implements ClirioFilter {
  catch(
    error: Error | ClirioCommonError | ClirioValidationError,
    context: FilterContext,
  ): void | never {
    if (error instanceof ClirioValidationError) {
      console.log('Validation error', error.message);
      process.exit(9);
    }

    if (error instanceof ClirioCommonError) {
      console.log('Common error', error.message);
      process.exit(5);
    }

    console.log('unknown error', error.message);
    process.exit(1);
  }
}
```

It is possible to add filters for each action or apply them globally to all actions at once

#### Example of a global filter

```ts
const cli = new Clirio();
cli.addModule(MigrationModule);
cli.setGlobalFilter(CommonFilter);
cli.execute();
```

### Displaying help

Special case for the command as an option designed

```ts
@Module()
export class CommonModule {
  @Command('--help')
  public help() {
    console.log('Description of commands is here');
  }
}
```

```bash
$ cli --help
```

```console
Description of commands is here
```

It is possible to use other commands

```ts
@Command('-m, --man')

@Command('help|h')

@Command('man <command>')
```

#### Helper

The `@Helper()` decorator provided to handle help mode

```ts
import { Module, Command, Helper, ClirioHelper } from 'clirio';

@Module()
export class CommonModule {
  @Command('hello there', {
    description: 'Say hello there',
  })
  public helloThere() {
    // ...
  }

  @Command('-h, --help')
  public help(@Helper() helper: ClirioHelper) {
    const dump = helper.dumpAll();
    console.log(ClirioHelper.formatDump(dump));
  }
}
```

The `ClirioHelper` class provides api for getting descriptions of actions and methods for formatting it
The `helper.dumpAll()` method returns description for all commands. It is possible to do custom formatting

#### Hidden actions

The `hidden` option in the `Command()` decorator lets hide description of the command

```ts
import { Module, Command, Hidden } from 'clirio';

@Module()
export class Module {
  @Command('debug', { hidden: true })
  public debug() {
    // ...
  }

  @Command('hello there', {
    description: 'Say hello there',
  })
  public helloThere() {
    // ...
  }
}
```

The `ClirioHelper.formatDump` will ignore description of the `debug` command in this case

### Version

```ts
import { Module, Command } from 'clirio';

@Module()
export class CommonModule {
  @Command('-v, --version')
  public version() {
    console.log('1.3.1');
  }
}
```

```bash
$ cli --version
```

```console
1.3.1
```

### Clirio API

#### setConfig

Setting global configuration

```ts
cli.setConfig({
  allowUncontrolledOptions: false,
});
```

##### unknown options

```console
"log" is an unknown key
```

```bash
$ cli git status -b master --ignore-submodules  all --short
```

```console
{ branch: 'master', ignoreSubmodules: 'all', short: true }
```

| Param                    |                                           Description                                           | Default |
| ------------------------ | :---------------------------------------------------------------------------------------------: | ------: |
| allowUncontrolledOptions | Clirio can throw Error if DTO are not specified for options but they will be got in the command |    true |

#### setGlobalPipe

#### setGlobalFilter

#### addModule

Adding one module

```ts
cli.addModule(PingModule);
```

#### setModules

Setting several modules

```ts
cli.setModules([HelloModule, CommonModule]);
```

#### setArgs

Arguments will be determined automatically but it is possible to set them manually

```ts
cli.setArgs(['git', 'add', 'test.txt', 'logo.png']);
```

This option is useful for testing and debugging the application

### Receipts

#### Array of values in options

```ts
import { Module, Command, Options } from 'clirio';

@Module()
export class Module {
  @Command('model')
  public model(@Options() options: ModelOptionsDto) {
    console.log(options);
  }
}
```

```ts
import Joi from 'joi';
import { Option, JoiSchema } from 'clirio';

class ModelOptionsDto {
  @Option('--name, -n', {
    isArray: true,
  })
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly names: string[];
}
```

#### Variable values in options

```ts
import { Module, Command, Options } from 'clirio';

@Module()
export class Module {
  @Command('connect')
  public connect(@Options() options: DbConnectOptionsDto) {
    console.log(options);
  }
}
```

```ts
import Joi from 'joi';
import { Option, JoiSchema } from 'clirio';

class DbConnectOptionsDto {
  @Option('--env, -e', {
    variable: true,
  })
  @JoiSchema(Joi.object().pattern(Joi.string(), Joi.string()))
  readonly envs: Record<string, string>;
}
```

#### Example with rest values mask

```ts
import { Module, Command, Params } from 'clirio';

@Module()
export class GitModule {
  @Command('git add <...all-files>')
  public add(@Params() params: AddParamsDto) {
    console.log(params.allFiles);
  }
}
```

```ts
import Joi from 'joi';
import { Param, JoiSchema } from 'clirio';

class AddParamsDto {
  @Param('all-files')
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly allFiles: string[];
}
```

##### Array of values in options

By default, the command parser cannot determine whether an option is an array. You can specify this, in which case the same option names will be collected in an array, even if there is only one option

```ts
@Module()
export class Module {
  @Command('model')
  public model(@Options() options: ModelOptionsDto) {
    console.log(options);
  }
}
```

```ts
class ModelOptionsDto {
  @Option('--name, -n', {
    isArray: true,
  })
  readonly names: string[];
}
```

```bash
$ cli model --name Ford
```

```console
{ names: ['Ford'] }
```

```bash
$ cli model --name Ford -n Tesla
```

```console
{ names: ['Ford', 'Tesla'] }
```

##### Validation boolean flag

```ts
class Dto {
  @Option('--agree')
  @Validate([Clirio.valid.OPTIONAL, Clirio.valid.FLAG])
  readonly agree?: null;
}
```

##### Variable values in options

There is a special case for using variables. All variables will be collected in an object

```ts
@Module()
export class Module {
  @Command('connect')
  public connect(@Options() options: DbConnectOptionsDto) {
    console.log(options);
  }
}
```

```ts
class DbConnectOptionsDto {
  @Option('--env, -e', {
    variable: true,
  })
  readonly envs: Record<string, string>;
}
```

```bash
$ cli connect -e DB_NAME=dbname -e DB_USER=dbuser
```

```console
{ envs: { DB_NAME: 'dbname', DB_USER: 'dbuser' } }

```

#### Joi params validation

```ts
@Module()
export class GitModule {
  @Command('git checkout <branch>')
  public checkout(@Params() params: CheckoutParamsDto) {
    console.log(params);
  }
}
```

```ts
class CheckoutParamsDto {
  @Param('branch')
  @JoiSchema(Joi.string().required())
  readonly branch: string;
}
```

```bash
$ cli git checkout develop
```

```console
{  branch: 'develop' }
```

#### Joi validating and converting

Joi validates and converts input values that are originally string. That is a very useful feature.

##### Summation and concatenation examples

```ts
@Module()
export class SumModule {
  @Command('sum <first> <second>')
  public sum(@Params() params: SumParamsDto) {
    console.log(params.first + params.second);
  }
}
```

##### Without Joi

```ts
class SumParamsDto {
  @Param()
  readonly first: unknown;

  @Param()
  readonly second: unknown;
}
```

```bash
$ cli sum 5 15
```

```console
'515'
```

```bash
$ cli sum 5 rabbits
```

```console
'5rabbits'
```

##### With Joi

```ts
class SumParamsDto {
  @Param()
  @JoiSchema(Joi.number().required())
  readonly first: number;

  @Param()
  @JoiSchema(Joi.number().required())
  readonly second: number;
}
```

```bash
$ cli sum 5 15
```

```console
20
```

```bash
$ cli sum 5 rabbits
```

```console
"second" is not a number
```

### Special cases
