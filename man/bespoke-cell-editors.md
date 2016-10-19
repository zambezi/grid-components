## Bespoke cell editors

You can create your own bespoke cell editors with the low-level `edit cell` component wrapper.
The provided [edit cell value] component, for example, uses the `edit cell` component under the hood.

This component provides the basic infrastructure for generic cell editors -- it will

* expose a `editable` function to determine which of the cells in the column are editable.
* detect a configurable edit gesture, upon which it will call your provided component with access to associated cell DOM element and data.  This allows you to create whatever representation you need either inline, on the grid, or outside (on a pop-up, for example)
* run validation routines as determined by the client.
* dispatch `change` and `validation` events depending on the results of validating the input.

To use the `edit cell` component, create an instance by using the `createEditCell` factory.
Then pass it your own editor component using the `component` getter/setter.

Your component should 

* be a [standard D3 component](https://bost.ocks.org/mike/chart/) that will be run on a D3 selection of the editing cell.
* expose the `on` method of a D3 dispatcher. 
* dispatch `partialedit` whenever the user is editing the field. This will allow the component to cache a version of the partial data so that if a cell is destroyed and reconstructed (by scrolling, for example) the component can reconstruct it's partial state.  The DOM node `value` property should have the edit value.
* dispatch `commit` when the component determines that the edit is complete (for example, by blurring on a text input or clicking on a date picker button).  The DOM node `value` property should have the edit value.
* dispatch `cancel` when the component determines that editing is canceled.
* use the provided `tempInput` value, if present, to reconstruct the partial edit state.

Please see the `examples/create-custom-editors.html` for an implementation example.
