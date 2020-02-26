/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from '@abandonware/noble'

/**
 * @hidden
 */
interface Event {
  'configuration:ble-protocol-version': (version: string) => void
}

/**
 * @hidden
 */
export class ConfigurationCharacteristic {
  public static readonly UUID = '10b201ff5b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly eventEmitter: TypedEmitter<Event> = new EventEmitter() as TypedEmitter<Event>

  private bleProtocolVersion?: string

  public constructor(characteristic: Characteristic) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
    }
  }

  public init(bleProtocolVersion: string): void {
    this.bleProtocolVersion = bleProtocolVersion
  }

  public getBLEProtocolVersion(): Promise<string> {
    if (this.bleProtocolVersion !== undefined) {
      return Promise.resolve(this.bleProtocolVersion)
    } else {
      return new Promise<string>((resolve, reject) => {
        this.characteristic.subscribe(error => {
          if (error) {
            reject(error)
          } else {
            this.characteristic.write(Buffer.from([0x01, 0x00]), false)
            this.eventEmitter.once('configuration:ble-protocol-version', version => {
              this.characteristic.unsubscribe()
              this.bleProtocolVersion = version
              resolve(version)
            })
          }
        })
      })
    }
  }

  public setCollisionThreshold(threshold: number): void {
    this.characteristic.write(Buffer.from([0x06, 0x00, threshold]), false)
  }

  private data2result(data: Buffer): void {
    const type = data.readUInt8(0)
    if (type === 0x81) {
      const version = data.toString('utf-8', 2, 7)
      this.eventEmitter.emit('configuration:ble-protocol-version', version)
      return
    }
  }

  private onData(data: Buffer): void {
    this.data2result(data)
  }
}
