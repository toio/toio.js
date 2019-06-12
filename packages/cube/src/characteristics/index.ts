/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//
// toio Characteristic
//
export { IdCharacteristic } from './id-characteristic'
export { MotorCharacteristic } from './motor-characteristic'
export { LightCharacteristic } from './light-characteristic'
export { SoundCharacteristic } from './sound-characteristic'
export { SensorCharacteristic } from './sensor-characteristic'
export { ButtonCharacteristic } from './button-characteristic'
export { BatteryCharacteristic } from './battery-characteristic'
export { ConfigurationCharacteristic } from './configuration-characteristic'

//
// DataTypes
//
export { PositionIdInfo, StandardIdInfo } from './specs/id-spec'
export { StandardId } from './specs/standard-id'
export { LightOperation } from './specs/light-spec'
export { SoundOperation, Note } from './specs/sound-spec'

//
// Event
//
import { Event as IdEvent } from './id-characteristic'
import { Event as SensorEvent } from './sensor-characteristic'
import { Event as ButtonEvent } from './button-characteristic'
import { Event as BatteryEvent } from './battery-characteristic'

export interface Event extends IdEvent, SensorEvent, ButtonEvent, BatteryEvent {}
