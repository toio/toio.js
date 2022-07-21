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
 * Scan nearest core cube
 */
export class NearestScanner extends Scanner {
  protected static readonly SCAN_WINDOW_MS: number = 1_000 // 1 sec

  private scanWindowMs: number = NearestScanner.SCAN_WINDOW_MS

  private nearestPeripheral: Peripheral | null = null

  private scanningIntervalTimer: NodeJS.Timer | null = null

  /**
   * Constructor of NearestScanner class
   *
   * @param timeoutMs - timeout duration in millisecond. 0 means no timeout.
   * @param scanWindowMs - scan time duration in millisecond.
   */
  public constructor(
    scanWindowMs: number = NearestScanner.SCAN_WINDOW_MS,
    timeoutMs: number = Scanner.DEFAULT_TIMEOUT_MS,
  ) {
    super(timeoutMs)
    this.scanWindowMs = scanWindowMs
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
    if (this.nearestPeripheral === null || peripheral.rssi > this.nearestPeripheral.rssi) {
      this.nearestPeripheral = peripheral
    }
  }

  protected executor(resolve: (value: Cube | Cube[]) => void): void {
    this.scanningIntervalTimer = setInterval(() => {
      if (this.nearestPeripheral === null) {
        return
      }

      resolve(new Cube(this.nearestPeripheral))
    }, this.scanWindowMs)
  }
}
