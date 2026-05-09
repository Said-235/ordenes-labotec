const KEY = 'labotec-ordenes-v1'
const INIT = { ordenes: [], ultimoFolio: 1000 }

export async function cargarDB() {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : { ...INIT } }
  catch { return { ...INIT } }
}

export async function guardarDB(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch(e) { console.error(e) }
}

export async function agregarOrden(ordenes, nueva, nuevoFolio) {
  const data = { ordenes: [nueva, ...ordenes], ultimoFolio: nuevoFolio }
  await guardarDB(data); return data
}

export async function eliminarOrden(ordenes, id, ultimoFolio) {
  const data = { ordenes: ordenes.filter(o => o.id !== id), ultimoFolio }
  await guardarDB(data); return data
}
