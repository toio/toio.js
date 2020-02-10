/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clamp } from '../../util/clamp'

export interface SoundOperation {
  /**
   * duration in millisecond. [0, 2550]
   */
  durationMs: number

  /**
   * note name
   */
  noteName: Note
}

// prettier-ignore
export enum Note {
  C0 = 0, CS0,  D0,  DS0,  E0,  F0,  FS0,  G0, GS0, A0, AS0, B0,
  C1,     CS1,  D1,  DS1,  E1,  F1,  FS1,  G1, GS1, A1, AS1, B1,
  C2,     CS2,  D2,  DS2,  E2,  F2,  FS2,  G2, GS2, A2, AS2, B2,
  C3,     CS3,  D3,  DS3,  E3,  F3,  FS3,  G3, GS3, A3, AS3, B3,
  C4,     CS4,  D4,  DS4,  E4,  F4,  FS4,  G4, GS4, A4, AS4, B4,
  C5,     CS5,  D5,  DS5,  E5,  F5,  FS5,  G5, GS5, A5, AS5, B5,
  C6,     CS6,  D6,  DS6,  E6,  F6,  FS6,  G6, GS6, A6, AS6, B6,
  C7,     CS7,  D7,  DS7,  E7,  F7,  FS7,  G7, GS7, A7, AS7, B7,
  C8,     CS8,  D8,  DS8,  E8,  F8,  FS8,  G8, GS8, A8, AS8, B8,
  C9,     CS9,  D9,  DS9,  E9,  F9,  FS9,  G9, GS9, A9, AS9, B9,
  C10,    CS10, D10, DS10, E10, F10, FS10, G10,
  NO_SOUND
}

/**
 * @hidden
 */
export interface PlayPresetSoundType {
  buffer: Uint8Array
  data: {
    soundId: number
  }
}

/**
 * @hidden
 */
export interface PlaySoundType {
  buffer: Uint8Array
  data: {
    operations: SoundOperation[]
    repeatCount: number
    totalDurationMs: number
  }
}

/**
 * @hidden
 */
export interface StopSoundType {
  buffer: Uint8Array
}

/**
 * @hidden
 */
export class SoundSpec {
  public playPresetSound(soundId: number): PlayPresetSoundType {
    const arrangedSoundId = clamp(soundId, 0, 10)
    return {
      buffer: Buffer.from([2, arrangedSoundId, 255]),
      data: {
        soundId: arrangedSoundId,
      },
    }
  }

  public playSound(operations: SoundOperation[], repeatCount: number): PlaySoundType {
    const arrangedData: PlaySoundType['data'] = {
      operations: [],
      repeatCount: clamp(repeatCount, 0, 255),
      totalDurationMs: 0,
    }

    const numOperations = Math.min(operations.length, 59)

    const buffer = Buffer.alloc(3 + 3 * numOperations)
    buffer.writeUInt8(3, 0) // control type
    buffer.writeUInt8(arrangedData.repeatCount, 1)
    buffer.writeUInt8(numOperations, 2)

    let totalDurationMs = 0
    for (let i = 0; i < numOperations; i++) {
      const operation = operations[i]
      const duration = clamp(operation.durationMs / 10, 1, 255)
      const noteName = operation.noteName

      // build arranged data
      totalDurationMs += duration
      arrangedData.operations.push({
        durationMs: duration * 10,
        noteName: noteName,
      })

      // build buffer
      buffer.writeUInt8(duration, 3 + 3 * i) // duration
      buffer.writeUInt8(noteName, 4 + 3 * i) // note name
      buffer.writeUInt8(255, 5 + 3 * i) // loudness
    }

    arrangedData.totalDurationMs = totalDurationMs * 10 * arrangedData.repeatCount

    return {
      buffer: buffer,
      data: arrangedData,
    }
  }

  public stopSound(): StopSoundType {
    return {
      buffer: Buffer.from([1]),
    }
  }
}
