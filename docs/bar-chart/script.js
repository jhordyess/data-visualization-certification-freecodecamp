import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const dataSetUrl =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json'

const chartWidth = 896
const chartHeight = 512
const chartPadding = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40
}

const fetchData = async (url = dataSetUrl) => {
  const { data, from_date, to_date } = await fetch(url).then(response => response.json())
  return { data, fromDate: new Date(from_date), toDate: new Date(to_date) }
}

const formatCurrency = value =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)

const formatDate = date =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)

const showTooltip = (event, data) => {
  const tooltip = d3.select('#tooltip')

  const value = formatCurrency(data[1])
  const date = formatDate(new Date(data[0]))

  const screenWidth =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

  let translateX = event.clientX + chartPadding.left
  const translateY = event.clientY - chartPadding.top - chartPadding.bottom

  const tooltipWidth = 128
  const tooltipTotalWidth = translateX + tooltipWidth + chartPadding.right

  if (tooltipTotalWidth > screenWidth) translateX = event.clientX - tooltipWidth - chartPadding.left

  tooltip
    .style('opacity', 1)
    .style('transform', `translate(${translateX}px,${translateY}px)`)
    .attr('data-date', data[0])
    .html(`${date}<br>${value} Billion`)
}

const hideTooltip = () => {
  d3.select('#tooltip').style('opacity', 0)
}

const svg = d3
  .select('#chart-container')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight)

const xScale = d3.scaleUtc().range([chartPadding.left, chartWidth - chartPadding.right])

const yScale = d3.scaleLinear().range([chartHeight - chartPadding.bottom, chartPadding.top])

const drawBars = data => {
  const barWidth = chartWidth / data.length

  svg
    .selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar fill-blue-500 hover:fill-gray-200 cursor-pointer')
    .attr('data-date', d => d[0])
    .attr('data-gdp', d => d[1])
    .attr('x', d => xScale(new Date(d[0])))
    .attr('y', d => yScale(d[1]))
    .attr('width', barWidth)
    .attr('height', d => chartHeight - chartPadding.bottom - yScale(d[1]))
    .on('mouseover', showTooltip)
    .on('mouseout', hideTooltip)
    .on('click', (event, data) => {
      const rect = event.target
      rect.classList.add('fill-gray-200')
      showTooltip(event, data)
      setTimeout(() => {
        hideTooltip()
        rect.classList.remove('fill-gray-200')
      }, 1000)
    })
}

const drawAxes = () => {
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

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

const initChart = async () => {
  const { data, fromDate, toDate } = await fetchData()
  document.getElementById('spinner').style.display = 'none'
  document.getElementById('chart-container').style.display = 'block'

  xScale.domain([fromDate, toDate])
  yScale.domain([0, d3.max(data, d => d[1])])

  drawBars(data)
  drawAxes()
}

initChart()
