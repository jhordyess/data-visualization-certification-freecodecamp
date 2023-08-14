import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const dataUrl =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'

const chartWidth = 896 * 2
const chartHeight = 512
const chartPadding = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 65
}

const legendWidth = 396
const legendHeight = 20
const legendPadding = 30

const colorPalette = [
  '#313695',
  '#4575b4',
  '#74add1',
  '#abd9e9',
  '#e0f3f8',
  '#ffffbf',
  '#fee090',
  '#fdae61',
  '#f46d43',
  '#d73027',
  '#a50026'
]

const fetchData = async (url = dataUrl) => await fetch(url).then(response => response.json())

const getMonth = month =>
  new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(0, month))

const formatDate = (year, month) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(year, month))

const formatTemperature = number =>
  new Intl.NumberFormat('en-US', {
    style: 'unit',
    unit: 'celsius',
    maximumFractionDigits: 1,
    minimumFractionDigits: 1
  }).format(number)

const svg = d3
  .select('#chart-container')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight + legendHeight + legendPadding)

const xScale = d3.scaleBand().range([chartPadding.left, chartWidth - chartPadding.right])
const yScale = d3.scaleBand().range([chartHeight - chartPadding.bottom, chartPadding.top])
const colorScale = d3.scaleThreshold().range(colorPalette)

const showTooltip = ({ clientX, clientY }, { year, month, variance }, baseTemperature) => {
  const date = formatDate(year, month - 1)
  const temperature = formatTemperature(baseTemperature + variance)
  const variation = formatTemperature(variance)

  const screenWidth =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

  let translateX = clientX + 15
  const translateY = clientY - yScale.bandwidth() + window.scrollY

  const tooltipWidth = 144
  const tooltipTotalWidth = translateX + tooltipWidth + chartPadding.right

  if (tooltipTotalWidth > screenWidth) translateX = clientX - tooltipWidth - 15

  d3.select('#tooltip')
    .style('display', 'block')
    .attr('data-year', year)
    .html(`${date}<br/>${temperature}<br/>${variation}`)
    .style('transform', `translate(${translateX}px,${translateY}px)`)
}

const hideTooltip = () => {
  d3.select('#tooltip').style('display', 'none')
}

const drawHeatMap = (data, baseTemperature) => {
  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('data-month', ({ month }) => month - 1)
    .attr('data-year', ({ year }) => year)
    .attr('data-temp', ({ variance }) => baseTemperature + variance)
    .attr('x', ({ year }) => xScale(year))
    .attr('y', ({ month }) => yScale(month - 1))
    .attr('width', xScale.bandwidth())
    .attr('height', yScale.bandwidth())
    .attr('class', 'hover:stroke-black cursor-pointer cell')
    .attr('fill', ({ variance }) => colorScale(baseTemperature + variance))
    .on('mouseover', (event, data) => showTooltip(event, data, baseTemperature))
    .on('mouseout', hideTooltip)
}

const drawLegend = () => {
  // FIXME: Personally, I think this is a complicated way to do it, we exclude first and last element
  const colorDomain = colorScale.domain()

  const legendScale = d3
    .scaleBand()
    .range([chartPadding.left, legendWidth])
    .domain(colorDomain)
    .padding(1)

  const legendAxis = d3.axisBottom(legendScale).tickValues(colorDomain).tickFormat(d3.format('.1f'))

  svg
    .append('g')
    .attr('transform', `translate(0,${chartHeight + legendHeight})`)
    .call(legendAxis)

  const data = colorPalette.map(color => colorScale.invertExtent(color))

  svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(0,${chartHeight})`)
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', ([min]) => legendScale(min))
    .attr('y', 0)
    .attr('width', ([min, max]) => {
      if (max === undefined) return 0
      else if (min === undefined) return 0
      else return legendScale(max) - legendScale(min)
    })
    .attr('height', legendHeight)
    .attr('fill', ([min]) => colorScale(min))
}

const drawAxes = () => {
  const xAxis = d3.axisBottom(xScale).tickValues(xScale.domain().filter(year => year % 10 === 0))
  const yAxis = d3.axisLeft(yScale).tickFormat(month => getMonth(month))

  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0,${chartHeight - chartPadding.bottom})`)
    .call(xAxis)

  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${chartPadding.left},0)`)
    .call(yAxis)
}

const createColorDomain = (data, baseTemperature) => {
  const variances = data.map(({ variance }) => baseTemperature + variance)
  const [minVariance, maxVariance] = [d3.min(variances), d3.max(variances)]
  const step = (maxVariance - minVariance) / colorPalette.length
  const arr = []
  //🤔
  for (let i = 1; i < colorPalette.length; i++) {
    arr.push(minVariance + i * step)
  }
  return arr
}

const createMonthDomain = (months, current = 0, str = '') =>
  current >= months
    ? str.split(',').map(Number)
    : createMonthDomain(months, current + 1, current + ',' + str)

const initChart = async () => {
  const { monthlyVariance: data, baseTemperature } = await fetchData()
  document.getElementById('spinner').style.display = 'none'
  document.getElementById('chart-container').style.display = 'block'

  xScale.domain(data.map(({ year }) => year))
  yScale.domain(createMonthDomain(12))
  colorScale.domain(createColorDomain(data, baseTemperature))

  drawHeatMap(data, baseTemperature)
  drawLegend()
  drawAxes()
}

initChart()
