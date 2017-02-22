import { dispatch  as createDispatch }  from 'd3-dispatch'
import { rebind, forward } from '@zambezi/d3-utils'

import './row-selection.css'

export function createRowSelection() {

  const dispatch = createDispatch('row-selected-change')

  function rowSelection(s) {
    s.each(rowSelectionEach)
  }

  return rebind().from(dispatch, 'on')(rowSelection)

  function rowSelectionEach(d) {
    console.log('rowSelectionEach', this, d)
  }
}
