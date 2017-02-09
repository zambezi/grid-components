import { select } from 'd3-selection'

export function createHighlightSelectedCells() {

  let selectedCells = []
    , borderCache

  function highlightSelectedCells(s) {
    s.each(highlightSelectedCellsEach)
  }

  highlightSelectedCells.selectedCells = function(value) {
    if (!arguments.length) return selectedCells
    selectedCells = value
    borderCache = null
    return highlightSelectedCells
  }

  return highlightSelectedCells

  function highlightSelectedCellsEach(d) {
    const target = select(this)
              .on(
                'data-dirty.highlight-selected-cells',
                () => borderCache = null
              )

    if (!borderCache)  {
      console.log('compile border cache')
      borderCache = compileBorderLayout()
    }
  }

  function compileBorderLayout() {
    const rowToIndex = new Set()
    const columnToIndex = new Set()

    const result = selectedCells.reduce(toCoords, [])

    function toCoords(cell) {
      console.log('To coords', cell)
    }

    return {}

  }
}
