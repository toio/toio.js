/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { EventEmitter } from 'events'
import TypedEmitter from 'typed-emitter'
import noble from '@abandonware/noble'
import { Cube } from '@toio/cube'

interface Event {
  start: () => void
  stop: () => void
  discover: (cube: Cube) => void
}

/**
 * Abstract scanner class
 */
export abstract class Scanner {
  protected static readonly DEFAULT_TIMEOUT_MS: number = 0 // no timeout

  private readonly timeoutMs: number = Scanner.DEFAULT_TIMEOUT_MS

  protected eventEmitter: TypedEmitter<Event> = new EventEmitter() as TypedEmitter<Event>

  private timeoutTimer: NodeJS.Timer | null = null

  /**
   * Constructor of Scanner class
   *
   * @param timeoutMs - timeout duration in millisecond. 0 means no timeout.
   */
  public constructor(timeoutMs: number = Scanner.DEFAULT_TIMEOUT_MS) {
    this.timeoutMs = timeoutMs
  }

  /**
   * Start scanning
   *
   * @returns Promise object
   */
  public start(): Promise<Cube | Cube[]> {
    noble.on('stateChange', this.onStateChange.bind(this))
    noble.on('discover', this.onDiscover.bind(this))

    const promises: Promise<Cube | Cube[]>[] = [new Promise(this.executor.bind(this))]
    if (this.timeoutMs > 0) {
      promises.push(this.createTimeoutPromise(this.timeoutMs))
    }

    this.eventEmitter.emit('start')
    return Promise.race(promises).then(
      value => {
        this.stop()
        const listValue = Array.isArray(value) ? value : [value]
        listValue.forEach(coreCube => this.eventEmitter.emit('discover', coreCube))
        return value
      },
      reason => {
        this.stop()
        return Promise.reject(reason)
      },
    )
  }

  /**
   * Stop scanning
   */
  public stop(): void {
    if (this.timeoutTimer !== null) {
      clearTimeout(this.timeoutTimer)
    }
    noble.stopScanning()
    noble.removeListener('stateChange', this.onStateChange)
    noble.removeListener('discover', this.onDiscover)
    this.eventEmitter.emit('stop')
  }

  public on<E extends keyof Event>(event: E, listener: Event[E]): this {
    this.eventEmitter.on(event, listener)
    return this
  }

  public off<E extends keyof Event>(event: E, listener: Event[E]): this {
    this.eventEmitter.removeListener(event, listener)
    return this
  }

  protected abstract onDiscover(peripheral: noble.Peripheral): void

  protected abstract executor(resolve: (value: Cube | Cube[]) => void, reject: (reason?: string) => void): void

  protected onStateChange(state: string): void {
    if (state === 'poweredOn') {
      noble.startScanning([Cube.TOIO_SERVICE_ID])
    } else {
      noble.stopScanning()
    }
  }

  private createTimeoutPromise(timeoutMs: number): Promise<Cube | Cube[]> {
    return new Promise((_resolve: (value: Cube | Cube[]) => void, reject) => {
      this.timeoutTimer = setTimeout(reject, timeoutMs)
    })
  }
}
