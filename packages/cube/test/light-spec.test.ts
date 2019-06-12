/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LightSpec } from '../src/characteristics/specs/light-spec'

describe('light spec', () => {
  const spec = new LightSpec()

  test('build buffer to write turn light on operation', () => {
    const inputDuration = 160
    const inputRed = 255
    const inputGreen = 0
    const inputBlue = 0
    const data = spec.turnOnLight({
      durationMs: inputDuration,
      red: inputRed,
      green: inputGreen,
      blue: inputBlue,
    })

    expect(data.buffer).toEqual(Buffer.from([0x03, 0x10, 0x01, 0x01, 0xff, 0x00, 0x00]))
    expect(data.data).toEqual({
      durationMs: inputDuration,
      red: inputRed,
      green: inputGreen,
      blue: inputBlue,
    })
  })

  test('build buffer to write turn light on with scenario operation', () => {
    const inputDuration = [300, 300]
    const inputRed = [0, 0]
    const inputGreen = [255, 0]
    const inputBlue = [0, 255]
    const inputRepeatCount = 2

    const data = spec.turnOnLightWithScenario(
      [
        {
          durationMs: inputDuration[0],
          red: inputRed[0],
          green: inputGreen[0],
          blue: inputBlue[0],
        },
        {
          durationMs: inputDuration[1],
          red: inputRed[1],
          green: inputGreen[1],
          blue: inputBlue[1],
        },
      ],
      inputRepeatCount,
    )

    expect(data.buffer).toEqual(
      Buffer.from([0x04, 0x02, 0x02, 0x1e, 0x01, 0x01, 0x00, 0xff, 0x00, 0x1e, 0x01, 0x01, 0x00, 0x00, 0xff]),
    )
    expect(data.data.operations).toEqual([
      {
        durationMs: inputDuration[0],
        red: inputRed[0],
        green: inputGreen[0],
        blue: inputBlue[0],
      },
      {
        durationMs: inputDuration[1],
        red: inputRed[1],
        green: inputGreen[1],
        blue: inputBlue[1],
      },
    ])
    expect(data.data.repeatCount).toEqual(inputRepeatCount)
    expect(data.data.totalDurationMs).toEqual((300 + 300) * 2)
  })

  test('build buffer to write turn light off operation', () => {
    const data = spec.turnOffLight()

    expect(data.buffer).toEqual(Buffer.from([0x01]))
  })
})
