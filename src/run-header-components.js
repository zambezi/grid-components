import { select } from 'd3-selection'
import { selectionChanged, rebind } from '@zambezi/d3-utils'

export function createRunHeaderComponents () {
  const changed = selectionChanged().key(columnChangeKey)
  const api = rebind().from(changed, 'key')

  function runHeaderComponents (s) {
    s.selectAll('.zambezi-grid-headers .zambezi-grid-header')
      .select(changed)
        .each(runComponents)
  }

  return api(runHeaderComponents)

  function runComponents (d, i) {
    const components = d.headerComponents,
      target = select(this)

    if (!components) return
    components.forEach(component => target.each(component))
  }
}

function columnChangeKey (column) {
  return [
    column.id,
    column.label || '·',
    column.key || '·',
    Math.round(column.offset),
    Math.round(column.absoluteOffset),
    Math.round(column.width),
    column.sortAscending || '·',
    column.sortDescending || '·'
  ]
  .concat(
    column.children
    ? ('(' + column.children.map(columnChangeKey).join(',') + ')')
    : []
  )
  .join('|')
}
