let default_land_style = {
    color: 'black',
    outline_width: 2,
    outline_color: 'white',
    size: '12px',
    font: '"Verdana"',
    weight: 'normal',
    wrap: false,
};
let default_water_style = {
    color: 'blue',
    outline_width: 2,
    outline_color: 'white',
    size: '12px',
    font: '"Open Sans"',
    weight: 'normal',
    wrap: false,
};
let label_layers = {
    'Admin0 point': {                   // Country
        color: 'rgba(150,150,150,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '14px',
        font: '"Open Sans"',
        weight: 'bold',
        wrap: false,
    },
    'Admin1 area/label': {                   //State
        color: 'rgba(150,150,150,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '14px',
        font: '"Open Sans"',
        weight: 'bold',
        wrap: false,
    },
    'Admin1 forest or park/label': default_land_style,
    'Admin2 area/label': {                   // district/region
        color: 'rgba(100,100,100,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '14px',
        font: '"Open Sans"',
        weight: 'bold italic',
        wrap: true,
        special: [
            {
                'condition': ['resolution_below', 152.87],
                'change': [
                    ['size', '18px'],
                    ['color', 'rgba(100,100,100,0.5)']
                ]
            },
        ],
    },
    'Beach/label':{                   // district/region
        color: 'rgba(100,100,100,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '14px',
        font: '"Open Sans"',
        weight: 'bold italic',
        wrap: true,
    },
    'Continent': {                  //Continent
        color: 'rgba(150,150,150,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '16px',
        font: '"Open Sans"',
        weight: 'bold',
        wrap: true,
    },
    'City large scale': {                   // Small City
        color: 'rgba(80,80,80,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '10px',
        font: '"Open Sans"',
        weight: 'normal',
        wrap: false,
    },
    'City small scale': {                   // City
        color: 'rgba(80,80,80,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '10px',
        font: '"Open Sans"',
        weight: 'normal',
        wrap: false,
    },
    'Disputed label point': default_land_style,
    'Indigenous/label':default_land_style,
    'land': default_land_style,
    'Landform/label': {                   //Landform
        color: 'rgba(120,120,120,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '16px',
        font: '"Open Sans"',
        weight: 'bold italic',
        wrap: true,
    },
    'Marine area/label': {         //Ocean or large sea
        color: 'rgba(00,90,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '12px',
        font: 'Verdana',
        weight: 'italic',
        wrap: true,
        special: [
            {
                'condition':['label', [
                    'basin', ]
                ],
                'change': [
                    ['color', 'rgba(100,100,100,0.7)'],
                    ['weight', 'italic'],
                    ['font', '"Open Sans"']
                ]
            }
        ],
    },
    'Marine waterbody/label': {         //Ocean or large sea
        color: 'rgba(00,90,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '12px',
        font: 'Verdana',
        weight: 'italic',
        wrap: true,
        special: [
            {
                'condition': ['label', ['ocean',]],
                'change': [['size', '17px'],]
            },
        ],
    },
    'Ocean area/label': {              //Sea, basin, strait, or ridge
        color: 'rgba(40,100,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '11px',
        font: 'Verdana',
        weight: 'italic',
        wrap: true,
        special: [
            {
                'condition':['label', [
                    'basin', 'ridge', 'plain', 
                    'rise', 'trench', 'escarpment',
                    'plateau', 'seamount', 'bank', 
                    'banque', 'canyon', 'shoal',
                    'fracture zone', 'island', 'reef',
                    'ledge']
                ],
                'change': [
                    ['color', 'rgba(80,80,80,0.7)'],
                    ['weight', 'italic'],
                    ['font', '"Open Sans"']
                ]
            },
            {
                'condition': ['resolution_below', 4892], //resolutions[5].min_resolution
                'change': [
                    ['size', '16px']
                ]
            }
        ],
    },
    'Ocean point': {                //Bathy feature/depth
        color: 'rgba(0,0,0,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '10px',
        font: 'Verdana',
        weight: 'normal',
        wrap: false,
    },
    'Outdoors place': default_land_style,
    'Water area/label': {              //water body
        color: 'rgba(40,150,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '12px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
        special: [
            {
                'condition':['label', [
                    'basin', 'ridge', 'plain', 
                    'rise', 'trench', 'escarpment',
                    'plateau', 'seamount', 'bank', 
                    'banque', 'canyon', 'shoal',
                    'fracture zone', 'island', 'wetland', 
                    ' rock', ' marsh']
                ],
                'change': [
                    ['color', 'rgba(100,100,100,0.6)'],
                    ['weight', 'italic'],
                    ['font', '"Open Sans"']
                ]
            },
        ],
    },
    'Water area large scale': {              //small lake
        color: 'rgba(40,150,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '11px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water area large scale/label': {              //small lake
        color: 'rgba(40,100,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '12px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water area small scale/label': {              //large lake
        color: 'rgba(40,150,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '11px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water line': {              //river
        color: 'rgba(40,150,200,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '10px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water line/label': {              //river
        color: 'rgba(40,150,200,0.5)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '10px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water line large scale/label': {              //small river
        color: 'rgba(40,150,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '11px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water line medium scale/label': {              //large river
        color: 'rgba(40,150,200,0.7)',
        outline_width: 0,
        outline_color: 'rgba(0,0,0,0)',
        size: '11px',
        font: 'Verdana',
        weight: 'italic',
        wrap: false,
    },
    'Water line small scale/label': default_water_style,
    'Water point/Sea or ocean': default_water_style,
}

let resolutions = [
    {
        zoom: 0,
        min_resolution: 88270.96,
        max_resolution: Infinity,
        layers: [
            'Continent',
            'Marine waterbody/label'
        ]
    },
    {
        zoom: 1,
        min_resolution: 44135.48,
        max_resolution: 88270.96,
        layers: [
            'Continent',
            'Marine waterbody/label'
        ]
    },
    {
        zoom: 2,
        min_resolution: 39135.75,
        max_resolution: 44135.48,
        layers: [
            'Continent',
            'Marine waterbody/label'
        ]
    },
    {
        zoom: 3,
        min_resolution: 19567.87,
        max_resolution: 39135.75,
        layers: [
            'Continent',        //Continent
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
        ]
    },
    {
        zoom: 4,
        min_resolution: 9783.93,
        max_resolution: 19567.87,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
        ]
    },
    {
        zoom: 5,
        min_resolution: 4891.96,
        max_resolution: 9783.93,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'Water area small scale/label', //large lakes
        ]
    },
    {
        zoom: 6,
        min_resolution: 2445.98,
        max_resolution: 4891.96,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'Water area small scale/label', //large lakes
        ]
    },
    {
        zoom: 7,
        min_resolution: 1222.99,
        max_resolution: 2445.98,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'Water area small scale/label', //large lakes
        ]
    },
    {
        zoom: 8,
        min_resolution: 611.49,
        max_resolution: 1222.99,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'Water area small scale/label', //large lakes
            'Admin1 area/label',        //State
        ]
    },
    {
        zoom: 9,
        min_resolution: 305.74,
        max_resolution: 611.49,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'Water area small scale/label', //large lakes
            'Water line medium scale/label', //large rivers
            'Admin1 area/label',        //State
            'Marine area/label',        //Sounds
        ]
    },
    {
        zoom: 10,
        min_resolution: 152.87,
        max_resolution: 305.74,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'Water area small scale/label', //large lakes
            'Water line medium scale/label', //large rivers
            'Admin1 area/label',        //State
            'Marine area/label',        //Sounds
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 11,
        min_resolution: 76.43,
        max_resolution: 152.87,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City small scale', //City
            'City large scale',         //small city
            'Water area small scale/label', //large lakes
            'Water line medium scale/label', //large rivers
            'Admin1 area/label',        //State
            'Admin2 area/label',         //districts/regions
            'Landform/label',           //landforms
            'Marine area/label',        //Sounds
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 12,
        min_resolution: 38.21,
        max_resolution: 76.43,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'City large scale',         //small city
            'Admin1 area/label',        //State
            'Admin2 area/label',         //districts/regions
            'Landform/label',           //landforms
            'Marine area/label',        //Sounds
            'Water area/label',         // Water body
            'Water line/label',         // River
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 13,
        min_resolution: 19.10,
        max_resolution: 38.21,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'Admin1 area/label',        //State
            'Admin2 area/label',         //districts/regions
            'Landform/label',           //landforms
            'Marine area/label',        //Sounds
            'Water area/label',         // Water body
            'Water line/label',         // River
            'City large scale',         //small city
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 14,
        min_resolution: 9.55,
        max_resolution: 19.10,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'Admin1 area/label',        //State
            'Admin2 area/label',         //districts/regions
            'Landform/label',           //landforms
            'Marine area/label',        //Sounds
            'Water area/label',         // Water body
            'Water line/label',         // River
            'City large scale',         //small city
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 15,
        min_resolution: 4.777,
        max_resolution: 9.55,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'Admin1 area/label',        //State
            'Admin2 area/label',         //districts/regions
            'Landform/label',           //landforms
            'Marine area/label',        //Sounds
            'Water area/label',         // Water body
            'Water line/label',         // River
            'City large scale',         //small city
            'Beach/label',              //Beach
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 16,
        min_resolution: 2.022,
        max_resolution: 4.777,
        layers: [
            'Marine waterbody/label',   //Ocean
            'Admin0 point',     //Country
            'Ocean point',      //bathy feature/depth
            'Ocean area/label', //Sea
            'Admin1 area/label',        //State
            'Admin2 area/label',         //districts/regions
            'Landform/label',           //landforms
            'Marine area/label',        //Sounds
            'Water area/label',         // Water body
            'Water line/label',         // River
            'City large scale',         //small city
            'Beach/label',              //Beach
            'Water area large scale/label', //Small Lakes
        ]
    },
    {
        zoom: 17,
        min_resolution: 1.194,
        max_resolution: 2.388,  // 1.55422975
        layers: []
    },
    {
        zoom: 18,
        min_resolution: 0.597,
        max_resolution: 1.194,
        layers: []
    },
    {
        zoom: 19,
        min_resolution: 0,
        max_resolution: 0.597,
        layers: []
    },
]

/* 
    showDepth: Determine if a feature's "minzoom" is allowed to be displayed
        at the curent resolution
*/
let showDepth = function(resolution, minzoom) {
    if (resolution < 15) {
        return true;
    } else if (resolution <= 20) {
        return (minzoom <= 140 ? true : false); 
    } else if (resolution <= 25) {
        return (minzoom <= 130 ? true : false); 
    } else if (resolution <= 50) {
        return (minzoom <= 120 ? true : false); 
    } else if (resolution <= 150) {
        return (minzoom <= 110 ? true : false); 
    } else if (resolution <= 350) {
        return (minzoom <= 100 ? true : false); 
    } else if (resolution <= 750) {
        return (minzoom <= 90 ? true : false); 
    } else if (resolution <= 1400) {
        return (minzoom <= 80 ? true : false); 
    } else if (resolution <= 1500) {
        return (minzoom <= 70 ? true : false); 
    } else if (resolution <= 3000) {
        return (minzoom <= 60 ? true : false); 
    } else if (resolution <= 5000) {
        return (minzoom <= 50 ? true : false); 
    }
    return true;
}

/* 
    getFeatureName: Attempt to get an appropriate label from a feature
*/
let getFeatureName = function(feature) {
    let name = feature.get('_name');
    if (!name || name === undefined) {
        name = feature.get('_name_en');
    }
    if (!name || name === undefined) {
        name = feature.get('_name_global');
    }
    return name;
}

/*
    getResolutionLayers: Loop through the resolutions list to find which
        layers should be associated with the current resolution and
        return them.
*/
let getResolutionLayers = function(resolution) {
    for (let x of resolutions) {
        if (resolution < x.max_resolution && resolution >= x.min_resolution) {
            return x.layers;
        }
    }
    return [];
}

/*
    applySpecialStyle: If a style has some dependencies, read the
        definitions and apply as needed.
*/
let applySpecialStyle = function(label, resolution, style, rule) {
    let active = false;
    switch(rule.condition[0]) {
        case 'label':
            for (match of rule.condition[1]){
                if (label.toLowerCase().indexOf(match.toLowerCase()) >= 0){
                    active = true;
                }
            }
            break;
        case 'resolution_below':
            if (resolution < rule.condition[1]){
                active = true;
            }
            break;
        default:
            active = false;
    }
    if (active){
        for (change of rule.change) {
            style[change[0]] = change[1];
        }
    }
    return style;
};

/*
    buildOceanLabelStyle: Given a feature and the current map resolution,
        determine whether it should be displayed, apply a style
        and add it to the map.
*/
let buildOceanLabelStyle = function(feature, resolution) {
    let layer = feature.get('layer');
    let label = getFeatureName(feature);
    let minzoom = feature.get('_minzoom');
    let label_class = feature.get('_label_class');
    let visible_layers = getResolutionLayers(resolution);
    if (visible_layers.indexOf(layer) >= 0) {
        let style = structuredClone(label_layers[layer]);
        if (style.special) {
            for (rule of style.special) {
                style = applySpecialStyle(label, resolution, style, rule);
            }
        }
        if (style.wrap) {
            label = stringDivider(label, 12, '\n');
        }
        if(!showDepth(resolution, minzoom)) {
            // console.log('[BLOCKED] ' + layer + ' - ' + label + ' - ' + resolution + ' - mz: ' + minzoom);
            return null;
        }
        // console.log('[VISIBLE] ' + layer + ' - ' + label + ' - ' + resolution + ' - mz: ' + minzoom + '; cls: ' + label_class);
        return new ol.style.Text({
            text: label,
            font: style.weight + ' ' + style.size + ' ' + style.font,
            fill: new ol.style.Fill({
                color: style.color
            }),
            stroke: new ol.style.Stroke({
                color: style.outline_color,
                width: style.outline_width,
            }),
        });
    } 
    return null;
}

/*
    oceanLabelStyleFunction: Given a feature and a resolution,
        make all features invisible, then pass details on to build
        styles for the text labels
*/
let oceanLabelStyleFunction = function(feature, resolution) {
    let label_style = new ol.style.Style({
        stroke: new ol.style.Stroke({
            width: 1,
            color: 'rgba(255,0,0,0)'
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0,255,0,0)'
        }),
        text: buildOceanLabelStyle(feature, resolution)
    });
    return label_style;
}

// https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
function stringDivider(str, width, spaceReplacer) {
    if (str.length > width) {
      let p = width;
      while (p > 0 && str[p] != ' ' && str[p] != '-') {
        p--;
      }
      if (p > 0) {
        let left;
        if (str.substring(p, p + 1) == '-') {
          left = str.substring(0, p + 1);
        } else {
          left = str.substring(0, p);
        }
        const right = str.substring(p + 1);
        return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
      }
    }
    return str;
  }