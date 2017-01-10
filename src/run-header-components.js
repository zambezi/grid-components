import { select } from 'd3-selection'

export function createRunHeaderComponents() {

  function runHeaderComponents(s) {
    s.selectAll('.zambezi-grid-headers .zambezi-grid-header')
        .each(runComponents)
  }

  return runHeaderComponents

  function runComponents(d, i) {
    const components = d.headerComponents
        , target = d3.select(this)

    if (!components) return
    components.forEach(component => target.each(component))
  }
}
