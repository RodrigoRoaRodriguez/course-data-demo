/* Uncomment to use KOPPS API rather than local files.
let url = 'http://www.kth.se/api/kopps/v2/courses/'
// ALB and LA have been removed from the list because they have unescaped semicolons.
let departments = [ 'AAB', 'ADB', 'ADC', 'ADD', 'ADF', 'AEC', 'AFA', 'AFB', 'AFC', 'AFD', 'AFE', 'AFF', 'AFH', 'AFK', 'AFL', 'AFM', 'AG', 'AGB', 'AGC', 'AGF', 'AHB', 'AHD', 'AHE', 'AIB', 'AIC', 'AID', 'AIE', 'AKB', 'AKC', 'ALA', 'ALC', 'ALD', 'AMB', 'BA', 'BB', 'DA', 'DAG', 'DD', 'DH', 'DK', 'DL', 'DM', 'DME', 'DN', 'DO', 'DS', 'DT', 'ED', 'EF', 'EI', 'EK', 'EL', 'EM', 'EN', 'EO', 'EP', 'HA', 'HLA', 'HLF', 'HLK', 'HLL', 'HLM', 'HP', 'HPC', 'HPG', 'HPM', 'HPN', 'HSE', 'HSL', 'HSN', 'IA', 'ID', 'IDD', 'IE', 'IF', 'IFB', 'IG', 'IK', 'KA', 'KD', 'KE', 'KF', 'KH', 'KHB', 'KHD', 'LAC', 'LGC', 'LJ', 'LP', 'LPA', 'LPB', 'LS', 'MAC', 'MD', 'ME', 'MF', 'MG', 'MJEA', 'MJEC', 'ML', 'MV', 'SA', 'SD', 'SE', 'SF', 'SG', 'SH', 'SHB', 'SI', 'SIB', 'SK', 'SKB', 'UL' ]
*/
let url = './data/'

let departments = [
    'DD',
    'DH',
    'DM'
    ]

// Load all JSON data asynchronously
let allJson = departments
    .map(department => fetch(`${url}${department}.json`))
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
    treemap.appendToSVG(svg)
}

