// Need to cofigure CORS to make this one work.
// let path = 'http://www.kth.se/api/kopps/v2/courses/'
let path = './data/'

let departments = [
    'DD',
    'DH',
    'DM'
    ]

// Load all JSON data asynchronously
let allJson = departments
    .map(department => fetch(`${path}${department}.json`))
    .map(promise => promise.then(file => file.json()))

// Once the data is loaded initialize the visualization
Promise.all(allJson).then(initialize)
    // .catch(e => console.error('Unable to load JSON data files'))
    
function initialize(departments){
    let courses = departments.map(dep => dep.courses) 
    let data = [].concat.apply([], courses)
    console.log(data)
    
    let treemap = new TooltipedTreemap(data)
    let svg = d3.select('svg#visualization')
    treemap.drawOnSVG(svg)
}

