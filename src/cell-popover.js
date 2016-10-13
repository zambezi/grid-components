import { appendIfMissing } from '@zambezi/d3-utils'
import { select, event } from 'd3-selection'
import { uniqueId } from 'underscore'
import './cell-popover.css'

export function createCellPopover() {

  const eventType = uniqueId('click.cell-popover-')

  function cellPopover(d, i) {
    select(this)
      .select(appendIfMissing('button.custom-element'))
        .text('✓')
        .on('click.cell-popover', createPopover)
  }

  return cellPopover

  function createPopover(d) {

    const target = event.target
        , { top, left, width, height } = target.getBoundingClientRect()
        , popover = select(document.body)
            .select(appendIfMissing('div.zambezi-cell-popover'))
              .style('top', `${Math.floor(top + height / 2)}px`)
              .style('left', `${left + width}px`)
              .classed('is-open', true)
              .text(`Je suis ${d.row.name}!`)

    select('.info-box pre').text(`Created popover for ${d.row.name}
Cell bounding rect is
${JSON.stringify({ top, left })}`)

    select(document.body).on(eventType, () => console.log(`${eventType}!`))
  }
}