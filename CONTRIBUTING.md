# Contributing to toio.js

<!-- TOC depthFrom:2 depthTo:3 -->

- [Environment](#environment)
  - [Monorepo](#monorepo)
  - [TypeScript](#typescript)
  - [noble](#noble)
  - [CI](#ci)
- [Dependency](#dependency)
- [Development Workflow](#development-workflow)
  - [Build](#build)
  - [Test](#test)
  - [Lint](#lint)
- [Branch Strategy](#branch-strategy)
- [Coding Rules](#coding-rules)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Release](#release)
- [License](#license)

<!-- /TOC -->

## Environment

- Node.js >= v8.0.0
- Yarn

### Monorepo

toio.js is monorepo style repository. Source code of @toio packages are located under `packages/` directory. [Lerna](https://lernajs.io/) and [Yarn Workspace](https://yarnpkg.com/en/docs/cli/workspace) are the tools for managing monorepo.

### TypeScript

toio.js is written by [TypeScript](https://www.typescriptlang.org/). It provides type and makes productivity high.

### noble

toio.js uses [noble](https://github.com/noble/noble) package to act as Bluetooth Low Energy central module. If you face some issue around BLE connection and OS, issues page of noble may helps you.

### CI

&lt;TBD&gt;

## Dependency

Each package has the following dependencies.

```
packages/
  |- cube/          # depends on `noble`
  |- scanner/       # depends on `noble` and @toio/cube`
```

## Development Workflow

1.  `git checkout -b some-branch`
1.  `yarn build:watch` to start continuous build execution
1.  open editor (ex. Visual Studio Code) and coding
1.  run sample or local test
1.  git commit and push and create PR

### Build

The build command generate JavaScript code (\*.js) and type information (\*.d.ts) on `lib/` directory.

```
yarn run build        # one shot build
yarn run build:watch  # watch version
```

### Test

```
yarn run test
```

### Lint

We use [ESLint](https://eslint.org/) for linting our code.

```
yarn run lint
```

## Branch Strategy

We adopted [GitHub Flow](http://scottchacon.com/2011/08/31/github-flow.html). (Only release process is customized.)

- simple workflow
- master is always stable and releasable
- human readable branch name
- merge master via PR

## Coding Rules

We adopted [prettier](https://prettier.io/) to format source code. Please see `.prettierrc.js` an use plugin of your editor.

## Commit Message Guidelines

We adopted [Conventional Commits](https://conventionalcommits.org/ 'Conventional Commits').

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Format**

```
<type>(optional scope): <description>

[optional body]

[optional footer]
```

**Example**

```
fix: minor typos in code

see the issue for details on the typos fixed

fixes issue #12
```

**type and scope**

- `type`:
  - `feat`: add new feature
  - `fix`: fix a bug
  - `style`: format style
  - `refactor`: refactoring
  - `perf`: it is related performance
  - `test`: update tests
  - `docs`: update documents
  - `build`: update build flow/script
  - `ci`: update ci configuration
  - `chore`: the other
- `scope`: package name or file name
  - e.g.) `@toio/cube`, `example-chase`

If you commit cross `component` changes in a pull request, separate commits by `component`.

## Release

**This is for maintainer**

```
git checkout -b <release-branch>   # create branch for release
yarn run versionup                 # bump version for each package
```

Then push release branch and submit pull request.
After PR approved, publish new version to the registry.

```
yarn run release
```

## License

By contributing to toio.js, you agree that your contributions will be licensed under MIT license.
