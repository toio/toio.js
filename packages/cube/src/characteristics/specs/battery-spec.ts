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
  data: { level: number }
  dataType: 'battery:battery'
}

/**
 * @hidden
 */
export class BatterySpec {
  public parse(buffer: Buffer): DataType {
    if (buffer.byteLength < 1) {
      throw new Error('parse error')
    }

    const level = buffer.readUInt8(0)
    return {
      buffer: buffer,
      data: {
        level: level,
      },
      dataType: 'battery:battery',
    }
  }
}
