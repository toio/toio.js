/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @hidden
 */
export interface DataType {
  buffer: Uint8Array
  data: { id: number; pressed: boolean }
  dataType: 'button:press'
}

/**
 * @hidden
 */
export class ButtonSpec {
  public parse(buffer: Buffer): DataType {
    if (buffer.byteLength < 2) {
      throw new Error('parse error')
    }

    const id = buffer.readUInt8(0)
    if (id !== 1) {
      throw new Error('parse error')
    }

    const pressed = buffer.readUInt8(1) !== 0

    return {
      buffer: buffer,
      data: {
        id: id,
        pressed: pressed,
      },
      dataType: 'button:press',
    }
  }
}
