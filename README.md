# Clirio

A mini engine for node.js command-line interfaces based on typescript, decorators, DTOs

> **NOTE**
> This lib is _alpha quality_. There is no guarantee it will be reliably

## Install

```bash
npm install clirio

```

```bash
yarn add clirio

```

## Peer dependencies

```bash
reflect-metadata@^0.1 joi@^17 joi-class-decorators@^1

```

### Get started

For example to emulate `git status` cli command with options - 3 easy steps to build an app

1. Create module

```ts
@Module('git')
export class GitModule {
  @Command('status')
  public status(@Options() options: GitStatusDto) {
    console.log(options);
  }
}
```

2. Create Dto

```ts
class GitStatusDto {
  @Option('--branch, -b')
  readonly branch?: string;

  @Option('--ignore-submodules')
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';

  @Option('--short, -s')
  readonly short?: string;
}
```

3. Configure a base class

```ts
const clirio = new Clirio();
clirio.addModule(GitModule);
clirio.build();
```

Result:

```bash

$ my-cli git status  -b master --ignore-submodules  'all' -s

```

```js
{ branch: 'master', short: true, ignoreSubmodules: 'all' }
```

Please note that all values that come out as a results of parsing the command are either strings or booleans
To validate and convert to the desired type - use [Joi](https://www.npmjs.com/package/joi) and [DTO type annotations](https://www.npmjs.com/package/joi-class-decorators)

### Example Dto with Joi

#### Options dto

```typescript
class GitStatusDto {
  @Option('--branch, -b')
  @JoiSchema(Joi.string().required())
  readonly branch: string;

  @Option('--ignore-submodules')
  @JoiSchema(
    Joi.string()
      .valid('none' | 'untracked' | 'dirty' | 'all')
      .optional()
  )
  readonly ignoreSubmodules?: 'none' | 'untracked' | 'dirty' | 'all';

  @Option('--short, -s')
  @JoiSchema(Joi.boolean().optional())
  readonly short?: boolean;
}
```

#### Params dto

```ts
class AddParamsDto {
  @Param('all-files')
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly allFiles: string[];
}
```

### Example Module

```ts
@Module()
export class GitModule {
  @Command('status')
  public status(@Options() options: GitStatusDto) {
    // cli: git status -s -b master --show-stash
    // output:
    // options -> { short: true, branch: master, ignoreSubmodules: "untracked"}
  }

  @Command('checkout <branch>')
  public branch(@Params() params: CheckoutParamsDto) {
    //  cli: git checkout feature
    // output:
    // params -> { branch: "feature" }
  }

  @Command('add <...all-files>')
  public add(
    @Params() params: AddParamsDto,
    @Options() options: AddOptionsDto
  ) {
    // cli: git add test.txt logo.png
    // output:
    // params -> { allFiles: ['test.txt', 'logo.png'] }
    // options -> { ... }
  }
}
```

By default, the command parser cannot determine whether an option is an array. You can specify this, in which case the same option names will be collected in an array, even if there is only one option

```typescript
class GitStatusDto {
  @Option('--name, -n', {
    isArray: true,
  })
  @JoiSchema(Joi.array().items(Joi.string()).required())
  readonly names: string[];
}
```

###### Result

```bash
$ cli model --name Ford -n Tesla
```

```
{ names: ['Ford', 'Tesla'] }
```

There is a special case for using variables. All variables will be collected in an object

```typescript
class GitStatusDto {
  @Option('--env, -e', {
    variable: true,
  })
  @JoiSchema(Joi.object().pattern(Joi.string(), Joi.string()))
  readonly envs: Record<string, string>;
}
```

###### Result

```bash
$ cli connect -e DB_NAME=db-name -e DB_USER=db-user
```

```
{ envs: { DB_USER: 'db-name', DB_USER: 'db-user' } }

```
