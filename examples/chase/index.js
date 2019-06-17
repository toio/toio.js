/**
 * Copyright (c) 2019-present, Sony Interactive Entertainment Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { NearScanner } = require('@toio/scanner')

// calculate chasing cube's motor speed
function chase(jerryX, jerryY, tomX, tomY, tomAngle) {
  const diffX = jerryX - tomX
  const diffY = jerryY - tomY
  const distance = Math.sqrt(diffX * diffX + diffY * diffY)
  if (distance < 50) {
    return [0, 0] // stop
  }

  let relAngle = (Math.atan2(diffY, diffX) * 180) / Math.PI - tomAngle
  relAngle = relAngle % 360
  if (relAngle < -180) {
    relAngle += 360
  } else if (relAngle > 180) {
    relAngle -= 360
  }

  const ratio = 1 - Math.abs(relAngle) / 90
  let speed = 100
  if (relAngle > 0) {
    return [speed, speed * ratio]
  } else {
    return [speed * ratio, speed]
  }
}

async function main() {
  // start a scanner to find nearest two cubes
  const cubes = await new NearScanner(2).start()

  // connect two cubes (jerry chases tom)
  const jerry = await cubes[0].connect()
  const tom = await cubes[1].connect()

  // set light color and store position
  let jerryX = 0
  let jerryY = 0
  jerry.turnOnLight({ durationMs: 0, red: 255, green: 0, blue: 255 })
  jerry.on('id:position-id', data => {
    jerryX = data.x
    jerryY = data.y
  })

  // set light color and store position
  let tomX = 0
  let tomY = 0
  let tomAngle = 0
  tom.turnOnLight({ durationMs: 0, red: 0, green: 255, blue: 255 })
  tom.on('id:position-id', data => {
    tomX = data.x
    tomY = data.y
    tomAngle = data.angle
  })

  // loop
  setInterval(() => {
    tom.move(...chase(jerryX, jerryY, tomX, tomY, tomAngle), 100)
  }, 50)
}

main()
