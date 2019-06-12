/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { IdSpec } from '../src/characteristics/specs/id-spec'

describe('id spec', () => {
  const spec = new IdSpec()

  test('parse position-id event correctly', () => {
    const input = Buffer.from([0x01, 0xc5, 0x02, 0x7f, 0x01, 0x32, 0x01, 0xbc, 0x02, 0x82, 0x01, 0x32, 0x01])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('id:position-id')
    if (output.dataType === 'id:position-id') {
      expect(output.data).toEqual({
        x: 709,
        y: 383,
        angle: 306,
        sensorX: 700,
        sensorY: 386,
      })
    }
  })

  test('parse standard-id event correctly', () => {
    const input = Buffer.from([0x02, 0x00, 0x00, 0x38, 0x00, 0x15, 0x00])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('id:standard-id')
    if (output.dataType === 'id:standard-id') {
      expect(output.data).toEqual({
        standardId: 3670016,
        angle: 21,
      })
    }
  })

  test('parse position-id-missed event correctly', () => {
    const input = Buffer.from([0x03])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('id:position-id-missed')
  })

  test('parse standard-id-missed event correctly', () => {
    const input = Buffer.from([0x04])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('id:standard-id-missed')
  })
})
