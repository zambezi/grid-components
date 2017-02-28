import { functor } from '@zambezi/fun'

export function nestedRowFormat() {
  const formatters = Array.from(arguments).map(functor)
  return function format(row) {
    return formatters[Math.min(row.nestLevel, formatters.length - 1)]
                .apply(this, arguments)
  }
}
