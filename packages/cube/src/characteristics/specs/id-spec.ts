/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { StandardId } from './standard-id'

/**
 * @hidden
 */
export type DataType =
  | {
      buffer: Uint8Array
      data: PositionIdInfo
      dataType: 'id:position-id'
    }
  | {
      buffer: Uint8Array
      data: StandardIdInfo
      dataType: 'id:standard-id'
    }
  | {
      buffer: Uint8Array
      dataType: 'id:position-id-missed'
    }
  | {
      buffer: Uint8Array
      dataType: 'id:standard-id-missed'
    }

export interface PositionIdInfo {
  /**
   * X coordinate of Cube's center
   */
  x: number

  /**
   * Y coordinate of Cube's center
   */
  y: number

  /**
   * Angle in degree, [0, 360].
   */
  angle: number

  /**
   * X coordinate of Cube's sensor
   */
  sensorX: number

  /**
   * Y coordinate of Cube's sensor
   */
  sensorY: number
}

export interface StandardIdInfo {
  /**
   * Detected standard id
   */
  standardId: StandardId

  /**
   * Angle in degree, [0, 360].
   */
  angle: number
}

/**
 * @hidden
 */
export class IdSpec {
  public parse(buffer: Buffer): DataType {
    if (buffer.byteLength < 1) {
      throw new Error('parse error')
    }

    const type = buffer.readUInt8(0)

    switch (type) {
      case 1:
        if (buffer.byteLength < 11) {
          break
        }

        return {
          buffer: buffer,
          data: {
            x: buffer.readUInt16LE(1),
            y: buffer.readUInt16LE(3),
            angle: buffer.readUInt16LE(5),
            sensorX: buffer.readUInt16LE(7),
            sensorY: buffer.readUInt16LE(9),
          },
          dataType: 'id:position-id',
        }

      case 2:
        if (buffer.byteLength < 7) {
          break
        }

        return {
          buffer: buffer,
          data: {
            standardId: buffer.readUInt32LE(1),
            angle: buffer.readUInt16LE(5),
          },
          dataType: 'id:standard-id',
        }

      case 3:
        return { buffer: buffer, dataType: 'id:position-id-missed' }

      case 4:
        return { buffer: buffer, dataType: 'id:standard-id-missed' }

      default:
        break
    }

    // error
    throw new Error('parse error')
  }
}
