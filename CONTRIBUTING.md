# Contributing

Contributions are always welcome, no matter how large or small!

We want this community to be friendly and respectful to each other. Please follow it in all your interactions with the project. Before contributing, please read the [code of conduct](./CODE_OF_CONDUCT.md).

## Development workflow

This project is a monorepo managed using [Yarn workspaces](https://yarnpkg.com/features/workspaces). It contains the following packages:

- The library package in the root directory.
- An example app in the `example/` directory.

To get started with the project, make sure you have the correct version of [Node.js](https://nodejs.org/) installed. See the [`.nvmrc`](./.nvmrc) file for the version used in this project.

Run `yarn` in the root directory to install the required dependencies for each package:

```sh
yarn
```

> Since the project relies on Yarn workspaces, you cannot use [`npm`](https://github.com/npm/cli) for development without manually migrating.

The [example app](/example/) demonstrates usage of the library. You need to run it to test any changes you make.

It is configured to use the local version of the library, so any changes you make to the library's source code will be reflected in the example app. Changes to the library's JavaScript code will be reflected in the example app without a rebuild, but native code changes will require a rebuild of the example app.

If you want to use Android Studio or Xcode to edit the native code, you can open the `example/android` or `example/ios` directories respectively in those editors. To edit the Objective-C or Swift files, open `example/ios/OndatoSdkReactNativeExample.xcworkspace` in Xcode and find the source files at `Pods > Development Pods > ondato-sdk-react-native`.

To edit the Java or Kotlin files, open `example/android` in Android studio and find the source files at `ondato-sdk-react-native` under `Android`.

You can use various commands from the root directory to work with the project.

To start the packager:

```sh
yarn example start
```

To run the example app on Android:

```sh
yarn example android
```

To run the example app on iOS:

```sh
yarn example ios
```

To confirm that the app is running with the new architecture, you can check the Metro logs for a message like this:

```sh
Running "OndatoSdkReactNativeExample" with {"fabric":true,"initialProps":{"concurrentRoot":true},"rootTag":1}
```

Note the `"fabric":true` and `"concurrentRoot":true` properties.

Make sure your code passes TypeScript:

```sh
yarn typecheck
```

To check for linting errors, run the following:

```sh
yarn lint
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

### Expo config plugin development

Create a separate expo application for testing the plugin on:

```sh
# or wherever you keep your files
cd ~/Projects
npx create-expo-app@latest
# managed expo project is not compatible with native modules,
# so you have to run this command to generate native code,
# altough you won't be needing to edit any of them, because
# CNG (Continuous Native Generation) is used
npx expo prebuild
```

First you will need to install the package inside your expo project:

```sh
cd ~/Projects/ondato-sdk-react-native
yarn prepare
yarn pack
# naming doesn't matter much
mv package.tgz ../osrn-v3.0.9-x.tgz
# app you created previously
cd expo-test-app
yarn add ~/Projects/osrn-v3.0.9-x.tgz
```

To start developing expo plugin, run this script, it will watch plugin code
changes and compile the code to JavaScript:

```sh
cd ~/Projects/ondato-sdk-react-native
yarn expo:build:plugin
```

Add the path to expo plugin in your app config file, that you can find in an
expo project:

```sh
cd ~/Projects/expo-test-app
# app.json or app.config.js
vim app.json
```

add this entry:

```json
"plugins": [
  // ...
  "../ondato-sdk-react-native-gitlab/app.plugin.js"
],
```

After each change to the plugin code, don't forget to run `npx expo prebuild`, so
that the changes would be applied to native files:

```sh
# set EXPO_DEBUG=1, if you want to get verbose output
EXPO_DEBUG=0 npx expo prebuild --clean --no-install
yarn android
# or
yarn ios
```

Plugin code is inside `./plugin` directory.

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module.
- `test`: adding or updating tests, e.g. add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Publishing to npm

We use [release-it](https://github.com/release-it/release-it) to make it easier to publish new versions. It handles common tasks like bumping version based on semver, creating tags and releases etc.

To publish new versions, run the following:

```sh
yarn release
```

### Scripts

The `package.json` file contains various scripts for common tasks:

- `yarn`: setup project by installing dependencies.
- `yarn typecheck`: type-check files with TypeScript.
- `yarn lint`: lint files with [ESLint](https://eslint.org/).
- `yarn test`: run unit tests with [Jest](https://jestjs.io/).
- `yarn example start`: start the Metro server for the example app.
- `yarn example android`: run the example app on Android.
- `yarn example ios`: run the example app on iOS.

### Sending a pull request

> **Working on your first pull request?** You can learn how from this _free_ series: [How to Contribute to an Open Source Project on GitHub](https://app.egghead.io/playlists/how-to-contribute-to-an-open-source-project-on-github).

When you're sending a pull request:

- Prefer small pull requests focused on one change.
- Verify that linters and tests are passing.
- Review the documentation to make sure it looks good.
- Follow the pull request template when opening a pull request.
- For pull requests that change the API or implementation, discuss with maintainers first by opening an issue.
