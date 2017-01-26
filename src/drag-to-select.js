import { drag } from 'd3-drag'

export function createDragToSelect() {


  console.log(drag())

  function dragToSelect(s) {
    s.call(drag)
  }

  return dragToSelect
}
