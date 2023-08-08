/* global d3, topojson */

const USEducationData =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'
const USCountyData =
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json'

const chartWidth = 1024 - 75
const chartHeight = 640
const chartPadding = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40
}

const legendWidth = 256
const legendHeight = 10
const legendPosition = {
  top: 20,
  left: chartWidth / 3 + legendWidth
}

const colorPalette = [
  '#eff6ff', // blue-50
  '#dbeafe', // blue-100
  '#bfdbfe', // blue-200
  '#93c5fd', // blue-300
  '#60a5fa', // blue-400
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700
  '#1e40af' // blue-800
]

const fetchData = async (EducationDUrl = USEducationData, CountryUrl = USCountyData) => {
  const educationData = await fetch(EducationDUrl).then(response => response.json())
  const countryData = await fetch(CountryUrl).then(response => response.json())
  return {
    countiesData: topojson.feature(countryData, countryData.objects.counties).features,
    statesData: topojson.mesh(countryData, countryData.objects.states, (a, b) => a !== b),
    educationData
  }
}

const colorScale = d3
  .scaleThreshold()
  .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
  .range(colorPalette)

const showTooltip = ({ clientX, clientY }, { bachelorsOrHigher, area_name, state }) => {
  const tooltip = d3.select('#tooltip')

  const screenWidth =
    window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

  let translateX = clientX + 10
  const translateY = clientY + window.scrollY - 28

  const tooltipWidth = 144
  const tooltipTotalWidth = translateX + tooltipWidth + chartPadding.right

  if (tooltipTotalWidth > screenWidth) translateX = clientX - tooltipWidth - 10

  tooltip
    .style('display', 'block')
    .style('transform', `translate(${translateX}px,${translateY}px)`)
    .attr('data-education', bachelorsOrHigher || 0)
    .html(`${area_name}, <b>${state}</b>: <i>${bachelorsOrHigher || 0}%</i>`)
}

const hideTooltip = () => {
  d3.select('#tooltip').style('display', 'none')
}

const svg = d3
  .select('#chart-container')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight)

const drawMap = (countiesData, statesData, educationData) => {
  const path = d3.geoPath()

  const findItem = id => {
    const [result] = educationData.filter(({ fips }) => fips === id)
    return result ? result : 0
  }

  svg
    .append('g')
    .selectAll('path')
    .data(countiesData)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', ({ id }) => colorScale(findItem(id).bachelorsOrHigher || 0))
    .attr('class', 'hover:fill-blue-900 cursor-pointer county')
    .attr('data-fips', ({ id }) => id)
    .attr('data-education', ({ id }) => findItem(id).bachelorsOrHigher || 0)
    .on('mouseover', (event, { id }) => showTooltip(event, findItem(id)))
    .on('mouseout', hideTooltip)

  svg.append('path').datum(statesData).attr('d', path).attr('class', 'stroke-white fill-none')
}

const drawLegend = () => {
  // FIXME: Personally, I think this is a complicated way to do it, we exclude first and last element
  const colorDomain = colorScale.domain()

  const legendScale = d3.scaleBand().range([0, legendWidth]).domain(colorDomain).padding(1)

  const legendAxis = d3
    .axisBottom(legendScale)
    .tickValues(colorDomain)
    .tickFormat(d => `${Math.round(d)}%`)

  svg
    .append('g')
    .attr('transform', `translate(${legendPosition.left},${legendHeight + legendPosition.top})`)
    .call(legendAxis)

  const data = colorPalette.map(color => colorScale.invertExtent(color))

  svg
    .append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${legendPosition.left},${legendPosition.top})`)
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

const initChart = async () => {
  const { countiesData, statesData, educationData } = await fetchData()
  document.getElementById('spinner').style.display = 'none'
  document.getElementById('chart-container').style.display = 'block'

  drawMap(countiesData, statesData, educationData)
  drawLegend()
}

initChart()
