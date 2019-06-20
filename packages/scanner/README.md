# @toio/scanner

a npm package for scanning toio&trade;Core Cube.

- [@toio/scanner | API reference document](https://toio.github.io/toio.js/modules/_toio_scanner.html)
- [toio&trade;Core Cube BLE technical specification](https://toio.github.io/toio-spec/)

## How to install

```
npm install @toio/scanner
```

## How to use

```js
const { NearestScanner } = require('@toio/scanner')

async function main() {
  // start a scanner to find the nearest cube
  const cube = await new NearestScanner().start()

  // connect to the cube
  cube.connect()

  // set listeners to show toio ID information
  cube
    .on('id:position-id', data => console.log('[POS ID]', data))
    .on('id:standard-id', data => console.log('[STD ID]', data))
    .on('id:position-id-missed', () => console.log('[POS ID MISSED]'))
    .on('id:standard-id-missed', () => console.log('[STD ID MISSED]'))
}
```

## Prerequisites & Verified Environment

see [here](https://github.com/toio/toio.js/blob/master/README.md).
