fetch('/data/gem31122019flaechen.geojson', {
    method: 'GET'
})
.then((response) => {
    return response.json()
})
.then((data) => {
    addData(data);
})
.catch(function (error) {
    console.log(error);
})


const map = L.map('map', {
        maxZoom: 13
    }).setView([54.7836, 9.4321], 13);

let prevLayerClicked = null;

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map)


let geocoder = L.Control.Geocoder.nominatim()

if (typeof URLSearchParams !== 'undefined' && location.search) {
    // parse /?geocoder=nominatim from URL
    let params = new URLSearchParams(location.search)
    let geocoderString = params.get('geocoder')

    if (geocoderString && L.Control.Geocoder[geocoderString]) {
        console.log('Using geocoder', geocoderString)
        geocoder = L.Control.Geocoder[geocoderString]()
    } else if (geocoderString) {
        console.warn('Unsupported geocoder', geocoderString)
    }
}

const osmGeocoder = new L.Control.geocoder({
    query: 'Flensburg',
    position: 'topright',
    placeholder: 'Adresse oder Ort',
    defaultMarkGeocode: false
}).addTo(map)


osmGeocoder.on('markgeocode', e => {
    const bounds = L.latLngBounds(e.geocode.bbox._southWest, e.geocode.bbox._northEast)
    map.fitBounds(bounds, {padding: [200, 200]})
})


let layerStyle = {
    default: {
        color: '#fff',
        fillColor: '#002db4',
        fillOpacity: 0.7,
        opacity: 0.6,
        weight: 1
    },
    click: {
        color: '#fff',
        fillColor: '#002db4',
        fillOpacity: 0.4,
        opacity: 0.8,
        weight: 4
    }
}


function onMapClick(e) {
    const bounds = L.latLngBounds(e.target._bounds._southWest, e.target._bounds._northEast)
    map.fitBounds(bounds, {padding: [200, 200]})

    const dataArray = []
    const infoArray = []
    const unitArray = []

    infoArray.push('Waldfläche')
    infoArray.push('Landwirtschaftsfläche')
    infoArray.push('Verkehrsfläche')
    infoArray.push('Siedlungs- und Verkehrsfläche¹')
    infoArray.push('Siedlungs- und Verkehrsfläche¹')

    dataArray.push(e.target.feature.properties.a)
    dataArray.push(e.target.feature.properties.b)
    dataArray.push(e.target.feature.properties.c)
    dataArray.push(e.target.feature.properties.d)
    dataArray.push(e.target.feature.properties.e)

    unitArray.push('%')
    unitArray.push('%')
    unitArray.push('%')
    unitArray.push('%')
    unitArray.push('m²/Kopf')

    const h2 = document.createElement('h2')
    h2.innerHTML = e.target.feature.properties.f
    h2.classList.add('text-2xl')
    h2.classList.add('font-bold')
    h2.classList.add('px-3')
    h2.classList.add('py-2')

    const list = document.createElement('ul')

    const small = document.createElement('small')
    small.classList.add('p-3')
    small.innerHTML = '¹ Ohne Bergbaubetrieb sowie Tagebau, Grube, Steinbruch'
    small.classList.add('inline-block')
    
    list.classList.add('p-3')

    for (let i = 0; i < dataArray.length; i++) {
        const item = document.createElement('li')
        const entry = `<p>${infoArray[i]}</p><strong>${dataArray[i]} ${unitArray[i]}</strong>`

        item.classList.add('mb-2')
        item.innerHTML = entry
        list.appendChild(item)
    }

    const details = document.getElementById('details')
    details.innerHTML = ''
    details.appendChild(h2)
    details.appendChild(list)
    details.appendChild(small)
    details.classList.add('mb-4')
    
    e.preventDefault
}


function onEachFeature(feature, layer) {
    const label = feature.properties.f

    layer.on('click', function(e) {
        e.target.setStyle(layerStyle.click);

        if (prevLayerClicked !== null) {
            prevLayerClicked.setStyle(layerStyle.default);
        }
        
        const layer = e.target;
        prevLayerClicked = layer;
        
        onMapClick(e)
    })

    layer.bindTooltip(label, {
        permanent: false,
        direction: 'top'
    }).openTooltip()
}


function addData(data) {
    const layer = L.geoJson(data, {
        style: layerStyle.default,
        onEachFeature: onEachFeature
    }).addTo(map)

    map.fitBounds(layer.getBounds(), {padding: [0, 0, 0, 0]})
}
