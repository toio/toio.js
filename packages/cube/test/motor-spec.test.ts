/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { MotorSpec } from '../src/characteristics/specs/motor-spec'

describe('motor spec', () => {
  const spec = new MotorSpec()

  test('build buffer to write move operation', () => {
    const inputLeft = 100
    const inputRight = -20
    const data = spec.move(inputLeft, inputRight)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x01, 0x01, 0x64, 0x02, 0x02, 0x14, 0x00]))
    expect(data.data).toEqual({
      left: inputLeft,
      right: inputRight,
      durationMs: 0,
    })
  })

  test('build buffer to write move operation with duration', () => {
    const inputLeft = 100
    const inputRight = -20
    const inputDuration = 100
    const data = spec.move(inputLeft, inputRight, inputDuration)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x01, 0x01, 0x64, 0x02, 0x02, 0x14, 0x0a]))
    expect(data.data).toEqual({
      left: inputLeft,
      right: inputRight,
      durationMs: inputDuration,
    })
  })

  test('build buffer to write move operation with out of range parameter', () => {
    const inputLeft = -500
    const inputRight = 500
    const inputDuration = 3000
    const data = spec.move(inputLeft, inputRight, inputDuration)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x01, 0x02, 0x64, 0x02, 0x01, 0x64, 0xff]))
    expect(data.data).toEqual({
      left: -100,
      right: 100,
      durationMs: 2550,
    })
  })
})
