import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const dataUrl =
  'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'

const chartWidth = 896
const chartHeight = 512
const chartPadding = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40
}

const fetchData = async (url = dataUrl) => await fetch(url).then(response => response.json())

async function getEmojiFlag(alpha3Code) {
  try {
    const [{ cca2: countryCode }] = await fetch(
      `https://restcountries.com/v3.1/alpha/${alpha3Code}`
    ).then(response => response.json())
    const codePoints = countryCode.split('').map(char => 127397 + char.charCodeAt())
    return String.fromCodePoint(...codePoints)
  } catch (error) {
    return alpha3Code
  }
}

const svg = d3
  .select('#chart-container')
  .append('svg')
  .attr('width', chartWidth)
  .attr('height', chartHeight)

const xScale = d3.scaleUtc().range([chartPadding.left, chartWidth - chartPadding.right])

const yScale = d3.scaleUtc().range([chartHeight - chartPadding.bottom, chartPadding.top])

const drawScatter = data => {
  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('data-xvalue', ({ Year }) => new Date(Year, 0).toISOString())
    .attr('data-yvalue', ({ Seconds }) => new Date(0, 0, 0, 0, 0, Seconds).toISOString())
    .attr('cx', ({ Year }) => xScale(new Date(Year, 0)))
    .attr('cy', ({ Seconds }) => yScale(new Date(0, 0, 0, 0, 0, Seconds)))
    .attr('r', 6)
    .attr(
      'class',
      ({ Doping }) =>
        (Doping
          ? 'stroke-2 stroke-red-400 fill-white hover:fill-red-400 cursor-pointer '
          : 'stroke-2 stroke-blue-500 fill-white hover:fill-blue-500 cursor-pointer ') + 'dot '
    )
    .on('mouseover', async (event, { Name, Nationality, Year, Time, Doping }) => {
      const emoji = await getEmojiFlag(Nationality)
      d3.select('#tooltip')
        .style('display', 'block')
        .attr('data-year', new Date(Year, 0).toISOString())
        .html(
          `${Name} ${emoji}<br/><b>Year:</b> ${Year}, <b>Time:</b> ${Time}${
            Doping ? `<br/><i>${Doping}</i>` : ''
          }`
        )
        .style('left', `${event.pageX + 20}px`)
        .style('top', `${event.pageY - 20}px`)
    })
    .on('mouseout', () => {
      d3.select('#tooltip').style('display', 'none')
    })
}

const drawLegend = () => {
  const legend = svg.append('g').attr('id', 'legend')
  const xPosition = chartWidth - chartPadding.right
  const yPosition = chartHeight / 2 - 20
  const radius = 6

  legend
    .append('circle')
    .attr('cx', xPosition)
    .attr('cy', yPosition)
    .attr('r', radius)
    .attr('class', 'stroke-2 stroke-blue-500 fill-white')

  legend
    .append('text')
    .attr('x', xPosition - radius * 2)
    .attr('y', yPosition + 4)
    .text('No doping allegations')
    .attr('text-anchor', 'end')
    .attr('class', 'text-xs')

  legend
    .append('circle')
    .attr('cx', xPosition)
    .attr('cy', yPosition + 24)
    .attr('r', radius)
    .attr('class', 'stroke-2 stroke-red-400 fill-white')

  legend
    .append('text')
    .attr('x', xPosition - radius * 2)
    .attr('y', yPosition + 28)
    .text('Riders with doping allegations')
    .attr('text-anchor', 'end')
    .attr('class', 'text-xs')
}

const drawAxes = () => {
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S')).ticks(10)

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
  const data = await fetchData()
  document.getElementById('spinner').style.display = 'none'
  document.getElementById('chart-container').style.display = 'block'

  xScale.domain([
    d3.min(data, ({ Year }) => new Date(Year - 1, 0)),
    d3.max(data, ({ Year }) => new Date(Year + 1, 0))
  ])

  yScale.domain([
    d3.max(data, ({ Seconds }) => new Date(0, 0, 0, 0, 0, Seconds)),
    d3.min(data, ({ Seconds }) => new Date(0, 0, 0, 0, 0, Seconds))
  ])

  drawScatter(data)
  drawLegend()
  drawAxes()
}

initChart()
