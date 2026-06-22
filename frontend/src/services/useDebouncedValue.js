/**
 * @summary Returns a value after it stops changing for the given delay.
 * @author Wesley, Darlington, Mikotaj (shared)
 */
import { useEffect, useState } from 'react'

export default function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])

  return debounced
}
