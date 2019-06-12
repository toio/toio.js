/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Characteristic } from 'noble-mac'
import { MotorSpec } from './specs/motor-spec'

/**
 * @hidden
 */
export class MotorCharacteristic {
  public static readonly UUID = '10b201025b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly spec = new MotorSpec()

  private timer: NodeJS.Timer | null = null

  private pendingResolve: (() => void) | null = null

  public constructor(characteristic: Characteristic) {
    this.characteristic = characteristic
  }

  public move(left: number, right: number, durationMs: number): Promise<void> | void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.move(left, right, durationMs)
    this.characteristic.write(Buffer.from(data.buffer), false)

    if (data.data.durationMs > 0) {
      return new Promise(resolve => {
        this.pendingResolve = resolve
        this.timer = setTimeout(() => {
          if (this.pendingResolve) {
            this.pendingResolve()
            this.pendingResolve = null
          }
        }, data.data.durationMs)
      })
    }
  }

  public stop(): void {
    this.move(0, 0, 0)
  }
}
