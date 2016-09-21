import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind } from '@zambezi/d3-utils'

export function createCellSelection() {

  const dispatch = createDispatch('cell-selected-change')

  function cellSelection(s) {
    s.each(cellSelectionEach)
  }

  return rebind().from(dispatch, 'on')(cellSelection)

  function cellSelectionEach(d, i) {
    console.debug('cellSelectionEach', d, this)
  }
}
