/**
 * Copyright (c) 2020-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * @hidden
 */
type TagHandler = {
  current: () => number
  next: () => number
}

/**
 * tag handling utility for toio cube's operation
 *
 * @hidden
 */
export const createTagHandler = (): TagHandler => {
  let tag = 0
  return {
    current: () => {
      return tag
    },
    next: () => {
      tag = (tag + 1) % 256
      return tag
    },
  }
}
