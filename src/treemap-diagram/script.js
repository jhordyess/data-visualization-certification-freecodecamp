import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm'

const sources = {
  game: {
    key: 'game',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json',
    title: 'Video Game Sales 🎮',
    description: 'Top 100 Most Sold Video Games Grouped by Platform',
    categoryName: 'Platform',
    valueName: 'Sales'
    // valueUnit:"Billions of units sold" 🤔 FIXME
  },
  movie: {
    key: 'movie',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json',
    title: 'Movie Sales 🎥',
    description: 'Top 100 Highest Grossing Movies Grouped By Genre',
    categoryName: 'Genre',
    valueName: 'Revenue'
    // valueUnit:"Billions of dollars" 🤔 FIXME
  },

  kickstarter: {
    key: 'kickstarter',
    url: 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json',
    title: 'Kickstarter Pledges 🏦💰',
    description: 'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    categoryName: 'Category',
    valueName: 'Pledged'
    // valueUnit:"Millions of dollars" 🤔 FIXME
  }
}

let source = sources.game

const { search } = new URL(window.location.href)
const params = new URLSearchParams(search)

if (params.has('data')) {
  const data = params.get('data')
  if (sources[data]) source = sources[data]
}
// --------------------------------------------

const chartWidth = 1024 - 75
const chartHeight = 640
const chartPadding = {
  top: 20,
  right: 20,
  bottom: 30,
  left: 40
}

const fetchData = async (url = source.url) => await fetch(url).then(response => response.json())

const colorScale = d3.scaleOrdinal().range(d3.schemeTableau10)

const container = d3.select('#chart-container')
const svg = container.append('svg').attr('width', chartWidth).attr('height', chartHeight)

const drawElements = () => {
  document.getElementById('title').innerHTML = source.title
  document.getElementById('description').innerHTML = source.description
  document.getElementById(source.key + 'Link').style.color = '#2563eb'
}

const showTooltip = ({ clientX, clientY }, { name, category, value }) => {
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
    .attr('data-value', value)
    .html(
      `${name}<br /><b>${source.categoryName}:</b> ${category}<br /><b>${source.valueName}:</b> ${value}`
    )
}

const hideTooltip = () => d3.select('#tooltip').style('display', 'none')

const drawMap = data => {
  const treemap = d3.treemap().size([chartWidth, chartHeight])
  const root = treemap(
    d3
      .hierarchy(data)
      .eachBefore(({ data, parent }) => {
        data.id = (parent ? parent.data.id + '.' : '') + data.name
      })
      .sum(({ value }) => value)
      .sort((a, b) => b.height - a.height || b.value - a.value)
  )

  const leaf = svg
    .selectAll('g')
    .data(root.leaves())
    .enter()
    .append('g')
    .attr('transform', ({ x0, y0 }) => `translate(${x0},${y0})`)
    .on('mousemove', (event, data) => showTooltip(event, data.data))
    .on('mouseout', hideTooltip)

  leaf
    .append('rect')
    .attr('class', 'tile')
    .attr('width', ({ x1, x0 }) => x1 - x0)
    .attr('height', ({ y1, y0 }) => y1 - y0)
    .attr('stroke', 'white')
    .attr('fill', ({ data: { category } }) => colorScale(category))
    .attr('data-name', ({ data: { name } }) => name)
    .attr('data-category', ({ data: { category } }) => category)
    .attr('data-value', ({ data: { value } }) => value)

  leaf
    .append('foreignObject')
    .attr('class', 'cursor-pointer')
    .attr('width', ({ x1, x0 }) => x1 - x0)
    .attr('height', ({ y1, y0 }) => y1 - y0)
    .append('xhtml:div')
    .attr('class', 'max-w-full max-h-full p-1 text-xs overflow-hidden overflow-ellipsis')
    .html(({ data: { name } }) => name)

  return root.leaves()
}

const getCategoriesSorted = leaves => {
  const categories = leaves.map(({ data: { category } }) => category)
  return categories.filter((category, index, self) => self.indexOf(category) === index)
}

const drawLegend = categories => {
  const cols = 3
  const rows = Math.ceil(categories.length / cols)
  const legendWidth = chartWidth / 2
  const legendItem = {
    height: 24,
    width: legendWidth / cols,
    padding: 8
  }
  const legendHeight = legendItem.height * rows

  const general = container
    .append('svg')
    .attr('id', 'legend')
    .style('margin', `${legendItem.padding}px auto -${legendItem.padding}px`)
    .attr('width', legendWidth)
    .attr('height', legendHeight)
    .selectAll('g')
    .data(categories)
    .enter()
    .append('g')
    .attr('transform', (_, i) => {
      const x = (i % cols) * legendItem.width
      const y = Math.floor(i / cols) * legendItem.height
      return `translate(${x},${y})`
    })

  general
    .append('rect')
    .attr('class', 'legend-item')
    .attr('width', 16)
    .attr('height', 16)
    .attr('fill', data => colorScale(data))

  general
    .append('text')
    .attr('class', 'text-xs')
    .attr('x', 16 + 4)
    .attr('y', 16 - 2)
    .text(data => data)
}

const initChart = async () => {
  const data = await fetchData()
  document.getElementById('spinner').style.display = 'none'
  document.getElementById('chart-container').style.display = 'block'

  drawElements()

  const leaves = drawMap(data)

  drawLegend(getCategoriesSorted(leaves))
}

initChart()
