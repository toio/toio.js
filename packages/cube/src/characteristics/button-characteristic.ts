/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from '@abandonware/noble'
import { DataType, ButtonSpec } from './specs/button-spec'

/**
 * @hidden
 */
export interface Event {
  'button:press': (data: { pressed: boolean }) => void
}

/**
 * @hidden
 */
export class ButtonCharacteristic {
  public static readonly UUID = '10b201075b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly eventEmitter: TypedEmitter<Event>

  private readonly spec: ButtonSpec = new ButtonSpec()

  public constructor(characteristic: Characteristic, eventEmitter: EventEmitter) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
      this.characteristic.subscribe()
    }

    this.eventEmitter = eventEmitter as TypedEmitter<Event>
  }

  public getButtonStatus(): Promise<{ pressed: boolean }> {
    return this.read().then(data => {
      return { pressed: data.data.pressed }
    })
  }

  private read(): Promise<DataType> {
    return new Promise((resolve, reject) => {
      this.characteristic.read((error, data) => {
        if (error) {
          reject(error)
          return
        }

        if (!data) {
          reject('cannot read any data from characteristic')
          return
        }

        try {
          const parsedData = this.spec.parse(data)
          resolve(parsedData)
          return
        } catch (e) {
          reject(e)
          return
        }
      })
    })
  }

  private onData(data: Buffer): void {
    try {
      const parsedData = this.spec.parse(data)
      this.eventEmitter.emit('button:press', { pressed: parsedData.data.pressed })
    } catch (e) {
      return
    }
  }
}
