const cuerpoTabla = document.getElementById('cuerpo-tabla')
const totalGastos = document.getElementById('total-gastos')
const cantidadGastos = document.getElementById('cantidad-gastos')
const filtroMes = document.getElementById('filtro-mes')
const filtroCategoria = document.getElementById('filtro-categoria')

let gastosGlobal = []
let grafico

function formatearDinero(numero) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(numero)
}

function mostrarDatos(gastos) {
  cuerpoTabla.innerHTML = ''

  let total = 0

  gastos.forEach((gasto) => {
    const fila = document.createElement('tr')

    fila.innerHTML = `
      <td>${gasto.fecha}</td>
      <td>${gasto.categoria}</td>
      <td>${gasto.descripcion}</td>
      <td>${formatearDinero(gasto.monto)}</td>
    `

    cuerpoTabla.appendChild(fila)

    total += gasto.monto
  })

  totalGastos.textContent = formatearDinero(total)
  cantidadGastos.textContent = gastos.length
}

function llenarCategorias(gastos) {
  const categorias = [...new Set(gastos.map((g) => g.categoria))]

  categorias.forEach((cat) => {
    const option = document.createElement('option')
    option.value = cat
    option.textContent = cat

    filtroCategoria.appendChild(option)
  })
}

function llenarMeses(gastos) {
  const meses = [...new Set(gastos.map((g) => g.fecha.slice(0, 7)))]

  meses.forEach((mes) => {
    const option = document.createElement('option')
    option.value = mes
    option.textContent = mes

    filtroMes.appendChild(option)
  })
}

function crearGrafico(gastos) {
  const totalesPorCategoria = {}

  gastos.forEach((gasto) => {
    if (!totalesPorCategoria[gasto.categoria]) {
      totalesPorCategoria[gasto.categoria] = 0
    }

    totalesPorCategoria[gasto.categoria] += gasto.monto
  })

  const categorias = Object.keys(totalesPorCategoria)
  const totales = Object.values(totalesPorCategoria)

  const ctx = document.getElementById('graficoCategorias').getContext('2d')

  if (grafico) {
    grafico.destroy()
  }

  grafico = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categorias,
      datasets: [
        {
          data: totales,
          backgroundColor: [
            '#3498db',
            '#2ecc71',
            '#e74c3c',
            '#f1c40f',
            '#9b59b6',
            '#1abc9c',
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    },
  })
}

function aplicarFiltros() {
  let filtrados = gastosGlobal

  const mes = filtroMes.value
  const categoria = filtroCategoria.value

  if (mes !== '') {
    filtrados = filtrados.filter((g) => g.fecha.startsWith(mes))
  }

  if (categoria !== '') {
    filtrados = filtrados.filter((g) => g.categoria === categoria)
  }

  mostrarDatos(filtrados)
  crearGrafico(filtrados)
}

filtroMes.addEventListener('change', aplicarFiltros)
filtroCategoria.addEventListener('change', aplicarFiltros)

fetch('./gastos.json')
  .then((res) => res.json())
  .then((gastos) => {
    gastosGlobal = gastos

    mostrarDatos(gastosGlobal)
    llenarCategorias(gastosGlobal)
    llenarMeses(gastosGlobal)
    crearGrafico(gastosGlobal)
  })
  .catch((error) => console.error('Error:', error))
