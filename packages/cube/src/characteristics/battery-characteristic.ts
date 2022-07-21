/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from '@abandonware/noble'
import { BatterySpec, DataType } from './specs/battery-spec'

/**
 * @hidden
 */
export interface Event {
  'battery:battery': (info: { level: number }) => void
}

/**
 * @hidden
 */
export class BatteryCharacteristic {
  public static readonly UUID = '10b201085b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly eventEmitter: TypedEmitter<Event>

  private readonly spec: BatterySpec = new BatterySpec()

  public constructor(characteristic: Characteristic, eventEmitter: EventEmitter) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
      this.characteristic.subscribe()
    }

    this.eventEmitter = eventEmitter as TypedEmitter<Event>
  }

  public getBatteryStatus(): Promise<{ level: number }> {
    return this.read().then(data => {
      return data.data
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
      this.eventEmitter.emit('battery:battery', parsedData.data)
    } catch (e) {
      return
    }
  }
}
