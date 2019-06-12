/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clamp } from '../../util'

export interface LightOperation {
  /**
   * duration in millisecond. [0, 2550]
   */
  durationMs: number

  /**
   * Value of red, [0, 255].
   */
  red: number

  /**
   * Value of green, [0, 255].
   */
  green: number

  /**
   * Value of blue, [0, 255].
   */
  blue: number
}

/**
 * @hidden
 */
export interface TurnOnLightType {
  buffer: Uint8Array
  data: LightOperation
}

/**
 * @hidden
 */
export interface TurnOnLightWithScenarioType {
  buffer: Uint8Array
  data: {
    operations: LightOperation[]
    repeatCount: number
    totalDurationMs: number
  }
}

/**
 * @hidden
 */
export interface TurnOffLightType {
  buffer: Uint8Array
}

/**
 * @hidden
 */
export class LightSpec {
  public turnOnLight(operation: LightOperation): TurnOnLightType {
    const duration = clamp(operation.durationMs / 10, 0, 255)
    const red = clamp(operation.red, 0, 255)
    const green = clamp(operation.green, 0, 255)
    const blue = clamp(operation.blue, 0, 255)
    return {
      buffer: Buffer.from([3, duration, 1, 1, red, green, blue]),
      data: {
        durationMs: duration * 10,
        red: red,
        green: green,
        blue: blue,
      },
    }
  }

  public turnOnLightWithScenario(operations: LightOperation[], repeatCount: number): TurnOnLightWithScenarioType {
    const arrangedData: TurnOnLightWithScenarioType['data'] = {
      operations: [],
      repeatCount: clamp(repeatCount, 0, 255),
      totalDurationMs: 0,
    }

    const numOperations = Math.min(operations.length, 29)

    const buffer = Buffer.alloc(3 + 6 * numOperations)
    buffer.writeUInt8(4, 0) // control type
    buffer.writeUInt8(arrangedData.repeatCount, 1)
    buffer.writeUInt8(numOperations, 2)

    let totalDurationMs = 0
    for (let i = 0; i < numOperations; i++) {
      const operation = operations[i]
      const duration = clamp(operation.durationMs / 10, 1, 255)
      const red = clamp(operation.red, 0, 255)
      const green = clamp(operation.green, 0, 255)
      const blue = clamp(operation.blue, 0, 255)

      // build arranged data
      totalDurationMs += duration
      arrangedData.operations.push({
        durationMs: duration * 10,
        red: red,
        green: green,
        blue: blue,
      })

      // build buffer
      buffer.writeUInt8(duration, 3 + 6 * i)
      buffer.writeUInt8(1, 4 + 6 * i) // number of Lights
      buffer.writeUInt8(1, 5 + 6 * i) // index of Light
      buffer.writeUInt8(red, 6 + 6 * i)
      buffer.writeUInt8(green, 7 + 6 * i)
      buffer.writeUInt8(blue, 8 + 6 * i)
    }

    arrangedData.totalDurationMs = totalDurationMs * 10 * arrangedData.repeatCount

    return {
      buffer: buffer,
      data: arrangedData,
    }
  }

  public turnOffLight(): TurnOffLightType {
    return {
      buffer: Buffer.from([1]),
    }
  }
}
