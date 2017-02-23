class Tooltip {
  constructor(){
    this.div = d3.select('body').append('div').attr('class', 'tooltip')
    .classed('hidden', true)
    console.log('A Tooltip has been created!')
  }
}

class TooltipedTreemap extends Treemap{
    constructor(rawData){
        super(rawData)
        let tooltip = new Tooltip()
    }
}

TooltipedTreemap.prototype.drawOnSVG = function(svg){
    Treemap.prototype.drawOnSVG.call(this, svg)
    svg.selectAll('g.course')
        // .on('click')_
}