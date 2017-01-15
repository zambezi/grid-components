import { dispatch as createDispatch } from 'd3-dispatch'

export function createPasteBehaviour() {
  function pasteBehaviour(s) {
    console.log('pate behaviour', s.node())
  }

  return pasteBehaviour
}
