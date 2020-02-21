/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Characteristic } from '@abandonware/noble'
import { SoundOperation, SoundSpec } from './specs/sound-spec'

/**
 * @hidden
 */
export class SoundCharacteristic {
  public static readonly UUID = '10b201045b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly spec = new SoundSpec()

  private timer: NodeJS.Timer | null = null

  private pendingResolve: (() => void) | null = null

  public constructor(characteristic: Characteristic) {
    this.characteristic = characteristic
  }

  public playPresetSound(soundId: number): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.playPresetSound(soundId)
    this.characteristic.write(Buffer.from(data.buffer), false)
  }

  public playSound(operations: SoundOperation[], repeatCount: number = 0): Promise<void> | void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.playSound(operations, repeatCount)
    this.characteristic.write(Buffer.from(data.buffer), false)

    if (data.data.totalDurationMs > 0) {
      return new Promise(resolve => {
        this.pendingResolve = resolve
        this.timer = setTimeout(() => {
          if (this.pendingResolve) {
            this.pendingResolve()
            this.pendingResolve = null
          }
        }, data.data.totalDurationMs)
      })
    }
  }

  public stopSound(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.stopSound()
    this.characteristic.write(Buffer.from(data.buffer), false)
  }
}
