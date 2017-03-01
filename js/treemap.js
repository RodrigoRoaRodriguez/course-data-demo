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
            key: 'All Courses',
            values: NestedData,
        }

        const hierarchicalData = d3.hierarchy(root, d => d.values)
            .sum(d => d.credits)
            .sort((a, b) => b.data.credits - a.data.credits)

        // The layout adds the info necessary to draw the treemap
        const makeTreemap = d3.treemap()
            .size([100, 50])
            .paddingInner([.5])
            .padding([.05])
            .tile(d3.treemapResquarify)

        // Actually store the data
        this.treemapData = makeTreemap(hierarchicalData, d => d.credits)

        // 
        this.colorScale = d3.scaleOrdinal(d3.schemeCategory10)

        this.transition = d3.transition() 
            .duration(500)
            .ease(d3.easeLinear)
    }
    static nodeWidth(node) {
        return node.x1 - node.x0
    }
    static nodeHeight(node) {
        return node.y1 - node.y0
    }
    static isNodeOblong(node) {
        const NOT_SQUARISH_FACTOR = 2.5
        return Treemap.nodeHeight(node) > Treemap.nodeWidth(node) * NOT_SQUARISH_FACTOR
    }
    static nodeId(node) {
        return node.data.key || node.data.code
    }

}

Treemap.prototype.nodeColor = function (node) {
    // If parent: node.data.key, if leaf: node.data.code
    let str = Treemap.nodeId(node)
    return this.colorScale(str.substring(0, 2))
}

Treemap.prototype.attachZoom = function (svg, onZoom) {
    // TODO extract zoom to its own independent class
    // Append zoom label
    let zoomLabel = d3.select('body').append('h3').attr('id', 'zoom-label')
    // Configure Zoom
    let zoomLayer = svg.append('g').attr('id', 'zoom-layer')

    let zoom = d3.zoom()
        .scaleExtent([.5, 100])
        .on('zoom', () => {
            zoomLabel.text('x' + d3.event.transform.k.toPrecision(2))
            zoomLayer.attr('transform', d3.event.transform)
            onZoom(d3.event.transform)
        })

    svg.call(zoom)

    const initialZoom = d3.zoomIdentity
    // Do not take the whole width, only 90%
    initialZoom.k = .9
    // Center visualization, 10% = 5 on each side
    initialZoom.x = (1 - initialZoom.k) * 100 / 2

    svg.call(zoom.transform, initialZoom)

    return zoomLayer
}

Treemap.prototype.onZoom = function(transform){
        let k = transform.k
        // TODO refactor to eliminate level hard-coding
        this.zoomLevel = k > 2 ? 3 : k > 1.5 ? 2 : k > 0.75 ? 1 : 0
        // Only redraw if svg container is already defined
        this.svgContainer && this.draw()
    }

Treemap.prototype.appendToSVG = function (svg) {
    this.svgContainer = this.attachZoom(svg, (t) => this.onZoom(t))
    this.draw()
}

Treemap.prototype.draw = function(){
    // DATA BINDING
    // Existing data elements
    const update = this.svgContainer.selectAll('g.course')
        .data(this.treemapData.descendants().filter(d=>d.depth == this.zoomLevel), Treemap.nodeId)
        // Probably we well use the line below when we have a proper API
        // .data(this.treemapData.leaves(), Treemap.nodeId)

    // New data elements
    const enter = update.enter().append('g').attr('class', 'entering')
        
    enter.style('fill-opacity', 0) // start transparent
        .transition(this.transition) //Animate it so that you see what happens
        .style('fill-opacity', 1) // Fade in
        .attr('class', 'course')
        
    // Old data elements
    const exit = update.exit()

    // ACTUALLY DRAW THE TREEMAP

    enter.attr('transform', d => 'translate(' + d.x0 + ',' + d.y0 + ')')

 

    const rectangles = enter.append('rect')
        .attr('id', Treemap.nodeId)
        .attr('width', Treemap.nodeWidth)
        .attr('height', Treemap.nodeHeight)
        .attr('fill', d => this.nodeColor(d)) 

    let self = this // Use closure to access previous context

    if(this.zoomLevel === 3){
    rectangles
        .on('mouseover', function (d) {
            d3.select(this)
                .attr('fill', d => d3.color(self.nodeColor(d)).brighter())
        })
        .on('mouseout', function (d) {
            d3.select(this)
                .attr('fill', d => self.nodeColor(d))
        })
    }

    const labels = enter.append('text')
    const narrow = labels.filter(Treemap.isNodeOblong)
    const thick = labels.filter(d => !Treemap.isNodeOblong(d))

    thick
        .style('font-size', d => Math.min(
            Treemap.nodeWidth(d) / Treemap.nodeId(d).length,
            Treemap.nodeHeight(d) / 1.25))
            
    narrow
        .attr('transform', d => `rotate(90) translate(0 ${-Treemap.nodeWidth(d)})`)
        .style('font-size', d => Math.min(
            Treemap.nodeWidth(d) / 1.25,
            Treemap.nodeHeight(d) / Treemap.nodeId(d).length))



    labels.append('tspan')
        .attr('dy', '1em')
        .attr('x', '.2em')
        .style('font-weight', 'bold')
        .text(Treemap.nodeId)

    // Fade away old elements and then remove them.
    exit
        .attr('class', 'exiting')
        .transition(this.transition) //Animate it so that you see what happens
        .style('fill-opacity', 0) // Fade away
        .remove()
}