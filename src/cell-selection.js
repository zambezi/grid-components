export function createCellSelection() {
  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  return cellSelection

  function cellSelectionEach(d, i) {
    console.debug('cellSelectionEach', d, this)
  }
}
