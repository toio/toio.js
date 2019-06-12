/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { BatterySpec } from '../src/characteristics/specs/battery-spec'

describe('battery spec', () => {
  const spec = new BatterySpec()

  test('parse battery event correctly', () => {
    const input = Buffer.from([0x50])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('battery:battery')
    expect(output.data).toEqual({
      level: 80,
    })
  })
})
