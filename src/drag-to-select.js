import { drag as createDrag } from 'd3-drag'
import { select, event } from 'd3-selection'

export function createDragToSelect() {

  const cellSelector = '.zambezi-grid-cell'
      , maxParentCheckJumps = 3
      , drag = createDrag()
            .on('start.log', d => console.log('START', d))
            .on('end.log', d => console.log('END', d))

  let isDragging = false

  function dragToSelect(s) {
    s.each(dragToSelectEach)
  }

  return dragToSelect

  function dragToSelectEach({ dispatcher, scroll, columns }) {
    dispatcher.on('cell-enter.drag-to-select', configureDragBehaviour)
  }

  function configureDragBehaviour() {
    select(this)
        .call(drag)
        .on('mouseenter.drag-to-select', onMouseEnter)
        .on('mouseout.drag-to-select', onMouseOut)
  }

  function onMouseEnter() {
    if (!isDragging) return
    console.log('onMouseEnter', d)
  }

  function onMouseOut() {
    if (!isDragging) return
    console.log('onMouseOut', d)
  }

  function findParentCell(dom, depth=0) {
    if (!dom) return null
    if (depth > maxParentCheckJumps) return null
    if (select(dom).filter(cellSelector).size()) return dom
    return findParentCell(dom.parentElement, depth++)
  }
}
