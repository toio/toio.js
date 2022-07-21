/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { clamp } from '../util/clamp'
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

  public setFlatThreshold(degree: number): void {
    const deg = clamp(degree, 1, 45)
    this.characteristic.write(Buffer.from([0x05, 0x00, deg]), false)
  }

  public setCollisionThreshold(threshold: number): void {
    const th = clamp(threshold, 1, 10)
    this.characteristic.write(Buffer.from([0x06, 0x00, th]), false)
  }

  public setDoubleTapIntervalThreshold(threshold: number): void {
    const th = clamp(threshold, 0, 7)
    this.characteristic.write(Buffer.from([0x17, 0x00, th]), false)
  }

  public setIdNotification(intervalMs: number, notificationType: number): void {
    const interval = clamp(intervalMs / 10, 0, 0xff)
    const type = clamp(notificationType, 0, 0xff)
    this.characteristic.write(Buffer.from([0x18, 0x00, interval, type]), false)
  }

  public setIdMissedNotification(sensitivityMs: number): void {
    const sensitivity = clamp(sensitivityMs / 10, 0, 0xff)
    this.characteristic.write(Buffer.from([0x19, 0x00, sensitivity]), false)
  }

  public setMotorSpeedFeedback(enable: boolean): void {
    const en = enable ? 1 : 0
    this.characteristic.write(Buffer.from([0x1c, 0x00, en]), false)
  }

  public setMagnetDetection(detectType: number, intervalMs: number, notificationType: number): void {
    const detect = clamp(detectType, 0, 2)
    const interval = clamp(intervalMs / 20, 1, 0xff)
    const notification = clamp(notificationType, 0, 1)

    this.characteristic.write(Buffer.from([0x1b, 0x00, detect, interval, notification]), false)
  }

  public setAttitudeControl(format: number, intervalMs: number, notificationType: number): void {
    const fmt = clamp(format, 1, 2)
    const interval = clamp(intervalMs / 10, 0, 0xff)
    const type = clamp(notificationType, 0, 1)

    this.characteristic.write(Buffer.from([0x1d, 0x00, fmt, interval, type]), false)
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
