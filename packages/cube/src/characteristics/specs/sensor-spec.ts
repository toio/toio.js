/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @hidden
 */
export type DataType =
  | {
      buffer: Uint8Array
      data: {
        isSloped: boolean
        isCollisionDetected: boolean
        isDoubleTapped: boolean
        orientation: number
        shakeLevel: number
      }
      dataType: 'sensor:motion'
    }
  | {
      buffer: Uint8Array
      data: {
        magnetId: number
      }
      dataType: 'sensor:magnet'
    }
  | {
      buffer: Uint8Array
      data: {
        roll: number
        pitch: number
        yaw: number
      }
      dataType: 'sensor:attitude-euler'
    }
  | {
      buffer: Uint8Array
      data: {
        w: number
        x: number
        y: number
        z: number
      }
      dataType: 'sensor:attitude-quaternion'
    }

/**
 * @hidden
 */
export class SensorSpec {
  public parse(buffer: Buffer): DataType {
    const type = buffer.readUInt8(0)
    switch (type) {
      case 0x01:
        if (buffer.byteLength < 3) {
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
          dataType: 'sensor:motion',
        }
      case 0x02:
        const id = buffer.readUInt8(1)
        return {
          buffer: buffer,
          data: {
            magnetId: id,
          },
          dataType: 'sensor:magnet',
        }
      case 0x03:
        const format = buffer.readUInt8(1)
        if (format === 1) {
          const roll = buffer.readInt16LE(2)
          const pitch = buffer.readInt16LE(4)
          const yaw = buffer.readInt16LE(6)
          return {
            buffer: buffer,
            data: { roll: roll, pitch: pitch, yaw: yaw },
            dataType: 'sensor:attitude-euler',
          }
        } else if (format === 2) {
          const w = buffer.readInt16LE(2) / 10000
          const x = buffer.readInt16LE(4) / 10000
          const y = buffer.readInt16LE(6) / 10000
          const z = buffer.readInt16LE(8) / 10000
          return {
            buffer: buffer,
            data: { w: w, x: x, y: y, z: z },
            dataType: 'sensor:attitude-quaternion',
          }
        }
    }
    throw new Error('parse error')
  }
}
