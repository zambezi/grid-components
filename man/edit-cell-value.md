## edit cell value

Column component that allows free-text input on grid cells.

Supports,

* Programmatic validation
* Validation indication
* Programmatic configuration of which cells are editable.
* Programmatic configuration of input character class constraints.
* Invalid cells in editing support virtualization (being scrolled out, then back in)

The component will dispatch the following events:

* `change` when the value has been changed and passes validation.
  The component will not change the value of the row itself -- you should do that yourself.
  See on the example below.
* `validationerror` when the attempted change did not passed the provided validation.
* `editstart` when editing is started
* `editend` when editing is finished, either by the commit of a new value or by cancelling the edit operation.

The component can be configured with the following getter setters:

* `validate`: a function that takes the editing row and the proposed value.
  Should return nothing if the change is valid.
  Otherwise, it should return the reason why the change was invalid.  Whatever is return will be passed to the validation error handler.
* `editable`: Receives a "cell object"; should return true if the cell is editable.
* `characterClass`: in the notation of Regular Expressions; if present will use this to restrict the characters that can be entered on the editor.

The following example, available for running on the `/examples/edit-cells.html` file.
Showcases the `edit-cell-value` configuration.

* Username cannot be empty
* Username cannot use only one letter
* Character class for input: Only uppercase and lower case ASCII characters and numbers between 0 and 5 can used to input usernames.
* Non editable cells: Cells for rows in which the username begins with "Zac" cannot be edited
* Processing: Client can decide how to consolidate the change; in this case, it is turned into upper case

```javascript
var table = grid.createGrid()
        .columns(
          [
            { key: 'name', locked: 'left', width: 200 }
          , {
              key: 'username'
            , components: [
                gridComponents.createEditCellValue()
                    .on('change', onUsernameChange)
                    .on('validationerror', console.error.bind(console, 'VALIDATION'))
                    .on('editstart', d => console.debug('edit start',  d))
                    .on('editend', d => console.debug('edit end', d))
                    .characterClass('A-Za-z0-5')
                    .validate(validateUserName)
                    .editable(isNotZack)

              , grid.updateTextIfChanged
              ]
            }
          , { key: 'email', sortDescending: true }
          , { key: 'phone' }
          ]
        )
  , rows = _.range(1, 2000).map(faker.Helpers.createCard)

d3.select('.grid-target')
    .style('height', '500px')
    .datum(rows)
    .call(table)

function onUsernameChange(row, value) {
  row.username = value.toUpperCase()
}

function validateUserName(row, value) {
  if (!value) return 'Username cannot be empty'
  if (!value.split('').some(isDifferentCharacter())) return 'Cannot all be the same character'
}

function isDifferentCharacter() {
  let found
  return function check(ch) {
    if (found && !~found.indexOf(ch)) return true
    found = ch
    return false
  }
}

function isNotZack(cell) {
  return cell.row.username.indexOf('Zac') !== 0
}
```
