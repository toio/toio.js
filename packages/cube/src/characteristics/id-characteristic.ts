/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import { Characteristic } from '@abandonware/noble'
import { IdSpec, PositionIdInfo, StandardIdInfo, DataType } from './specs/id-spec'

/**
 * @hidden
 */
export interface Event {
  'id:position-id': (info: PositionIdInfo) => void
  'id:standard-id': (info: StandardIdInfo) => void
  'id:position-id-missed': () => void
  'id:standard-id-missed': () => void
}

/**
 * @hidden
 */
export class IdCharacteristic {
  public static readonly UUID = '10b201015b3b45719508cf3efcd7bbae'

  private readonly characteristic: Characteristic

  private readonly eventEmitter: TypedEmitter<Event>

  public constructor(characteristic: Characteristic, eventEmitter: EventEmitter) {
    this.characteristic = characteristic
    if (this.characteristic.properties.includes('notify')) {
      this.characteristic.on('data', this.onData.bind(this))
      this.characteristic.subscribe()
    }

    this.eventEmitter = eventEmitter as TypedEmitter<Event>
  }

  private onData(data: Buffer): void {
    const idSpec = new IdSpec()

    try {
      const ret: DataType = idSpec.parse(data)

      switch (ret.dataType) {
        case 'id:position-id':
          this.eventEmitter.emit(ret.dataType, ret.data)
          break
        case 'id:standard-id':
          this.eventEmitter.emit(ret.dataType, ret.data)
          break
        case 'id:position-id-missed':
        case 'id:standard-id-missed':
          this.eventEmitter.emit(ret.dataType)
          break
        default:
          break
      }
    } catch (e) {
      return
    }
  }
}
