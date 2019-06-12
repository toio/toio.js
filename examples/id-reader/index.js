/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

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

main()
