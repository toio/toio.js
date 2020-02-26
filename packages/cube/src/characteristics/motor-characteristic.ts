/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Characteristic } from '@abandonware/noble'
import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from 'noble-mac'
import semver from 'semver'
import { MotorSpec, MoveToTarget, MoveToOptions, MotorResponse } from './specs/motor-spec'

/**
 * internal event
 *
 * @hidden
 */
interface Event {
  'motor:response': (operationId: number, reason: number) => void
}

/**
 * @hidden
 */
export class MotorCharacteristic {
  public static readonly UUID = '10b201025b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly spec = new MotorSpec()

  private readonly eventEmitter: TypedEmitter<Event> = new EventEmitter() as TypedEmitter<Event>

  private bleProtocolVersion?: string

  private timer: NodeJS.Timer | null = null

  private pendingResolve: (() => void) | null = null

  public constructor(characteristic: Characteristic) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
      this.characteristic.subscribe()
    }
  }

  public init(bleProtocolVersion: string): void {
    this.bleProtocolVersion = bleProtocolVersion
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
    this.characteristic.write(Buffer.from(data.buffer), true)

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

  public moveTo(targets: MoveToTarget[], options: MoveToOptions): Promise<void> {
    if (this.bleProtocolVersion !== undefined && semver.lt(this.bleProtocolVersion, '2.1.0')) {
      return Promise.resolve()
    }

    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.pendingResolve) {
      this.pendingResolve()
      this.pendingResolve = null
    }

    // create pending promise for given targets and options
    const createPendingPromise = (targets: MoveToTarget[], options: MoveToOptions) => () => {
      return new Promise<void>((resolve, reject) => {
        const data = this.spec.moveTo(targets, options)
        const handleResponse = (operationId: number, reason: number): void => {
          if (operationId === data.data.options.operationId) {
            this.eventEmitter.removeListener('motor:response', handleResponse)
            if (reason === 0 || reason === 5) {
              resolve()
            } else {
              reject(reason)
            }
          }
        }
        this.characteristic.write(Buffer.from(data.buffer), true)
        this.eventEmitter.on('motor:response', handleResponse)
      })
    }

    const promises = targets.reduce<Promise<void>[]>(
      (acc, _target, index) => {
        if (index % MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION === 0) {
          const which = (index / MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION) % 2
          // Except for the first one, operation should not overwrite
          acc[which] = acc[which].then(
            createPendingPromise(
              targets.slice(index, index + MotorSpec.NUMBER_OF_TARGETS_PER_OPERATION),
              index === 0
                ? options
                : {
                    ...options,
                    overwrite: false,
                  },
            ),
          )
        }
        return acc
      },
      [Promise.resolve(), Promise.resolve()],
    )

    return new Promise((resolve, reject) => {
      Promise.all(promises)
        .then(() => {
          resolve()
        })
        .catch(reject)
    })
  }

  public stop(): void {
    this.move(0, 0, 0)
  }

  private onData(data: Buffer): void {
    try {
      const ret: MotorResponse = this.spec.parse(data)
      this.eventEmitter.emit('motor:response', ret.data.operationId, ret.data.reason)
    } catch (e) {
      return
    }
  }
}
