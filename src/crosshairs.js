
import './crosshairs.css'

export function createCrosshairs() {

  function crosshairs(s) {
    s.each(crosshairsEach)
  }

  return crosshairs

  function crosshairsEach(d, i) {
    console.log('crosshairsEach', this, d)
  }

}
