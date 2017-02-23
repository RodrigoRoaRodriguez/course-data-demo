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
    return Treemap.nodeHeight(d) > Treemap.nodeWidth(d)
  }
}

Treemap.prototype.drawOnSVG = function(svg) {
  let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  let perCourse = svg.selectAll('g')
    .data(this.treemapData.leaves())
    .enter().append('g')
    .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')


  perCourse.append('rect')
    .attr('id', d => d.data.key)
    .attr('width', Treemap.nodeWidth)
    .attr('height', Treemap.nodeHeight)
    .attr('fill', d => colorScale(d.data.code.substring(0,2)))

  let labels = perCourse.append('text')

  labels.filter(Treemap.isNodeOblong);
  // .attr('transform','rotate(90)')  

  labels.append('tspan')
    .attr('dy', '1em')
    // .attr('dy', '-.2em')
    .attr('x', '.2em')
    .style('font-weight', 'bold')
    .style('font-size', d => Math.min(Treemap.nodeWidth(d)/5, Treemap.nodeHeight(d)/1.25))
    .text(d => d.data.code)

  //   labels.selectAll('tspan.time').data(d=>d.data.time.split('–')).enter()
  //     .append('tspan')
  //     .attr('class', 'time')
  //     .attr('dy', '1em')
  //     .attr('x', 12)
  //     .style('font-size', 11)
  //     .text(d=>d)
}