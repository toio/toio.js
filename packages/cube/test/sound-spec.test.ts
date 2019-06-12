/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { SoundSpec, Note } from '../src/characteristics/specs/sound-spec'

describe('sound spec', () => {
  const spec = new SoundSpec()

  test('build buffer to write play preset sound operation', () => {
    const inputSoundId = 4
    const data = spec.playPresetSound(inputSoundId)

    expect(data.buffer).toEqual(Buffer.from([0x02, 0x04, 0xff]))
    expect(data.data).toEqual({
      soundId: inputSoundId,
    })
  })

  test('build buffer to write play sound operation', () => {
    const inputDuration = [300, 300, 300]
    const inputNoteName = [Note.C5, Note.D5, Note.E5]
    const inputRepeatCount = 2

    const data = spec.playSound(
      [
        {
          durationMs: inputDuration[0],
          noteName: inputNoteName[0],
        },
        {
          durationMs: inputDuration[1],
          noteName: inputNoteName[1],
        },
        {
          durationMs: inputDuration[2],
          noteName: inputNoteName[2],
        },
      ],
      inputRepeatCount,
    )

    expect(data.buffer).toEqual(Buffer.from([0x03, 0x02, 0x03, 0x1e, 0x3c, 0xff, 0x1e, 0x3e, 0xff, 0x1e, 0x40, 0xff]))
    expect(data.data.operations).toEqual([
      {
        durationMs: inputDuration[0],
        noteName: inputNoteName[0],
      },
      {
        durationMs: inputDuration[1],
        noteName: inputNoteName[1],
      },
      {
        durationMs: inputDuration[2],
        noteName: inputNoteName[2],
      },
    ])
    expect(data.data.repeatCount).toEqual(inputRepeatCount)
    expect(data.data.totalDurationMs).toEqual((300 + 300 + 300) * 2)
  })

  test('build buffer to write stop sound operation', () => {
    const data = spec.stopSound()

    expect(data.buffer).toEqual(Buffer.from([0x01]))
  })
})
