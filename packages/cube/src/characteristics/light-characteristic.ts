/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Characteristic } from '@abandonware/noble'
import { LightSpec, LightOperation } from './specs/light-spec'

/**
 * @hidden
 */
export class LightCharacteristic {
  public static readonly UUID = '10b201035b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly spec = new LightSpec()

  private timer: NodeJS.Timer | null = null

  private pendingResolve: (() => void) | null = null

  public constructor(characteristic: Characteristic) {
    this.characteristic = characteristic
  }

  public turnOnLight(operation: LightOperation): Promise<void> | void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.turnOnLight(operation)
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

  public turnOnLightWithScenario(operations: LightOperation[], repeatCount: number = 0): Promise<void> | void {
    if (!operations || operations.length === 0) {
      return Promise.reject('invalid argument: empty operation')
    }

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.turnOnLightWithScenario(operations, repeatCount)
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

  public turnOffLight(): void {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    const data = this.spec.turnOffLight()
    this.characteristic.write(Buffer.from(data.buffer), false)
  }
}
