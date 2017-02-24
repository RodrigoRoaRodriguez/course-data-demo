class Tooltip {
  constructor(){
    this.selection = d3.select('body').append('div').attr('class', 'tooltip')
    .classed('hidden', true)
    console.log('A Tooltip has been created!')
  }
}
Tooltip.prototype.hide = function(){
    this.selection.classed('hidden', true)
}
Tooltip.prototype.show = function(){
    this.selection.classed('hidden', false)
}


class TooltipedTreemap extends Treemap{
    constructor(rawData){
        super(rawData)
        this.tooltip = new Tooltip()
    }
}

TooltipedTreemap.prototype.drawOnSVG = function(svg){
    Treemap.prototype.drawOnSVG.call(this, svg)
    let tooltip = new Tooltip()
    
    svg.selectAll('g.course')
        .on('click', d=> console.log(d))
}