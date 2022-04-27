/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SensorSpec } from '../src/characteristics/specs/sensor-spec'

describe('sensor spec', () => {
  const spec = new SensorSpec()

  test('parse sensor event correctly', () => {
    const input = Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('sensor:motion')
    expect(output.data).toEqual({
      isSloped: true,
      isCollisionDetected: false,
      isDoubleTapped: false,
      orientation: 0,
      shakeLevel: 0,
    })
  })
})
