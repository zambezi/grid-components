

export function createDragToSelect() {

  function dragToSelect(s) {
    console.log('drag to select on', s.node())
  }

  return dragToSelect
}
