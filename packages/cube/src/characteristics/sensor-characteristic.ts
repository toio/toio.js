/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from '@abandonware/noble'
import { SensorSpec } from './specs/sensor-spec'

/**
 * @hidden
 */
export interface Event {
  'sensor:slope': (data: { isSloped: boolean }) => void
  'sensor:collision': (data: { isCollisionDetected: boolean }) => void
  'sensor:double-tap': () => void
  'sensor:orientation': (data: { orientation: number }) => void
  'sensor:shake': (data: { level: number }) => void
  'sensor:magnet-id': (data: { id: number }) => void
  'sensor:magnet-force': (data: { force: number; directionX: number; directionY: number; directionZ: number }) => void
  'sensor:attitude-euler': (data: { roll: number; pitch: number; yaw: number }) => void
  'sensor:attitude-quaternion': (data: { w: number; x: number; y: number; z: number }) => void
}

/**
 * @hidden
 */
export class SensorCharacteristic {
  public static readonly UUID = '10b201065b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly eventEmitter: TypedEmitter<Event>

  private readonly spec: SensorSpec = new SensorSpec()

  private magnetMode = 0

  private prevMotionStatus: {
    isSloped?: boolean
    isCollisionDetected?: boolean
    orientation?: number
    isDoubleTapped?: boolean
    shakeLevel?: number
  } = {}

  private prevMagnetStatus: {
    id?: number
    force?: number
    directionX?: number
    directionY?: number
    directionZ?: number
  } = {}

  private prevAttitudeEuler: {
    roll?: number
    pitch?: number
    yaw?: number
  } = {}

  private prevAttitudeQuaternion: {
    w?: number
    x?: number
    y?: number
    z?: number
  } = {}

  public constructor(characteristic: Characteristic, eventEmitter: EventEmitter) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
      this.characteristic.subscribe()
    }

    this.eventEmitter = eventEmitter as TypedEmitter<Event>
  }

  public getSlopeStatus(): Promise<{ isSloped: boolean }> {
    return new Promise(resolve => {
      this.prevMotionStatus.isSloped !== undefined
        ? resolve({ isSloped: this.prevMotionStatus.isSloped })
        : resolve({ isSloped: false })
    })
  }

  public getCollisionStatus(): Promise<{ isCollisionDetected: boolean }> {
    return new Promise(resolve => {
      this.prevMotionStatus.isCollisionDetected !== undefined
        ? resolve({ isCollisionDetected: this.prevMotionStatus.isCollisionDetected })
        : resolve({ isCollisionDetected: false })
    })
  }

  public getDoubleTapStatus(): Promise<{ isDoubleTapped: boolean }> {
    return new Promise(resolve => {
      this.prevMotionStatus.isDoubleTapped !== undefined
        ? resolve({ isDoubleTapped: this.prevMotionStatus.isDoubleTapped })
        : resolve({ isDoubleTapped: false })
    })
  }

  public getOrientation(): Promise<{ orientation: number }> {
    return new Promise(resolve => {
      this.prevMotionStatus.orientation !== undefined
        ? resolve({ orientation: this.prevMotionStatus.orientation })
        : resolve({ orientation: 1 })
    })
  }

  public getMagnetId(): Promise<{ id: number }> {
    return new Promise(resolve => {
      this.prevMagnetStatus.id !== undefined ? resolve({ id: this.prevMagnetStatus.id }) : resolve({ id: 0 })
    })
  }

  public getMagnetForce(): Promise<{ force: number; directionX: number; directionY: number; directionZ: number }> {
    return new Promise(resolve => {
      this.prevMagnetStatus.force !== undefined &&
      this.prevMagnetStatus.directionX !== undefined &&
      this.prevMagnetStatus.directionY !== undefined &&
      this.prevMagnetStatus.directionZ !== undefined
        ? resolve({
            force: this.prevMagnetStatus.force,
            directionX: this.prevMagnetStatus.directionX,
            directionY: this.prevMagnetStatus.directionY,
            directionZ: this.prevMagnetStatus.directionZ,
          })
        : resolve({ force: 0, directionX: 0, directionY: 0, directionZ: 0 })
    })
  }

  public getAttitudeEuler(): Promise<{ roll: number; pitch: number; yaw: number }> {
    return new Promise(resolve => {
      this.prevAttitudeEuler.roll !== undefined &&
      this.prevAttitudeEuler.pitch !== undefined &&
      this.prevAttitudeEuler.yaw !== undefined
        ? resolve({
            roll: this.prevAttitudeEuler.roll,
            pitch: this.prevAttitudeEuler.pitch,
            yaw: this.prevAttitudeEuler.yaw,
          })
        : resolve({
            roll: 0,
            pitch: 0,
            yaw: 0,
          })
    })
  }

  public getAttitudeQuaternion(): Promise<{ w: number; x: number; y: number; z: number }> {
    return new Promise(resolve => {
      this.prevAttitudeQuaternion.w !== undefined &&
      this.prevAttitudeQuaternion.x !== undefined &&
      this.prevAttitudeQuaternion.y !== undefined &&
      this.prevAttitudeQuaternion.z !== undefined
        ? resolve({
            w: this.prevAttitudeQuaternion.w,
            x: this.prevAttitudeQuaternion.x,
            y: this.prevAttitudeQuaternion.y,
            z: this.prevAttitudeQuaternion.z,
          })
        : resolve({
            w: 1,
            x: 0,
            y: 0,
            z: 0,
          })
    })
  }

  public notifyMotionStatus(): void {
    this.characteristic.write(Buffer.from([0x81]), false)
  }

  public notifyMagnetStatus(): void {
    this.characteristic.write(Buffer.from([0x82]), false)
  }

  public setMagnetMode(mode: number): void {
    this.magnetMode = mode
  }

  private onData(data: Buffer): void {
    try {
      const parsedData = this.spec.parse(data)
      if (parsedData.dataType === 'sensor:motion') {
        if (this.prevMotionStatus.isSloped !== parsedData.data.isSloped) {
          this.eventEmitter.emit('sensor:slope', { isSloped: parsedData.data.isSloped })
        }
        if (parsedData.data.isCollisionDetected) {
          this.eventEmitter.emit('sensor:collision', { isCollisionDetected: parsedData.data.isCollisionDetected })
        }
        if (parsedData.data.isDoubleTapped) {
          this.eventEmitter.emit('sensor:double-tap')
        }
        if (this.prevMotionStatus.orientation !== parsedData.data.orientation) {
          this.eventEmitter.emit('sensor:orientation', { orientation: parsedData.data.orientation })
        }
        if (this.prevMotionStatus.shakeLevel !== parsedData.data.shakeLevel) {
          this.eventEmitter.emit('sensor:shake', { level: parsedData.data.shakeLevel })
        }
        this.prevMotionStatus = parsedData.data
      }
      if (parsedData.dataType === 'sensor:magnet') {
        if (this.magnetMode === 1) {
          this.eventEmitter.emit('sensor:magnet-id', { id: parsedData.data.id })
        }
        if (this.magnetMode === 2) {
          this.eventEmitter.emit('sensor:magnet-force', {
            force: parsedData.data.force,
            directionX: parsedData.data.directionX,
            directionY: parsedData.data.directionY,
            directionZ: parsedData.data.directionZ,
          })
        }
        this.prevMagnetStatus = parsedData.data
      }
      if (parsedData.dataType === 'sensor:attitude-euler') {
        this.eventEmitter.emit('sensor:attitude-euler', {
          roll: parsedData.data.roll,
          pitch: parsedData.data.pitch,
          yaw: parsedData.data.yaw,
        })
        this.prevAttitudeEuler = parsedData.data
      }
      if (parsedData.dataType === 'sensor:attitude-quaternion') {
        this.eventEmitter.emit('sensor:attitude-quaternion', {
          w: parsedData.data.w,
          x: parsedData.data.x,
          y: parsedData.data.y,
          z: parsedData.data.z,
        })
        this.prevAttitudeQuaternion = parsedData.data
      }
    } catch (e) {
      return
    }
  }
}
