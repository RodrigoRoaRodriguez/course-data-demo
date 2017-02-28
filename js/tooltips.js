class Tooltip {
  constructor(){
    // Create the tooltip
    this.selection = d3.select('body').append('div').attr('class', 'tooltip')
    // Hide on creation and on click
    this.selection     
        .classed('hidden', true)
        .on('click', ()=> this.hide())

    
    console.log('A Tooltip has been created!')
  }
}
Tooltip.prototype.hide = function(){
    this.selection.classed('hidden', true)
}
Tooltip.prototype.show = function(){
    this.selection.classed('hidden', false)
}
Tooltip.prototype.update = function(node, bgColor = '#e91e63'){
    course = node.data
    this.selection.style('background-color', bgColor)
    this.selection.selectAll('*').remove()
    
    this.selection.append('a').attr('href', course.href)
    .attr('target','_blank')
        .append('h1').text(course.code)

    this.selection.append('h2').text(course.title)
    this.selection.append('p').html(course.info)
    this.show()

}



class TooltipedTreemap extends Treemap{
    constructor(rawData){
        super(rawData)
        this.tooltip = new Tooltip()
    }
}

TooltipedTreemap.prototype.appendToSVG = function(svg){
    Treemap.prototype.appendToSVG.call(this, svg)
    let tooltip = new Tooltip()
    
    svg.selectAll('g.course')
        .on('click', (d)=> tooltip.update(d, this.nodeColor(d)))
}