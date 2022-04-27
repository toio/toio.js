/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clamp } from '../../util/clamp'
import { createTagHandler } from '../../util/tag'

/**
 * @hidden
 */
export type MotorResponse =
  | {
      buffer: Buffer
      data: {
        operationId: number
        reason: number
      }
      dataType: 'motor:moveTo-response'
    }
  | {
      buffer: Buffer
      data: {
        left: number
        right: number
      }
      dataType: 'motor:speed-feedback'
    }

/**
 * @hidden
 */
export interface MoveType {
  buffer: Uint8Array
  data: { left: number; right: number; durationMs: number }
}

export interface MoveToTarget {
  x?: number
  y?: number
  angle?: number
  rotateType?: number
}

export interface MoveToOptions {
  moveType: number
  maxSpeed: number
  speedType: number
  timeout: number
  overwrite: boolean
}

/**
 * @hidden
 */
export interface MoveToType {
  buffer: Uint8Array
  data: { targets: MoveToTarget[]; options: MoveToOptions & { operationId: number } }
}

/**
 * @hidden
 */
export interface AccelerationMoveType {
  buffer: Uint8Array
  data: { straightSpeed: number; rotationSpeed: number; acceleration: number; priorityType: number; durationMs: number }
}

/**
 * @hidden
 */
export class MotorSpec {
  constructor(private tag = createTagHandler()) {}

  public static MAX_SPEED = 115
  public static MAX_ROTATION = 0x7fff
  public static NUMBER_OF_TARGETS_PER_OPERATION = 29 // should be in [0, 29]
  public static ACC_PRIORITY_STRAIGHT = 0
  public static ACC_PRIORITY_ROTATION = 1

  public parse(buffer: Buffer): MotorResponse {
    if (buffer.byteLength !== 3) {
      throw new Error('parse error')
    }

    const type = buffer.readUInt8(0)
    switch (type) {
      case 0x83:
      case 0x84:
        return {
          buffer: buffer,
          data: {
            operationId: buffer.readUInt8(1),
            reason: buffer.readUInt8(2),
          },
          dataType: 'motor:moveTo-response',
        }
      case 0xe0:
        return {
          buffer: buffer,
          data: {
            left: buffer.readUInt8(1),
            right: buffer.readUInt8(2),
          },
          dataType: 'motor:speed-feedback',
        }
    }

    throw new Error('parse error')
  }

  public move(left: number, right: number, durationMs = 0): MoveType {
    const lSign = left > 0 ? 1 : -1
    const rSign = right > 0 ? 1 : -1
    const lDirection = left > 0 ? 1 : 2
    const rDirection = right > 0 ? 1 : 2
    const lPower = Math.min(Math.abs(left), MotorSpec.MAX_SPEED)
    const rPower = Math.min(Math.abs(right), MotorSpec.MAX_SPEED)
    const duration = clamp(durationMs / 10, 0, 255)

    return {
      buffer: Buffer.from([2, 1, lDirection, lPower, 2, rDirection, rPower, duration]),
      data: {
        left: lSign * lPower,
        right: rSign * rPower,
        durationMs: duration * 10,
      },
    }
  }

  public moveTo(targets: MoveToTarget[], options: MoveToOptions): MoveToType {
    const operationId = this.tag.next()
    const numTargets = Math.min(targets.length, MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION)
    const buffer = Buffer.alloc(8 + 6 * numTargets)
    buffer.writeUInt8(4, 0) // control type
    buffer.writeUInt8(operationId, 1)
    buffer.writeUInt8(options.timeout, 2)
    buffer.writeUInt8(options.moveType, 3)
    buffer.writeUInt8(options.maxSpeed, 4)
    buffer.writeUInt8(options.speedType, 5)
    buffer.writeUInt8(0, 6) // reserved
    buffer.writeUInt8(options.overwrite ? 0 : 1, 7) // reserved

    for (let i = 0; i < numTargets; i++) {
      const target = targets[i]

      // When coordinates are not defined, they are not changed.
      const x = target.x ?? 0xffff
      const y = target.y ?? 0xffff

      // When angle is not defined, rotateType should be 0x05 or 0x06.
      const angle = clamp(target.angle ?? 0, 0, 0x1fff)
      let rotateType = target.rotateType ?? 0x00
      if (target.angle === undefined && target.rotateType !== 0x06) {
        rotateType = 0x05
      }

      buffer.writeUInt16LE(x, 8 + 6 * i)
      buffer.writeUInt16LE(y, 10 + 6 * i)
      buffer.writeUInt16LE((rotateType << 13) | angle, 12 + 6 * i)
    }

    return {
      buffer: Buffer.from(buffer),
      data: {
        targets: targets.slice(0, numTargets),
        options: { ...options, operationId: operationId },
      },
    }
  }

  public accelerationMove(
    translationSpeed: number,
    rotationSpeed: number,
    acceleration = 0,
    priorityType = MotorSpec.ACC_PRIORITY_STRAIGHT,
    durationMs = 0,
  ): AccelerationMoveType {
    const tSign = translationSpeed > 0 ? 1 : -1
    const rSign = rotationSpeed > 0 ? 1 : -1
    const tDirection = translationSpeed > 0 ? 0 : 1
    const rDirection = rotationSpeed > 0 ? 0 : 1
    const sPower = Math.min(Math.abs(translationSpeed), MotorSpec.MAX_SPEED)
    const rPower = Math.min(Math.abs(rotationSpeed), MotorSpec.MAX_ROTATION)
    const rPowerLo = rPower & 0x00ff
    const rPowerHi = (rPower & 0xff00) >> 8
    const acc = Math.min(Math.abs(acceleration), 0xff)
    const duration = clamp(durationMs / 10, 0, 0xff)
    const pri = priorityType == MotorSpec.ACC_PRIORITY_STRAIGHT ? 0 : 1

    return {
      buffer: Buffer.from([5, sPower, acc, rPowerLo, rPowerHi, rDirection, tDirection, pri, duration]),
      data: {
        straightSpeed: tSign * sPower,
        rotationSpeed: rSign * rPower,
        acceleration: acc,
        priorityType: pri,
        durationMs: duration * 10,
      },
    }
  }
}
