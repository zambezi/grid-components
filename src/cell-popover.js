import { appendIfMissing } from '@zambezi/d3-utils'

export function createCellPopover() {

  function cellPopover(d, i) {
    d3.select(this)
      .select(appendIfMissing('button.custom-element'))
      .text('✓')
      .on('click.custom-component-click', customHandler)
  }

  return cellPopover

  function customHandler(d) {
    d3.select('.info-box p').text(`Clicked button for ${d.row.name}.`)
  }
}