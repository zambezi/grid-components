import { clone, find } from 'underscore'

const defaultPredicate = () => true

export function createGatherRows() {

  let groups = []
    , cache

  function gatherRows(s) {
    s.each(gatherRowsEach)
        .on('data-dirty.gather-rows', () => cache = null)
  }

  gatherRows.groups = function(value) {
    if (!arguments.length) return groups
    groups = value
    return gatherRows
  }

  return gatherRows

  function gatherRowsEach(d, i) {
    if (!cache) { 
      cache = d.rows.reduce(
        gather, groups.map(
          d => Object.assign({ children: [], predicate: defaultPredicate }, d)
        )
      )
    }
    d.rows = cache
    console.log(cache)
  }

  function gather(targets, row) {
    const target = find(targets, t => t.predicate(row))
    if (!target) return targets
    target.children.push(row)
    target.expanded = true
    return targets
  }
}
