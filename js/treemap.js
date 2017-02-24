class Treemap {
  constructor(rawData) {
    // Preprocess data to make credits numeric
    const data = rawData.map(course => {
      course.credits = (course.credits || '').replace(',', '.')
      return course
    })

    // The lines below make structured that data into a hierarchical datatype
    const makeNested = d3.nest()
      .key(course => course.code.substring(0, 2))
      .key(course => course.level)

    const NestedData = makeNested.entries(data)

    const root = {
      key: 'School of Computer Science and Communication',
      values: NestedData,
    }

    const hierarchicalData = d3.hierarchy(root, d => d.values)
      .sum(d => d.credits)
      .sort((a, b) => b.credits - (a.credits))

    // The layout adds the info necessary to draw the treemap
    const makeTreemap = d3.treemap()
      .size([1000, 563])
      .paddingInner([2.5])
      .padding([.5])

    // Actually store the data
    this.treemapData = makeTreemap(hierarchicalData, d => d.credits)

    //  
    this.colorScale = d3.scaleOrdinal(d3.schemeCategory10)
  }
  static nodeWidth(d) {
    return d.x1 - d.x0
  }
  static nodeHeight(d) {
    return d.y1 - d.y0
  }
  static isNodeOblong(d) {
    const NOT_SQUARISH_FACTOR = 1.3;
    return Treemap.nodeHeight(d) > Treemap.nodeWidth(d) * NOT_SQUARISH_FACTOR
  }
}

Treemap.prototype.nodeColor = function (node) {
  return this.colorScale(node.data.code.substring(0, 2))
}

Treemap.prototype.drawOnSVG = function (svg) {
  // Configure Zoom
  let zoomLayer = svg.append('g');
  let zoom = d3.zoom()
    .scaleExtent([-Infinity, Infinity])
    .on('zoom', () => zoomLayer.attr('transform', d3.event.transform))

  svg.call(zoom)

  //Actually draw the treemap
  const perCourse = zoomLayer.selectAll('g.course')
    .data(this.treemapData.leaves())
    .enter().append('g')
    .attr('class', 'course')
    .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')

  const rectangles = perCourse.append('rect')
    .attr('id', d => d.data.key)
    .attr('width', Treemap.nodeWidth)
    .attr('height', Treemap.nodeHeight)
    .attr('fill', d => this.nodeColor(d))
  
  let self = this // Use closure to access previous context
  rectangles
    .on('mouseover', function (d) {
      d3.select(this)
        .attr('fill', d => d3.color(self.nodeColor(d)).brighter())
    })
    .on('mouseout', function (d) {
      d3.select(this)
        .attr('fill', d => self.nodeColor(d))
    })

  const labels = perCourse.append('text')

  const narrow = labels.filter(Treemap.isNodeOblong)
  const thick = labels.filter(d => !Treemap.isNodeOblong(d))

  narrow
    .attr('transform', d => `rotate(90) translate(0 ${-Treemap.nodeWidth(d)})`)
    .style('font-size', d => Math.min(
      Treemap.nodeWidth(d) / 1.25,
      Treemap.nodeHeight(d) / 4.5))

  thick
    .style('font-size', d => Math.min(
      Treemap.nodeWidth(d) / 4.5,
      Treemap.nodeHeight(d) / 1.25))


  labels.append('tspan')
    .attr('dy', '1em')
    .attr('x', '.2em')
    .style('font-weight', 'bold')
    .text(d => d.data.code)
}