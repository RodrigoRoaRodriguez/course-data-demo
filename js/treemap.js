class Treemap {
  constructor(rawData) {
    // Preprocess data to make credits numeric
    const data = rawData.map(course => {
      course.credits = (course.credits || '').replace(',', '.')
      return course
    })

    // The lines below make structured that data into a hierarchical datatype
    const makeNested = d3.nest()
      .key(course=> course.code.substring(0,2))
      // .key(course => course.level)

    const NestedData = makeNested.entries(data)

    const root = {
      key: 'School of Computer Science and Communication',
      values: NestedData,
    }

    const hierarchicalData = d3.hierarchy(root, d => d.values)
      .sum(d => d.credits)
      .sort((a, b) => b.credits - (a.credits))

    // The layout adds the info necessary to draw the treemap
    const makeTreemap = d3.treemap().size([400, 200]).padding([2])

    // Actually store the data
    this.treemapData = makeTreemap(hierarchicalData, d => d.credits)
    console.log(this.treemapData)
  }
  static nodeWidth(d) {
    return d.x1 - d.x0
  }
  static nodeHeight(d) {
    return d.y1 - d.y0
  }
  static isNodeOblong(d) {
    const NOT_SQUARISH_FACTOR = 1.3;
    return Treemap.nodeHeight(d) > Treemap.nodeWidth(d)*NOT_SQUARISH_FACTOR 
  }
}

Treemap.prototype.drawOnSVG = function(svg) {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  const perCourse = svg.selectAll('g')
    .data(this.treemapData.leaves())
    .enter().append('g')
    .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')


  perCourse.append('rect')
    .attr('id', d => d.data.key)
    .attr('width', Treemap.nodeWidth)
    .attr('height', Treemap.nodeHeight)
    .attr('fill', d => colorScale(d.data.code.substring(0,2)))

  const labels = perCourse.append('text')

  const narrow = labels.filter(Treemap.isNodeOblong)
  const thick = labels.filter(d=>!Treemap.isNodeOblong(d))
  
  narrow
    .attr('transform', d => `rotate(90) translate(0 ${-Treemap.nodeWidth(d)})`)
    .style('font-size', d => Math.min(
      Treemap.nodeWidth(d)/1.25, 
      Treemap.nodeHeight(d)/5))
  
  thick
    .style('font-size', d => Math.min(
      Treemap.nodeWidth(d)/5, 
      Treemap.nodeHeight(d)/1.25))


  labels.append('tspan')
    .attr('dy', '1em')
    // .attr('dy', '-.2em')
    .attr('x', '.2em')
    .style('font-weight', 'bold')
    .text(d => d.data.code)

  //   labels.selectAll('tspan.time').data(d=>d.data.time.split('–')).enter()
  //     .append('tspan')
  //     .attr('class', 'time')
  //     .attr('dy', '1em')
  //     .attr('x', 12)
  //     .style('font-size', 11)
  //     .text(d=>d)
}