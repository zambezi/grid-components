import { unwrap } from '@zambezi/grid'
import './edit-cell.css'

export function createEditCell() {


  function editCellEach(d, i) {
    console.debug('editCellEach', d, this, unwrap)
  }


  return editCellEach


}
