export const MARCA = {
  nombre:    'LABOTEC ENGINEERING',
  subtitulo: 'Engineering Services',
  version:   'v1.1.0',
}

export const COLORES = {
  cyan:'#4ECDC4', cyanDark:'#3ab5ac', cyanLight:'#e8faf9', cyanMid:'#b2ede9',
  negro:'#111111', grisOscuro:'#1c1c1c', grisMedio:'#444444', grisClaro:'#f4f4f4',
  blanco:'#ffffff', borde:'#c8edeb', error:'#cc0000', errorLight:'#fee', errorBorder:'#fcc',
}
export const C = COLORES

export const TIPOS_ORDEN = [
  { id:'preventivo',  label:'Mantenimiento Preventivo', desc:'Servicio programado para prevenir fallas y extender la vida del equipo.', icon:'🛡️', code:'PREV', color:'#4ECDC4', colorBg:'rgba(78,205,196,0.12)',  colorBorder:'rgba(78,205,196,0.3)',  showRefacciones:true },
  { id:'correctivo',  label:'Mantenimiento Correctivo', desc:'Intervención de emergencia para diagnosticar y reparar fallas presentes.', icon:'⚡', code:'CORR', color:'#ff7070', colorBg:'rgba(255,112,112,0.12)', colorBorder:'rgba(255,112,112,0.3)', showRefacciones:true },
  { id:'capacitacion',label:'Capacitación',             desc:'Entrenamiento y formación del personal en el uso correcto del equipo.',   icon:'🎓', code:'CAP',  color:'#a78bfa', colorBg:'rgba(167,139,250,0.12)', colorBorder:'rgba(167,139,250,0.3)', showRefacciones:false },
  { id:'instalacion', label:'Instalación de Equipo',    desc:'Puesta en marcha, configuración y verificación inicial del equipo.',      icon:'🔩', code:'INST', color:'#fbbf24', colorBg:'rgba(251,191,36,0.12)',  colorBorder:'rgba(251,191,36,0.3)',  showRefacciones:true },
]

export function getTipo(id) {
  return TIPOS_ORDEN.find(t => t.id === id) || TIPOS_ORDEN[0]
}
