## Installing

```bash
yarn install
```

### Launch test-cli-app

```bash
yarn dev ... # command
yarn dev hello --first-name=Alex --last-name=Smith --middle-name=123
```

## Git Flow

Each library version is in a branch `release-v{X}`
{X} - the latest major version (1,2,3...)

The most recent release will be merged into the master branch

##### New features flow

Contributor
checkout `feature-v{X}`
MR `feature-v{X}` -> `release-v{X}`

Maintainer
MR `release-v{X}` -> `master` -> `tag`
npm publish `release-v{X}`

##### Bug fixing flow

Contributor
checkout `release-v{Y}`
MR `feature-v{Y}` -> `release-v{Y}`

Maintainer request
npm publish `release-v{Y}`
