// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require_tree .

// setup
dojo.require("esri.map");
dojo.require("dojo.on");
dojo.require("dojo.dom");
dojo.require("esri.layers.FeatureLayer");
dojo.require("esri.tasks.query");
dojo.require("esri.geometry.Extent");


// public vars
var map;
var heatLayer;
var heatData;
var uavCk, bfCk, civCk;
var uavEnabled, bfEnabled, civEnabled;
//var bfHeatLayer, civHeatLayer, uavHeatLayer;
var bfData, civData, uavData;
var refreshInterval = 0.25;

function init_gismap() {
    console.info("Building the map object");

    map = new esri.Map("map", {
        basemap: "topo",
        center: [-118.4167, 33.3833],
        zoom: 11
    });

    map.on("load", onMapLoaded);
}

function init_heatmaps() {
    console.info("Building heatmap");

    require(["application/HeatmapLayer"], function(HeatmapLayer){
        // aggregate heat layer
        heatLayer = new HeatmapLayer({
            config: {
                "useLocalMaximum": true,
                "radius": 40,
                "gradient": {
                    0.45: "rgb(255,000,000)",
                    0.55: "rgb(255,063,063)",
                    0.65: "rgb(255,127,127)",
                    0.95: "rgb(255,191,191)",
                    1.00: "rgb(255,255,255)"
                }
            },
            "map": map,
            "opacity": 0.9
        }, "heatLayer");

        //0.45: "rgb(000,000,255)",
        //    0.55: "rgb(000,255,255)",
        //    0.65: "rgb(000,255,000)",
        //    0.95: "rgb(255,255,000)",
        //    1.00: "rgb(255,000,000)"

        //// UAV heatmap layer
        //uavHeatLayer = new HeatmapLayer({
        //    config: {
        //        "useLocalMaximum": true,
        //        "radius": 40,
        //        "gradient": {
        //            0.45: "rgb(255,191,191)",
        //            0.55: "rgb(255,143,143)",
        //            0.65: "rgb(255,095,095)",
        //            0.95: "rgb(255,047,047)",
        //            1.00: "rgb(255,000,000)"
        //        }
        //    },
        //    "map": map,
        //    "opacity": 0.75
        //}, "uavHeatLayer");
        //
        //// civilian heatmap layer
        //civHeatLayer = new HeatmapLayer({
        //    config: {
        //        "useLocalMaximum": true,
        //        "radius": 40,
        //        "gradient": {
        //            0.45: "rgb(191,255,191)",
        //            0.55: "rgb(143,255,143)",
        //            0.65: "rgb(095,255,095)",
        //            0.95: "rgb(047,255,047)",
        //            1.00: "rgb(000,255,000)"
        //
        //        }
        //    },
        //    "map": map,
        //    "opacity": 0.75
        //}, "civHeatLayer");
        //
        //// BLUEFOR heatmap layer
        //bfHeatLayer = new HeatmapLayer({
        //    config: {
        //        "useLocalMaximum": true,
        //        "radius": 40,
        //        "gradient": {
        //            0.45: "rgb(191,191,255)",
        //            0.55: "rgb(143,143,255)",
        //            0.65: "rgb(095,095,255)",
        //            0.95: "rgb(047,047,255)",
        //            1.00: "rgb(000,000,255)"
        //        }
        //    },
        //    "map": map,
        //    "opacity": 0.75
        //}, "bfHeatLayer");
    });

    //map.addLayers( [civHeatLayer, bfHeatLayer, uavHeatLayer] );
    map.addLayer(heatLayer);
}

function onMapLoaded() {
    console.info("Loading the map layers...");

    // setup check boxes
    uavCk = document.getElementById("uavDataCk");
    bfCk = document.getElementById("bfDataCk");
    civCk = document.getElementById("civDataCk");
    uavEnabled = true;
    bfEnabled = true;
    civEnabled = true;

    // setup scenario data
    setupScenarioLayers();

    // setup heatmap data sources
    setupHeatmapSources();

    // setup heatmap layers
    init_heatmaps();

    map.on("extent-change", onUpdateHeatmapSources);

    // force a load of the heatmap
    onUpdateHeatmapSources();

    console.info("Done loading layers");
}

function onUpdateHeatmapSources() {
    console.info("Map extent changed");

    // update all the heatmaps
    heatLayer.setData([]);
    heatData = [];

    if(civEnabled) { queryFeatureSource(civData); }

    if(bfEnabled) { queryFeatureSource(bfData); }

    if(uavEnabled) { queryFeatureSource(uavData); }
}

function queryFeatureSource(featureSource) {
    var q = new esri.tasks.Query();
    q.geometry = map.extent;
    q.where = "1=1";
    q.outSpatialReference = map.spatialReference;

    featureSource.queryFeatures(q, onQueryResults);

    //featureSource.queryFeatures(q, function(results) {
    //    console.info("Feature query returned: " + results.features.length);
    //    if(results && results.features && results.features.length) {
    //        data = results.features;
    //    }
    //});
}

function onQueryResults(results) {
    var data = [];

    console.info("Feature query returned: " + results.features.length);
    if(results && results.features && results.features.length) {
        data = results.features;
    }

    heatData = heatData.concat(data);

    console.info("Total heatmap data features: " + heatData.length);

    heatLayer.setData(heatData);
}

function setupHeatmapSources() {
    uavData = getHeatmapFeatures("http://services3.arcgis.com/NrpPlfAhywDH1hrg/arcgis/rest/services/Blue_Red/FeatureServer/0");
    bfData = getHeatmapFeatures("http://services3.arcgis.com/NrpPlfAhywDH1hrg/arcgis/rest/services/Blue_Force/FeatureServer/0");
    civData = getHeatmapFeatures("http://services3.arcgis.com/NrpPlfAhywDH1hrg/arcgis/rest/services/Unknown/FeatureServer/0");

    //map.addLayers( [civData, bfData, uavData] );
}

function getHeatmapFeatures(url) {
    var hLayer = get_layer(url);
    hLayer.setVisibility(false);

    return hLayer;
}

function setupScenarioLayers() {
    var comms_nodes = comms_nodes_layer();
    var connections = comms_connect_layer();
    var ew_fans = range_fans_layer();

    // layer-specific setup
    comms_nodes.setRefreshInterval(refreshInterval);
    connections.setOpacity(0.50);
    ew_fans.setOpacity(0.35);
    ew_fans.setRefreshInterval(refreshInterval);

    map.addLayers( [connections, ew_fans, comms_nodes] );
}

function comms_nodes_layer() {
    var url = "http://geoeventsample2.esri.com:6080/arcgis/rest/services/Augusta/FeatureServer/0";
    return get_layer(url);
}

function comms_connect_layer() {
    var url = "http://geoeventsample2.esri.com:6080/arcgis/rest/services/Augusta/FeatureServer/1";
    return get_layer(url);
}

function range_fans_layer() {
    var url = "http://geoeventsample2.esri.com:6080/arcgis/rest/services/Augusta/FeatureServer/2";
    return get_layer(url);
}

function get_layer(url) {
    var layer = new esri.layers.FeatureLayer(url);
    return layer;
}

function onUavSourceChange() {
    console.info("UAV data source ck change");
    uavEnabled = uavCk.checked;
    onUpdateHeatmapSources();
}

function onBfSourceChange() {
    console.info("BLUFOR data source ck change");
    bfEnabled = bfCk.checked;
    onUpdateHeatmapSources();
}

function onCivSourceChanged() {
    console.info("BLUFOR data source ck change");
    civEnabled = civCk.checked;
    onUpdateHeatmapSources();
}

//function feature_layer
//
//function build_map() {
//    var map;
//
//    require(
//        ["esri/map", "dojo/domReady!"],
//        function(Map) {
//            map = new Map("map", {
//                basemap: "topo",
//                center: [-118.4167, 33.3833],
//                zoom: 10
//            });
//        }
//    );
//
//    return map;
//}
