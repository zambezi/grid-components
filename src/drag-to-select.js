import { drag as createDrag } from 'd3-drag'
import { select, event } from 'd3-selection'

export function createDragToSelect() {

  const drag = createDrag()
            .on('start.log', d => console.log('START', d))
            .on('drag', onDrag)
            .on('end.log', d => console.log('END', d))

  function dragToSelect(s) {
    s.each(dragToSelectEach)
  }

  return dragToSelect

  function onDrag(d, i) {
    console.log('on drag', d, document.elementFromPoint(event.x, event.y))
  }

  function dragToSelectEach({ dispatcher }) {
    dispatcher.on('cell-enter.log', d => console.log('on cell enter', d))
        .on('cell-enter.drag-to-select', setupDragEvents)
  }

  function setupDragEvents() {
    select(this).call(drag)
  }
}
