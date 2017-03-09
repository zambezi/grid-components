import { select } from 'd3-selection'
import './crosshairs.css'

export function createCrosshairs() {
  
  let vertical = false
    , horizontal = true

  function crosshairs(s) {
    s.each(crosshairsEach)
  }

  return crosshairs

  function crosshairsEach({ rows, dispatcher }, i) {
    const target = select(this)

    dispatcher
          .on('cell-enter.crosshairs-column', vertical ? setColumnListeners : null)
          .on('cell-exit.crosshairs-column', vertical ? clearColumnListeners : null)
          .on('row-enter.crosshairs-row', horizontal ? setRowListeners : null)
          .on('row-exit.crosshairs-row', horizontal ? clearRowListeners : null)
  }

  function onRowHover(d) {
    target.selectAll('.zambezi-grid-row')
        .classed('is-crosshairs-over', r => d.index === r.index)
        .each(r => console.log(r.index === d.index))
  }

  function setRowListeners(d) {
    select(this).on('mouseover.crosshairs-row', onRowHover)
  }

  function setColumnListeners(d) {
    select(this).on('mouseover.crosshairs-row', d => console.log('column hover', d, this))

  }

  function clearRowListeners(d) {
    select(this).on('mouseover.crosshairs-row', null)
  }

  function clearColumnListeners(d) {
    select(this).on('mouseover.crosshairs-row', null)
  }

}
