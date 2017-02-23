function Treemap(data){
  // The lines below make structured that data into a hierarchical datatype
  let makeNested = d3.nest()
    .key(course => course.level)
    .key(course=> course.code.substring(0,2))
  let NestedData = makeNested.entries(data)

  let root = {
    key: 'School of Computer Science and Communication',
    values: NestedData,
  }
  let creds = course => +(course.credits||'').replace(',','.')
  let hierarchicalData = d3.hierarchy(root, d=>d.values)
  .sum(d=>creds(d))
  .sort((a,b)=>creds(b)-(creds(a)))

  // The layout adds the info necessary to draw the treemap
  let makeTreemap = d3.treemap().size([400,200]).padding([2])
  this.treemapData = makeTreemap(hierarchicalData, d=>creds(d))
  console.log(this.treemapData)

  this.drawOnSVG = (svg) =>{
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10)
    let perCourse = svg.selectAll('g')
        .data(this.treemapData.leaves())
        .enter().append('g')
          .attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')


    perCourse.append('rect')
        .attr('id', d => d.data.key)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0)
        .attr('fill', d=>colorScale(d.parent.data.key))

    let labels = perCourse.append('text')

    // labels.append('tspan')
    //   .attr('dy', '1em')
    //   .attr('x', 1)
    //   .style('font-weight', 'bold')
    //   .text(d=>d.parent.data.key)

  //   labels.selectAll('tspan.time').data(d=>d.data.time.split('–')).enter()
  //     .append('tspan')
  //     .attr('class', 'time')
  //     .attr('dy', '1em')
  //     .attr('x', 12)
  //     .style('font-size', 11)
  //     .text(d=>d)
  }
}