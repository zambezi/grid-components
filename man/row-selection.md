`row-selection` is a simple component that will automatically highlight the active row.
A row can be made active by clicking on it.

To use this component, create an instance of it and configure it to run on by using the `usePre` method on the grid.

```
const rowSelection = gridComponents.createRowSelection()
    , table = grid.createGrid()
          .columns(
            [
              { key: 'name', width: 200 }
            , { key: 'username' }
            , { key: 'email' }
            , { key: 'phone' }
            ]
          )
          .usePre(rowSelection)
```
