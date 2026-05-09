export function hashSimple(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0 }
  return Math.abs(h).toString(16).toUpperCase().padStart(8, '0')
}
