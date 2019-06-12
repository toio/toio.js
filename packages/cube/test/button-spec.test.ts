/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ButtonSpec } from '../src/characteristics/specs/button-spec'

describe('button spec', () => {
  const spec = new ButtonSpec()

  test('parse button event correctly', () => {
    const input = Buffer.from([0x01, 0x80])
    const output = spec.parse(input)

    expect(output.buffer).toEqual(input)
    expect(output.dataType).toEqual('button:press')
    expect(output.data).toEqual({
      id: 1,
      pressed: true,
    })
  })
})
