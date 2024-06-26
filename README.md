# Clirio

A mini framework for node.js command-line interfaces based on TypeScript, decorators, DTOs

Clirio is a library for routing terminal command-lines. Clirio promotes using SOLID and data typing (an alternative to [commander](https://www.npmjs.com/package/commander), [args](https://www.npmjs.com/package/args), [argparse](https://www.npmjs.com/package/argparse) and etc.).

The [author](https://github.com/stepanzabelin) is inspired by [angular](https://github.com/angular), [nestjs](https://github.com/nestjs/nest)

You can integrate Clirio with other interactive command-line libs (like [inquirer](https://www.npmjs.com/package/inquirer), [terminal-kit](https://www.npmjs.com/package/terminal-kit), [chalk](https://www.npmjs.com/package/chalk) and etc.)

Clirio starter kit is [here](https://github.com/stepanzabelin/clirio-starter-kit)

![Demo](./docs/demo.gif)

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
    - [Command patterns](#command-patterns)
    - [Empty command](#empty-command)
    - [Failure command](#failure-command)
  - [Data control](#data-control)
    - [Params](#params-data-control)
    - [Options](#options-data-control)
    - [Envs](#envs-data-control)
  - [Input DTO](#input-dto)
    - [Validation](#validation)
    - [Transformation](#transformation)
  - [Pipes](#pipes)
  - [Exceptions](#exceptions)
  - [Filters](#filter)
  - [Displaying help](#displaying-help)
    - [Clirio Helper](#clirio-helper)
    - [Hidden commands](#hidden-commands)
  - [Displaying Version](#displaying-version)
  - [Clirio API](#clirio-api)
    - [setConfig](#setconfig)
    - [setGlobalPipe](#setglobalpipe)
    - [setGlobalFilter](#setglobalfilter)
    - [addModule](#addmodule)
    - [setModules](#setmodules)
    - [execute](#execute)
  - [Clirio utils](#clirio-utils)
    - [valid](#clirio-valid)
    - [form](#clirio-form)
    - [parse](#clirio-parse)
    - [describe](#clirio-describe)
  - [Decorators](#decorators)
    - [Command](#command-decorator)
    - [Empty](#empty-decorator)
    - [Env](#env-decorator)
    - [Envs](#envs-decorator)
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

1. Create DTO to define input options

```ts
import { Option } from 'clirio';

class GitStatusDto {
  @Option('--branch, -b')
  readonly branch?: string;

  @Option('--ignore-submodules')
  readonly ignoreSubmodules?: string;

  @Option('--short, -s')
  readonly short?: null;
}
```

2. Create module to compose a set of commands

```ts
import { Module, Command, Options } from 'clirio';

@Module()
export class GitModule {
  @Command('git status')
  public status(@Options() options: GitStatusDto) {
    // use handled data here
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
$ my-cli git status -b master --ignore-submodules  all --short
```



The application will route the command `git status` with options to the `GitModule.status` method.

```console
{ branch: 'master', ignoreSubmodules: 'all', short: null }
```


Then use the received data for its intended purpose

The implementation of own cli prefix (like `my-cli`) is described in [starter kit](https://github.com/stepanzabelin/clirio-starter-kit)


#### The way with typing, validation, transformation

The `GitStatusOptionsDto` entity can be more typified with additional instructions


```ts
import { Clirio, Option, Validate, Transform } from 'clirio';

class GitStatusOptionsDto {
  @Option('--branch, -b')
  @Validate(Clirio.valid.STRING)
  readonly branch: string;

  @Option('--ignore-submodules, -i')
  @Validate((v) => ['none', 'untracked','dirty', 'all'].includes(v))
  readonly ignoreSubmodules: 'none' | 'untracked' | 'dirty' | 'all';

  @Option('--short, -s')
  @Transform(Clirio.form.FLAG)
  readonly short: boolean;
}
```

```ts
@Module()
export class GitModule {
  @Command('git status')
  public status(@Options() options: GitStatusDto) {
    // the "options" data has bean typified, validated, transformed here
    console.log(`branch: ${options.branch}`);
    console.log(`ignoreSubmodules: ${options.ignoreSubmodules}`);
    console.log(`short: ${options.short}`);
  }
}
```

##### Result

```bash
$ my-cli git status -b master --ignore-submodules  all --short
```

```console
  branch: master
  ignoreSubmodules: all
  short: true
```

All the details are described below

## Starter kit

Clirio is developed according to SOLID principles, so it is possible apply OOP, dependency injection and other programming patterns.

**[Clirio starter kit](https://github.com/stepanzabelin/clirio-starter-kit)** contains the recommended assembly. But it is possible to integrate any other libraries and custom decorators.

## Definitions

Anatomy of a shell CLI is described in [wiki](https://en.wikipedia.org/wiki/Command-line_interface#Anatomy_of_a_shell_CLI)

The author suggests using the following definitions to describe the Clirio specification.

##### Bash example

```bash
$  node migration-cli.js run 123556 -u user -p pass --db="db-name"
```

##### The incoming command-line

| node migration-cli.js | run 123556 -u user -p pass --db="db-name" |
| :-------------------: | :---------------------------------------: |
|      launch path      |                 arguments                 |

##### The parsed command-line

| node migration-cli.js | run 123556 | -u user -p pass --db="db-name" |
| :-------------------: | :--------: | :----------------------------: |
|      launch path      |  command   |            options             |

##### The matched command-line

| node migration-cli.js |  run   | 123556 | -u user | -p pass | --db="db-name" |
| :-------------------: | :----: | :----: | :-----: | :-----: | :------------: |
|      launch path      | action | param  | option  | option  |     option     |

##### Arguments Definition

"Arguments" are all space-separated command-line parts after `launch path`

##### Command Definition

"Command" are space-separated command-line parts without leading dashes

##### Params Definition

"Params" are obtained values by matching the command in accordance with the given pattern

##### Options Definition

"Options" are command-line parts using a leading dashes

Each option is either a key-value or a key. If in the beginning 2 dashes is a long key if one dash is a short key which must be 1 character long:

`--name=Alex`, `--name Alex`, `-n Alex`, `--version`, `-v`

## Parsing args

Parsing the command-line (Clirio implementation)

```ts
Clirio.parse('test --foo 15 -b -a -r 22');
```

```ts
Clirio.describe(['test', '--foo=15', '-b', '-a', '-r', '22']);
```

Result

```json
[
  { "type": "action", "key": 0, "value": "test" },
  { "type": "option", "key": "foo", "value": "15" },
  { "type": "option", "key": "b", "value": null },
  { "type": "option", "key": "a", "value": null },
  { "type": "option", "key": "r", "value": "22" }
]
```

The another example

```bash
$ my-cli set-time 10:56 --format=AM -ei 15
```

| type   | key      | value      |
| ------ | -------- | ---------- |
| action | 0        | "set-time" |
| action | 1        | "10:56"    |
| option | "format" | "AM"       |
| option | "e"      | null       |
| option | "i"      | "15"       |

##### Summary

- all parts of the command-line without a leading dash will be described as actions
- any action has keys as a numerical index in ascending order
- any option with a missing value will be `null`
- any option starting with a single dash will be separated by letters
- all options will be parsed into key-value
- the raw value of any options can be a `string` or `null`

## App configuration

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

## Modules

Clirio modules are custom classes with the `@Module()` decorator (they can be considered as controllers).
An application can have either one or many modules. Each module contains actions (patterns for commands)

Using a common module

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
$ my-cli hello there
$ my-cli migration run
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

## Actions

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

### Command patterns

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

The total pattern based on `@Module(...)` and `@Commands(...)` will be matched with the command-line

Pattern can consist of one or more space-separated arguments

##### Case 1. Exact match

The exact command will be matched

```ts
  @Command('hello')
  @Command('hello my friends')
```

| Command pattern  | Matching command-line |
| ---------------- | --------------------- |
| hello            | hello                 |
| hello there      | hello there           |
| hello my friends | hello my friends      |

##### Case 2. Match variants

Using the `|` operator to set match variants for params. Multiple command-lines will be matched to one route. The number of space-separated parts of the command-line should be the same.

```ts
  @Command('migration run|up')
  @Command('hello|hey|hi')
```

| Command pattern   | Matching command-line          |
| ----------------- | ------------------------------ |
| migration run\|up | migration run<br> migration up |
| hello\|hey\|hi    | hello<br> hey<br> hi           |

##### Case 3. Pattern with value masks

Using the `< >` operator to specify a place for any value. The number of space-separated parts of the command-line should be the same

```ts
  @Command('hello <first-name> <last-name>')
  @Command('set-time <time>')
```

| Command pattern                    | Matching command-line                                                |
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

| Command pattern          | Matching command-line                                               |
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

| Command pattern | Matching command-line |
| --------------- | --------------------- |
| --help, -h      | --help<br/> -h        |
| --version, -v   | --version<br/> -v     |
| --mode=check    | --mode=check          |

Use [Options data control](#options-data-control) to add other options
To avoid problems, do not mix this pattern with the rest ones

## Empty command

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
$ my-cli
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
$ my-cli migration
```

```console
The migration module requires additional instruction. Type --help
```

### Failure command

The `@Failure()` action decorator is a way to catch the case when the specified command patterns don't match

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
$ my-cli goodbye
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
$ my-cli migration stop
```

```console
The migration module got the wrong instruction
```

## Data control

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
$ my-cli get-location Prague --format=DMS --verbose
```

```console
{ city: "Prague" }
{ format: "DMS", verbose: true }
```

### Params data control

To handle incoming data, use DTO (instead of unknown type)

### Params DTO

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

Here the second and third parts of the command-line are the masks for any values that the user enters
The `hello` method will be called if the user enters a three-part command. The last 2 parts are passed to the params argument as keys and values

```bash
$ my-cli hello Alex Smith
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
$ my-cli hello Alex Smith
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
$ my-cli git add test.txt logo.png
```

```console
['test.txt', 'logo.png']
```

### Options data control

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

### Options DTO

The `@Option()` decorator for dto properties provided. It can accept comma-separated key aliases to map DTO properties

```ts
class GitStatusOptionsDto {
  @Option('--branch, -b')
  readonly branch?: string;

  @Option('--ignore-submodules, -i')
  readonly ignoreSubmodules?: string;

  @Option('--short, -s')
  @Transform(Clirio.form.FLAG)
  readonly short?: boolean;
}
```

```bash
$ my-cli git status --branch=master --ignore-submodules=all --short

$ my-cli git status --branch master --ignore-submodules all --short

$ my-cli git status -b master -i all -s

```

Each input data will lead to one result:

```console
{ branch: 'master', ignoreSubmodules: 'all', short: true }
```

If the `@Option()` decorator is absent then there will be no mapping

```bash
$ my-cli git status --branch=master --ignore-submodules=all --short
```

```console
{ branch: 'master', "ignore-submodule": 'all', short: true }
```

## Input DTO

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
In this example it is possible use them for DTO properties `SetLimitParamsDto`, `SetLimitOptionDto`

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

### Envs data control

The `@Envs()` decorator provided

```ts
import { Envs } from 'clirio';

@Module('migration')
export class MigrationModule {
  @Command('test-connect')
  public testConnect(@Envs() envs: TestConnectEnvsDto) {
    // ...
  }
}
```

### Envs DTO

The `@Env()` decorator for dto properties provided

```ts
import { Env } from 'clirio';

export class TestConnectEnvsDto {
  @Env('DB_HOST')
  readonly host: string;

  @Env('DB_PORT')
  @Transform((v) => Number(v))
  readonly port: number;

  @Env('DB_USER')
  readonly user: string;

  @Env('DB_PASSWORD')
  readonly password: string;
}
```

### Validation

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
  @Transform(Clirio.form.FLAG)
  readonly short?: boolean;
}
```

```bash
$ my-cli git status --ignore-submodules
```

```console
The "branch" option is wrong
```

For any case of failed validation, the same error will be thrown `The "%KEY_NAME%" %DATA_TYPE% is wrong`

To have more flexible validations, use [Pipes](#pipes)

It is possible to [configure](#setconfig) throwing errors on unknown keys in options

##### Validation of an optional key

```ts
class OptionsDto {
  @Option('--id')
  @Validate([(v) => v === undefined || null, /^[0-9]+$/.test(v)])
  readonly id?: number;
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

## Transformation

The `@Transform()` decorator provided to transform input data.

It must be used for DTO properties in conjunction with `@Option()` or `@Param()` or `@Env()` (this depends on the type of controlled data)

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
$ my-cli auto set bmw 300 --turbo=yes
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
$ my-cli sum 5 15
```

```console
'515'
```

With transformation

```ts
class SumParamsDto {
  @Param()
  @Transform((v) => Number(v))
  readonly first: number;

  @Param()
  @Transform((v) => Number(v))
  readonly second: number;
}
```

```bash
$ my-cli sum 5 15
```

```console
20
```

##### Using Clirio-made forms


```ts
class SumParamsDto {
  @Param()
  @Transform(Clirio.form.NUMBER)
  readonly first: number;
}
```

```ts
class SetAutoOptionsDto {
  @Option('--turbo')
  @Transform(Clirio.form.FLAG)
  readonly turbo: boolean;
}
```


See [Clirio-made forms](#form)

## Pipes

Pipes are designed to [validate](#validation) and [transform](#transformation) controlled data (params and options).
Using pipes is more functional than the `@Validate()` and `@Transform()` decorators and gives more flexibility

```ts
import { ClirioPipe, PipeContext, ClirioValidationError } from 'clirio';

export class CustomPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    // controlled params
    if (input.dataType === 'params') {
      // validation
      if (myCustomCheckName(data.name)) {
        throw new ClirioValidationError('error message', {
          dataType: input.dataType,
          propertyName: 'name',
        });
      }

      // transformation
      return { 
        ...data, 
        name: String(data.name).toLowerCase() 
      };
    }

    // controlled options

    if (input.dataType === 'options') {
      // validation
      if (myCustomCheckTypeId(data)) {
        throw new ClirioValidationError('error message', {
          dataType: input.dataType,
          propertyName: 'typeId',
        });
      }

      // transformation
      return {
        ...data, 
        typeId: Number(data.typeId) 
      };
    }

    return data;
  }
}
```

The `input: PipeContext` argument contains the value input.entity (it is a DTO). It is possible to extract reflection data and use custom decorators.

The `@Pipe()` decorator provided

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
import { ClirioPipe, PipeContext, ClirioValidationError } from 'clirio';

export class MigrationUpPipe implements ClirioPipe {
  transform(data: any, input: PipeContext): any | never {
    if (input.dataType === 'params') {
      // validation
      if (/^[0-9]+$/.test(data.migrationId)) {
        throw new ClirioValidationError('the "migration-id" param is not a number', {
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

### Example of a global pipe

```ts
const cli = new Clirio();
cli.addModule(MigrationModule);
cli.setGlobalPipe(CommonPipe);
cli.execute();
```

## Exceptions

Exceptions can be thrown in pipes or actions. Special exceptions designed to complete the script with the desired result

- ClirioValidationError
- ClirioCommonError

```ts
import { Module, Command, ClirioCommonError } from 'clirio';

@Module()
export class CommonModule {
  @Command('check')
  public check() {
    throw new ClirioCommonError('Not working!', { code: 'CUSTOM_ERR_CODE' });
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

## Filters

Filters are designed to catch exceptions

```ts
@Module('ping')
export class PingModule {
  @Command('pong')
  @Filter(PingPongFilter)
  public pong() {
    throw new ClirioCommonError('Not working!', { code: 'CUSTOM_ERR_CODE' });
  }
}
```

```ts
import {
  ClirioCommonError,
  ClirioFilter,
  ClirioValidationError,
  FilterContext,
} from 'clirio';

export class PingPongFilter implements ClirioFilter {
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

### Example of a global filter

```ts
const cli = new Clirio();
cli.addModule(MigrationModule);
cli.setGlobalFilter(CommonFilter);
cli.execute();
```

## Displaying help

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
$ my-cli --help
```

```console
Description of commands is here
```

It is possible to implement any other commands

```ts
@Command('-m, --man')

@Command('help|h')

@Command('man <command>')
```

### Helper decorator

The `@Helper()` decorator provided to handle the help mode

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

```bash
$ my-cli --help
```

The `ClirioHelper` class provides api for getting descriptions of actions and methods for formatting it

The `dumpAll` method returns description for all commands. It is possible to do custom formatting

### Displaying help in a particular module

The `dumpThisModule` method returns description for the current module.

```ts
@Module('ping')
export class PingModule {
  @Command('test')
  public test() {
    console.log('ping test');
  }

  @Command('-h, --help')
  public help(@Helper() helper: ClirioHelper) {
    const dump = helper.dumpThisModule();
    console.log(ClirioHelper.formatDump(dump));
  }
}
```

```bash
$ my-cli ping --help
```

### Hidden commands

The `hidden` option in the `Command()` decorator lets hide description of the command in displaying help

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

## Version

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
$ my-cli --version
```

```console
1.3.1
```

## Clirio API

### setConfig

Setting the global configuration

**Parameters:**

- config: Object

**Returns:**

- Clirio

```ts
cli.setConfig({
  allowUncontrolledOptions: false,
});
```

| Param                    |                                            Description                                             | Default |
| ------------------------ | :------------------------------------------------------------------------------------------------: | ------: |
| allowUncontrolledOptions | Clirio can throw Error if DTO are not specified for options but it will be got in the command-line |    true |

### setGlobalPipe

sets global pipe

**Parameters:**

- pipe: ClirioPipe

**Returns:**

- Clirio

```ts
cli.setGlobalPipe(CommonPipe);
```

### setGlobalFilter

sets global filter

**Parameters:**

- pipe: ClirioFilter

**Returns:**

- Clirio

```ts
cli.setGlobalFilter(CommonFilter);
```

### addModule

adds one module

**Parameters:**

- module: Constructor | Constructor['prototype']

**Returns:**

- Clirio

```ts
cli.addModule(PingModule);
cli.addModule(new MigrationModule());
```

### setModules

sets several modules

**Parameters:**

- modules (Constructor | Constructor['prototype'])[]

**Returns:**

- Clirio

```ts
cli.setModules([HelloModule, new MigrationModule()]);
```

### setArgs

sets arguments of the command-line

Arguments will be determined automatically but it is possible to set them manually. This option is useful for testing and debugging the application

**Parameters:**

- args: string[]

**Returns:**

- Clirio

```ts
cli.setArgs(['git', 'add', 'test.txt', 'logo.png']);
```

### execute

launches Clirio App

**Parameters:**

no parameters

**Returns:**

- Promise<void>

```ts
await cli.execute();
```

## Clirio utils

Clirio class has static methods and values

### Clirio.valid

an object of check functions for [validation](#validation)

```ts
Clirio.valid.BOOLEAN;
Clirio.valid.NUMBER;
```

| Key       | Checks if the value is                                                       |
| --------- | ---------------------------------------------------------------------------- |
| OPTIONAL  | `undefined` then it returns `true` otherwise it returns `null`               |
| REQUIRED  | `undefined` then it returns `false` otherwise it returns `null`              |
| NULLABLE  | `null` then it returns true otherwise it returns `null`                      |
| NULL      | `null`                                                                       |
| NUMBER    | `null`                                                                       |
| INTEGER   | `number` (integer) or a string that resembles an integer                     |
| STRING    | `string`                                                                     |
| BOOLEAN   | `boolean` or `string` that resembles boolean (`"true"`or`"false"`)           |
| FLAG      | `null` or `string` that resembles boolean (`"true"` or `"false"`)            |
| KEY_VALUE | `string` or `array` of `string` in the `key=value` format (`"DB_USER=user"`) |

##### example

```ts
export class MigrationRunOptionsDto {
  @Option('--id')
  @Validate(Clirio.valid.NUMBER)
  readonly id: number;

  @Option('--start-date, -b')
  @Validate([Clirio.valid.NULLABLE, Clirio.valid.STRING])
  readonly startDate: string;
}
```

### Clirio.form

```ts
Clirio.form.BOOLEAN;
Clirio.form.NUMBER;
```

an object of functions for [transformation](#transformation)

| Key       | transforms into                                                                              |
| --------- | -------------------------------------------------------------------------------------------- |
| NUMBER    | `number`                                                                                     |
| STRING    | `string`                                                                                     |
| BOOLEAN   | `boolean`                                                                                    |
| FLAG      | `boolean` (from `null` or `"true"` or `"false"`)                                             |
| KEY_VALUE | `object` from the `key=value` format or array of ones (`"DB_USER=user"`)                     |
| ARRAY     | `array` (if the value is originally an array, that array will be returned)                   |
| PLAIN     | `string` or `null` (if the value is originally an array, the first element will be returned) |

##### example

```ts
export class MigrationRunOptionsDto {
  @Option('--env, -e')
  @Transform(Clirio.form.KEY_VALUE)
  readonly envs: Record<string, string>;

  // always an array
  @Option('--id, -i')
  @Transform(Clirio.form.ARRAY)
  readonly ids: string[];

  // always a primitive type
  @Option('-f, --format')
  @Transform(Clirio.form.PLAIN)
  readonly format: string;
}
```

### Clirio.parse

parses and describes the command-line

Arguments will be determined automatically but it is possible to set them manually. This option is useful for testing and debugging the application

**Parameters:**

- commandLine: string

**Returns:**

```ts
Array<
  | {
      type: 'option';
      key: string;
      value: string | null;
    }
  | {
      type: 'action';
      key: number;
      value: string;
    }
>;
```

```ts
Clirio.parse('foo -a --bbb');
```

### Clirio.describe

describes arguments of the command-line

**Parameters:**

- args: string[]

**Returns:**

```ts
Array<{
  type: ArgType;
  key: string;
  value: string | null;
}>;
```

```ts
Clirio.describe(['foo', '-a', '--bbb']);
```

## Decorators

Clirio works with decorators. More about [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

### "Command" decorator

The `@Command()` decorator specifies [the command pattern](#command-patterns)

**Parameters:**

- command: string [optional] - command pattern
- options: object [optional] - extra options
  - options.description: string [optional] - description for the help mode
  - options.hidden: boolean [optional]- hiding the action in the help mode

### "Empty" decorator

The `@Empty()` decorator catches the case when [nothing is entered](#empty-command)

### "Env" decorator

The `@Env()` decorator maps DTO properties in [Envs DTO](#envs-dto)

### "Envs" decorator

The `@Envs()` decorator controls [environments](#envs-data-control)

**Parameters:**
no parameters

### "Filter" decorator

The `@Filter()` decorator catches [exceptions](#exceptions) in [actions or pipe](#filtres)

**Parameters:**
no parameters

### "Failure" decorator

The `@Failure()` decorator catches the case when the specified command patterns [don't match](#failure-command)

**Parameters:**
no parameters

### "Helper" decorator

The `@Helper()` decorator handles [the help mode](#displaying-help)

**Parameters:**
no parameters

### "Module" decorator

The `@Module()` decorator makes [classes as controllers](#modules) in to [configure Clirio app](#app-configuration)

**Parameters:**

- command: string [optional] - command prefix
- options: object [optional] - extra options
  - options.description: string [optional] - description for the help mode
  - options.hidden: boolean [optional] - hiding the module in the help mode

### "Option" decorator

The `@Option()` decorator maps DTO properties in [options DTO](#options-dto)

**Parameters:**

- key: string [optional] - comma separated key aliases
- options: object [optional] - extra options
  - options.description: string [optional] - description for the help mode
  - options.hidden: boolean [optional] - hiding the option in the help mode

### "Options" decorator

The `@Options()` decorator controls [input options](#options-data-control)

**Parameters:**
no parameters

### "Param" decorator

The `@Param()` decorator maps DTO properties in [params DTO](#params-dto)

**Parameters:**

- key: string [optional] - comma separated key aliases
- options: object [optional] - extra options
  - options.description: string [optional] - description for the help mode
  - options.hidden: boolean [optional] - hiding the param in the help mode

### "Params" decorator

The `@Params()` decorator controls [input params](#params-data-control)

**Parameters:**
no parameters

### "Pipe" decorator

The `@Pipe()` decorator [validates and transforms](#pipes) controlled data (params and options).

**Parameters:**

- pipe: ClirioPipe

### "Transform" decorator

The `@Transform()` decorator [transforms](#transformation) input params and options

**Parameters:**

- value: a function or an array of functions
  - `(value: any) => boolean | null`
  - `(value: any) => (boolean | null)[]`

### Validate decorator

The `@Validate()` decorator [validates](#validation) input params and options

**Parameters:**

- value: a transform function
  - `(value: any) => any`
