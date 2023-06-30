# Clirio

A mini framework for node.js command-line interfaces based on TypeScript, decorators, DTOs

> **NOTE**
> This lib is _alpha quality_. There is no guarantee it will be reliably.
> The documentation also needs to be corrected

- [Clirio.js](#clirio)
  - [Installation](#installation)
    - [Peer dependencies](#peer-dependencies)
  - [Quick Start](#quick-start)
  - [Docs](#docs)
    - [The base class](#the-base-class)
    - [Modules](#modules)
    - [Actions](#actions)
      - [Command pattern](#decorator-for-command-pattern)
      - [Empty input](#decorator-for-empty-input)
      - [Failure input](#decorator-for-failure-input)
    - [Injecting data](#injecting-data)
    - [Using Joi](#using-joi)
    - [Special cases](#special-cases)
      - [Help mode](#help-mode)
      - [Version](#version)
    - [Exceptions](#exceptions)
    - [Receipts](#receipts)

## Installation

```bash
npm install clirio

```

```bash
yarn add clirio

```

## Quick Start

For example to emulate `git status` cli command with options - 3 easy steps to build an app

1. Create Dto

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

2. Create module

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

3. Configure a base class

```ts
import { Clirio } from 'clirio';

const clirio = new Clirio();
clirio.addModule(GitModule);
clirio.build();
```

###### Result

```bash

$ cli git status -b master --ignore-submodules  all --short

```

```console
{ branch: 'master', ignoreSubmodules: 'all', short: true }
```

## Docs

The application structure should consist of the following parts:

1. the base class - `Clirio`
2. modules (custom classes)
3. actions (methods in class-modules with decorators )

Examples [here](https://github.com/stepanzabelin/clirio/tree/master/src/test-env/complex-cli)

A starter kit is in progress

### The base class

`Clirio` - is the base class which configures the application and links modules

```ts
const cli = new Clirio();
cli.setModules([HelloModule, CommonModule, GitModule, MigrationModule]);
cli.build();
```

#### Methods

##### setConfig

Setting global configuration

```ts
cli.setConfig({
  nullableOptionValue: true,
  validateOptionsWithoutDto: true,
});
```

| Param                     |                                                              Description                                                              | Default |
| ------------------------- | :-----------------------------------------------------------------------------------------------------------------------------------: | ------: |
| nullableOptionValue       | value conversion of command line options that have no value e.g. `--verbose` - initially it is `null` after conversion will be `true` |    true |
| validateOptionsWithoutDto |           if dto options are not specified but options will be passed in the command, then there may be a validation error            |    true |

##### addModule

Adding one module

```ts
cli.addModule(PingModule);
```

##### setModules

Setting several modules

```ts
cli.setModules([HelloModule, CommonModule]);
```

##### setArgs

Arguments will be determined automatically but it is possible to set them manually

```ts
cli.setArgs(['git', 'add', 'test.txt', 'logo.png']);
```

##### onError

Callback for handling error

```ts
import chalk from 'chalk';

cli.onError((err: ClirioError) => {
  console.log(chalk.red(err.message));
  process.exit(9);
});
```

##### onSuccess

Callback for handling an success result

```ts
cli.onSuccess((data: ClirioSuccess) => {
  const successMessage = 'The command has been executed successfully!';
  console.log(chalk.green(data.message ?? successMessage));
  process.exit(0);
});
```

##### onWarning

Callback for handling an warning result

```ts
cli.onWarning((data: ClirioWarning) => {
  console.log(chalk.yellow(data.message));
  process.exit(0);
});
```

##### onComplete

Callback for handling an complete result

```ts
cli.onComplete((data: ClirioComplete) => {
  const message = data.message ?? 'Thanks!';

  console.log(chalk.blue(message));
  process.exit(0);
});
```

##### onDebug

Callback for handling an debugging error

```ts
cli.onDebug((err: ClirioDebug) => {
  const output = err.format();

  console.log(chalk.red(output));
  process.exit(5);
});
```

### Modules

Modules are custom classes with the `@Module()` decorator (they can be considered as controllers).
An application can have either one or many modules. Each module contains actions (patterns for commands)

###### Example of common module

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

Using different modules to separate unrelated commands and structure the code

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

The actions are methods in class-modules with decorators

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

#### Decorator for command pattern

The `@Command()` decorator takes command pattern

```ts
@Module()
export class MigrationModule {
  @Command('migration init')
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

##### Exact match

The pattern of one or more space-separated arguments. Exact match will work

```ts
@Command('hello')

@Command('hello there')

@Command('hello my friends')
```

##### Match variants

Using the `|` operator to select match variants

```ts
@Command('hello|hey|hi')

@Command('migration run|up')

```

##### Pattern with value masks

Using the `< >` operator to specify a place for any value

```ts
@Command('hello <first-name> <last-name>')

@Command('set-time <time>')

```

##### Pattern with rest values mask

Using the `<... >` operator to specify a place for array of values
This kind of mask can be only one per command pattern

```ts
@Command('hello <...all-names>')

@Command('message <...words>')
```

To get the entered values you should use the `@Params()` decorator and DTO, that is described in more detail below

##### Option match

This pattern is designed for special cases like "help" and "version". This is an exact match of the option key and value. Match variants can be separated by comma

```ts
@Command('--help, -h')

@Command('--version, -v')

@Command('--mode=check')
```

#### Decorator for empty input

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
      'The migration module requires additional instruction. Type --help'
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

#### Decorator for failure input

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

### Injecting data

Using special decorators to pass input data

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

Instead of unknown types, you should use a DTOs in which the properties also have special decorators to have type checking and input validation. More detailed below

#### Passing command params

The "Params" term mean the values of the masks in the command pattern
The `@Params()` decorator provided

###### For example

```ts
@Module()
export class HelloModule {
  @Command('hello <first-name> <last-name>')
  public hello(@Params() params: HelloParamsDto) {
    console.log(params);
  }
}
```

Here the second and third parts are masks for any values that the user enters
The `hello` method will be called if the user enters a three-part command. The last 2 parts are passed to the params argument as keys and values

##### Params Dto

The `@Param()` decorator for dto properties provided. It can take a key in an param mask to map DTO properties

```ts
export class HelloParamsDto {
  @Param('first-name')
  readonly firstName?: string;

  @Param('last-name')
  readonly lastName?: string;
}
```

```bash
$ cli hello Alex Smith
```

```console
{ firstName: "Alex", lastName: "Smith" }
```

The `@Param()` decorator may have no arguments. In this case there will be no key mapping

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

###### Example with rest values mask

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

#### Passing command options

The "Options" term mean arguments starting with a dash.
Each option is either a key-value or a key. If in the beginning 2 dashes is a long key if one dash is a short key which must be 1 character long: `--name=Alex`, `--name Alex`, `-n Alex`, `--version`, `-v`

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

##### Options Dto

The `@Option()` decorator for dto properties provided. It can accept key aliases (comma separated) to map DTO properties

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

The `@Option()` decorator may have no arguments. In this case there will be no key mapping and no aliases

```ts
class GitStatusOptionsDto {
  @Option()
  readonly branch?: string;

  @Option()
  readonly 'ignore-submodules'?: 'none' | 'untracked' | 'dirty' | 'all';

  @Option()
  readonly short?: boolean;
}
```

```bash
$ cli git status --branch=master --ignore-submodules=all --short
```

```console
{ branch: 'master', "ignore-submodule": 'all', short: true }
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

### Using Validation and Transformation

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
    (v) => v === undefined || ['none', 'untracked', 'dirty', 'all'].includes(v)
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
"branch" is required
```

```bash
$ cli git status --log=true
```

```console
"log" is an unknown key
```

```bash
$ cli git status -b master --ignore-submodules  all --short
```

```console
{ branch: 'master', ignoreSubmodules: 'all', short: true }
```

##### Joi params validation

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

##### Joi validating and converting

Joi validates and converts input values that are originally string. That is a very useful feature.

###### Summation and concatenation examples

```ts
@Module()
export class SumModule {
  @Command('sum <first> <second>')
  public sum(@Params() params: SumParamsDto) {
    console.log(params.first + params.second);
  }
}
```

###### Without Joi

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

###### With Joi

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

#### Help mode

Special case for the command as an option designed

```ts
@Module()
export class CommonModule {
  @Command('-h, --help')
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

Of course you can use other options and params

```ts
@Command('-m, --man')

@Command('help|h')

@Command('man <command>')
```

#### Helper decorator

The `@Helper()` decorator provided to handle help mode

```ts
import { Module, Command, Description, Helper, ClirioHelper } from 'clirio';

@Module()
export class CommonModule {
  @Command('hello there')
  @Description('Say hello there')
  public helloThere() {
    // ...
  }

  @Command('-h, --help')
  public help(@Helper() helper: ClirioHelper) {
    const moduleDescription = helper.describeAllModules();
    console.log(ClirioHelper.formatModuleDescription(moduleDescription));
  }
}
```

The `@Description()` decorator for module action provided to describe the command

The `ClirioHelper` class provides methods for getting descriptions of commands and formatting

The `helper.describeAllModules()` method provides description for all commands

##### helper.describeAllModules

The method returns array of objects

| Key               |       Type       |                              Description |
| ----------------- | :--------------: | ---------------------------------------: |
| command           |      string      |                      full formed command |
| moduleCommand     |  string \| null  |                     module-bound command |
| actionCommand     |      string      |                     action-bound command |
| description       |      string      | text from the `@Description()` decorator |
| optionDescription | array of objects | description of command options in action |

###### optionDescription

| Key         |      Type       |                                     Description |
| ----------- | :-------------: | ----------------------------------------------: |
| options     | array of string |                                  option aliases |
| description |     string      |        text from the `@Description()` decorator |
| type        |     string      |                                type of variable |
| itemType    | string \| null  | type of item variable if the base type is array |

You can format the received data custom or use the `ClirioHelper.formatModuleDescription` static method

##### Hidden command in Helper

The `@Hidden()` decorator for module action provided to hide description of the command

```ts
import { Module, Command, Hidden, Description } from 'clirio';

@Module()
export class Module {
  @Command('debug')
  @Hidden()
  public debug() {
    // ...
  }

  @Command('hello there')
  @Description('Say hello there')
  public helloThere() {
    // ...
  }
}
```

The `helper.describeAllModules()` method will not provide description of the `debug` command in this case

#### Version

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

### Exceptions

Special exceptions designed to complete the script with the desired result

| Exception                              | Description |                    Handler |
| -------------------------------------- | :---------: | -------------------------: |
| `new ClirioError(message: string)`     |    Error    |    `cli.onError(callback)` |
| `new ClirioSuccess(message?: string)`  |   Success   |  `cli.onSuccess(callback)` |
| `new ClirioWarning(message: string)`   |   Warning   |  `cli.onWarning(callback)` |
| `new ClirioComplete(message?: string)` |  Complete   | `cli.onComplete(callback)` |
| `new ClirioDebug(message: string)`     |  Debugging  |    `cli.onDebug(callback)` |

By default, all handlers in Clirio are configured, but you can override to your own callback for each ones
Use one of the available exceptions to throw the desired event, after that the related callback will be called and the script will end

###### Examples

```ts
import { Module, Command, ClirioError } from 'clirio';

@Module()
export class CommonModule {
  @Command('check')
  public check() {
    throw new ClirioError('Not working!');
  }
}
```

```ts
const cli = new Clirio();
cli.addModule(CommonModule);
cli.onError((err: ClirioError) => {
  console.log(chalk.red('An error occurred: ' + err.message));
});
cli.build();
```

```bash

$ cli check

```

```console
An error occurred: Not working!
```

```ts
import { Module, Command, ClirioSuccess } from 'clirio';

@Module()
export class CommonModule {
  @Command('start')
  public start() {
    throw new ClirioSuccess();
  }
}
```

```ts
const cli = new Clirio();
cli.addModule(CommonModule);
cli.onSuccess((data: ClirioSuccess) => {
  if (data.message) {
    console.log(chalk.green(message));
  } else {
    console.log(chalk.green('Successfully!'));
  }
});
cli.build();
```

```bash

$ cli start

```

```console
Successfully!
```

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

### Contributing

Contributing flow is in progress
