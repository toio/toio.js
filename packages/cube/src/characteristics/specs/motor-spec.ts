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
export interface MotorResponse {
  buffer: Buffer
  data: {
    operationId: number
    reason: number
  }
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
export class MotorSpec {
  constructor(private tag = createTagHandler()) {}

  public static MAX_SPEED = 115
  public static NUMBER_OF_TARGETS_PER_OPERATION = 29 // should be in [0, 29]

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
      const x = target.x ?? 0xffff
      const y = target.y ?? 0xffff
      const angle = target.angle === undefined ? 0xa000 : (target.rotateType ?? 0x03) << 13 | target.angle
      buffer.writeUInt16LE(x, 8 + 6 * i)
      buffer.writeUInt16LE(y, 10 + 6 * i)
      buffer.writeUInt16LE(angle, 12 + 6 * i)
    }

    return {
      buffer: Buffer.from(buffer),
      data: {
        targets: targets.slice(0, numTargets),
        options: { ...options, operationId: operationId },
      },
    }
  }
}
