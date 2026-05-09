export function generarFolio(ultimoFolio = 1000) {
  const numero = ultimoFolio + 1
  const yr     = new Date().getFullYear().toString().slice(-2)
  return { folio: `OS-${yr}-${String(numero).padStart(4,'0')}`, numero }
}
