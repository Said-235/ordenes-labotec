import { useOrdenes } from '@/hooks/useOrdenes'
import Inicio      from '@/pages/Inicio'
import Formulario  from '@/pages/Formulario'
import OrdenVista  from '@/pages/OrdenVista'
import Historial   from '@/pages/Historial'
import Detalle     from '@/pages/Detalle'
import Spinner     from '@/components/common/Spinner'

export default function App() {
  const ctx = useOrdenes()
  if (ctx.cargando) return <Spinner />
  switch (ctx.pantalla) {
    case 'inicio':    return <Inicio     ctx={ctx} />
    case 'form':      return <Formulario ctx={ctx} />
    case 'orden':     return <OrdenVista ctx={ctx} />
    case 'historial': return <Historial  ctx={ctx} />
    case 'detalle':   return <Detalle    ctx={ctx} />
    default:          return <Inicio     ctx={ctx} />
  }
}
