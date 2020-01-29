/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Peripheral } from '@abandonware/noble'
import { Cube } from '@toio/cube'
import { Scanner } from './scanner'

/**
 * Scan nearby core cubes
 */
export class NearScanner extends Scanner {
  protected static readonly SCAN_WINDOW_MS: number = 1_000 // 1 sec

  private readonly peripherals: Peripheral[] = []

  private readonly numberOfCoreCubes: number = 1

  private scanningIntervalTimer: NodeJS.Timer | null = null

  /**
   * Constructor of NearScanner class
   *
   * @param numberOfCoreCubes - number of scanning core cubes
   * @param timeoutMs - timeout duration in millisecond. 0 means no timeout.
   */
  public constructor(numberOfCoreCubes: number = 1, timeoutMs: number = Scanner.DEFAULT_TIMEOUT_MS) {
    super(timeoutMs)
    this.numberOfCoreCubes = numberOfCoreCubes
  }

  /**
   * Stop scanning
   */
  public stop(): void {
    super.stop()
    if (this.scanningIntervalTimer !== null) {
      clearInterval(this.scanningIntervalTimer)
    }
  }

  protected onDiscover(peripheral: Peripheral): void {
    this.peripherals.push(peripheral)
  }

  protected executor(resolve: (value: Cube | Cube[]) => void): void {
    this.scanningIntervalTimer = setInterval(() => {
      if (this.peripherals.length < this.numberOfCoreCubes) {
        return
      }

      resolve(
        this.peripherals
          .sort((lhs, rhs) => rhs.rssi - lhs.rssi)
          .slice(0, this.numberOfCoreCubes)
          .map(peripheral => {
            return new Cube(peripheral)
          }),
      )
    }, NearScanner.SCAN_WINDOW_MS)
  }
}
