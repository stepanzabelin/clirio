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

##### New features flow, bug fixing flow for the latest version

Contributor:

- Checkout `master` branch
- MR `feature` branch -> `master` branch

Maintainer:

- Create tag for `master` branch -> `vX.X.X`
- Build `master` branch locally
- npm publish `master` branch -> `vX.X.X`

##### Bug fixing flow for old versions

in progress
