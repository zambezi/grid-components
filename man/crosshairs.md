`crosshairs` is a component that can be use to highlight rows and columns over which the mouse hovers.
This component supports locked columns and locked rows.

To use the component, create a `crosshairs` component instance and add it to the _pre_ component stack with the `usePre` method:

```
const crosshairs = gridComponents.createCrosshairs()
    , table = grid.createGrid()
          .columns(
            [
              { key: 'name', width: 200 }
            , { key: 'username', locked: 'left' }
            , { key: 'email' }
            ]
          )
          .usePre(crosshairs)
```

By default, the component will highlight both the column and row of the cell that's being hovered over.
You can change that configuration by using the `vertical` and `horizontal` getter / setters.


For example, to turn off row hover, but still leave column hover on,

```
crosshairs.horizontal(false)
```

