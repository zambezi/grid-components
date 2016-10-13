import { appendIfMissing } from '@zambezi/d3-utils'
import { select } from 'd3-selection'
import './cell-popover.css'

export function createCellPopover() {

  function cellPopover(d, i) {
    select(this)
      .select(appendIfMissing('button.custom-element'))
        .text('✓')
        .on('click.custom-component-click', createPopover)
  }

  return cellPopover

  function createPopover(d) {
    select('.info-box p').text(`Created popover for ${d.row.name}.`)
    const popover = select(document.body)
            .select(appendIfMissing('div.zambezi-cell-popover'))
              .classed('is-open', true)
              .text(`Je suis ${d.row.name}!`)
  }
}