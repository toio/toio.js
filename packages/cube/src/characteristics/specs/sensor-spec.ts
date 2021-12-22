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
  data: {
    isSloped: boolean
    isCollisionDetected: boolean
    isDoubleTapped: boolean
    orientation: number
    shakeLevel: number
  }
  dataType: 'sensor:detection'
}

/**
 * @hidden
 */
export class SensorSpec {
  public parse(buffer: Buffer): DataType {
    if (buffer.byteLength < 3) {
      throw new Error('parse error')
    }

    const type = buffer.readUInt8(0)
    if (type !== 1) {
      throw new Error('parse error')
    }

    const isSloped = buffer.readUInt8(1) === 0
    const isCollisionDetected = buffer.readUInt8(2) === 1
    const isDoubleTapped = buffer.readUInt8(3) === 1
    const orientation = buffer.readUInt8(4)
    const shakeLevel = buffer.byteLength > 5 ? buffer.readUInt8(5) : 0

    return {
      buffer: buffer,
      data: {
        isSloped: isSloped,
        isCollisionDetected: isCollisionDetected,
        isDoubleTapped: isDoubleTapped,
        orientation: orientation,
        shakeLevel: shakeLevel,
      },
      dataType: 'sensor:detection',
    }
  }
}
