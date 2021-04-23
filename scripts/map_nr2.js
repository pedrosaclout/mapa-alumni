$(window).on('load', function() {
  var documentSettings = {};
  var markerColors = [];
  var markerLayerUrl = [];

  var polygonSettings = [];
  var polygonsLegend;

  var completePoints = false;
  var completePolygons = false;
  var completePolylines = false;

  /**
   * Returns an Awesome marker with specified parameters
   */
  function createMarkerIcon(icon, prefix, markerColor, iconColor) {
    return L.AwesomeMarkers.icon({
      icon: icon,
      prefix: prefix,
      markerColor: markerColor,
      iconColor: iconColor
    });
  }

  /**
   * Sets the view so that all markers are visible, or
   * to specified (lat, lon) and zoom if all three are specified
   */
  function centerAndZoomMap(points) {
    var lat = map.getCenter().lat, latSet = false;
    var lon = map.getCenter().lng, lonSet = false;
    var zoom = 8, zoomSet = false;
    var center;

    if (getSetting('_initLat') !== '') {
      lat = getSetting('_initLat');
      latSet = true;
    }

    if (getSetting('_initLon') !== '') {
      lon = getSetting('_initLon');
      lonSet = true;
    }

    if (getSetting('_initZoom') !== '') {
      zoom = parseInt(getSetting('_initZoom'));
      zoomSet = true;
    }

    if ((latSet && lonSet) || !points) {
      center = L.latLng(lat, lon);
    } else {
      center = points.getBounds().getCenter();
    }

    if (!zoomSet && points) {
      zoom = map.getBoundsZoom(points.getBounds());
    }

    map.setView(center, zoom);
  }

  //adding layer streets
  var cartodbAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attribution">CARTO</a>';

  var streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png', {
  attribution: cartodbAttribution
  });

  streets.addTo(map);

  var baseLayers = {
    "Map": streets
  };

  var faup = L.layerGroup();
  var fbaup = L.layerGroup();
  var fcup = L.layerGroup();
  var fcnaup = L.layerGroup();
  var fadeup = L.layerGroup();
  var fdup = L.layerGroup();
  var fep = L.layerGroup();
  var feup = L.layerGroup();
  var ffup = L.layerGroup();
  var flup = L.layerGroup();
  var fmup = L.layerGroup();
  var fmdup = L.layerGroup();
  var fpceup = L.layerGroup();
  var icbas = L.layerGroup();
  var pbs = L.layerGroup();
  var reitoria = L.layerGroup();
  var other = L.layerGroup();

  //create var for three layer menu
  var exchange = L.layerGroup();
  var alumnu = L.layerGroup();
  var feupfriend = L.layerGroup();

  //hash
  var allMapLayers = {
  'MAP': streets,
  'FAUP': faup,
  'FBAUP': fbaup,
  'FCUP': fcup,
  'FCNAUP': fcnaup,
  'FADEUP': fadeup,
  'FDUP': fdup,
  'FEP': fep,
  'FEUP': feup,
  'FFUP': ffup,
  'FLUP': flup,
  'FMUP': fmup,
  'FMDUP': fmdup,
  'FPCEUP': fpceup,
  'ICBAS': icbas,
  'PBS': pbs,
  'REITORIA': reitoria,
  'OTHER': other
  };

  //sort object, order alphabetically
  function sortObj(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
  }
  /**
   * Given a collection of points, determines the layers based on 'Layer'
   * column in the spreadsheet.
   */
  function determineLayers(points) {
    var layerNamesFromSpreadsheet = [];
    var layers = {};
    for (var i in points) {
      var pointLayerNameFromSpreadsheet = points[i].Layer;
      if (layerNamesFromSpreadsheet.indexOf(pointLayerNameFromSpreadsheet) === -1) {
        markerColors.push(
          points[i]['Marker Icon'].indexOf('.') > 0
          ? points[i]['Marker Icon']
          : points[i]['Marker Color']
        );
        markerLayerUrl.push(
            points[i]['Layer'].indexOf('.') > 0
            ? points[i]['Layer']
            : points[i]['Layer']
          );
        layerNamesFromSpreadsheet.push(pointLayerNameFromSpreadsheet);
      }
    }

    // if none of the points have named layers or if there was only one name, return no layers
    if (layerNamesFromSpreadsheet.length === 0) {
      layers = undefined;
    } else {
      for (var i in layerNamesFromSpreadsheet) {
        var layerNameFromSpreadsheet = layerNamesFromSpreadsheet[i];
        layers[layerNameFromSpreadsheet] = L.layerGroup();
        layers[layerNameFromSpreadsheet].addTo(map);

        //hash
	      allMapLayers[layerNameFromSpreadsheet] = layers[layerNameFromSpreadsheet];
      }
    }
console.log(layers);
    return layers;

  }

  //full hash plugin
  var hash = new L.Hash(map, allMapLayers);
  console.log(allMapLayers);


  //tabel: creating an object
		  var searchdict = {};

  /**
   * Assigns points to appropriate layers and clusters them if needed
   */
  function mapPoints(points, layers, alumni) {
    var markerArray = [];
    // check that map has loaded before adding points to it?
    for (var i in points) {
      var point = points[i];

      // If icon contains '.', assume it's a path to a custom icon,
      // otherwise create a Font Awesome icon
      var iconSize = point['Custom Size'];
      var size = (iconSize.indexOf('x') > 0)
        ? [parseInt(iconSize.split('x')[0]), parseInt(iconSize.split('x')[1])]
        : [32, 32];

      var anchor = [size[0] / 2, size[1]];

      var icon = (point['Marker Icon'].indexOf('.') > 0)
        ? L.icon({
          iconUrl: point['Marker Icon'],
          iconSize: size,
          iconAnchor: anchor
        })
        : createMarkerIcon(point['Marker Icon'],
          'fa',
          point['Marker Color'].toLowerCase(),
          point['Icon Color']
        );


      if (point.Latitude !== '' && point.Longitude !== '') {
        var marker = L.marker([point.Latitude, point.Longitude], {icon: icon})
          .bindPopup(
          '<div class="popup_header">' +
          (point['Image'] ? ('<img src="' + point['Image'] + '" alt="profile picture" id="circle"><br>') : '') +
          '<h2>' + point['Name'] + '</h2>' +
          '<h3 class="locationitalic">' + point['City'] + ", " + point['Country'] + '</h3>' +
          '<h3>' + point['Alumni'] + ", " + point['Group'] + '</h3></div>' +
          '<div class="popup_textbody"><p class="biographyscroll"> ' + point['Description'] + ' </p></div>' +
          (point['Website'] ? ('<h4 style="display: inline-block;"> <a class="desktopquery" href="' + point['Website'] + '" target="_blank">Website</a> </h4>') : '') +
          (point['Website'] ? ('<h4 id="website"> <a class="phonequery" href="' + point['Website'] + '" target="_blank"><span class="iconify" data-icon="mdi:web" data-inline="false"></span></a> </h4>') : '') +
          (point['LinkedIn'] ? ('<a class="linkedin desktopquery" href="' + point['LinkedIn'] + '" target="_blank"><h4>LinkedIn</h4></a>') : '') +
          (point['LinkedIn'] ? ('<a class="linkedin phonequery" href="' + point['LinkedIn'] + '" target="_blank"><span class="iconify" data-icon="mdi-linkedin" data-inline="false"></span></a>') : '') +
          '<a class="shareinvisible" href="' + point['Share'] + '" id="' + point['divid'] + '"></a>' +
          '<button class="btn personalsharebutton" type="button" data-clipboard-target="#' + point['divid'] + '"><span class="material-icons personalshare">share</span></button>');

//ordering alphabetically the object
if(point['EnShare'] !== null && point['EnShare'] !== '') { //this ignores the faculties entries in google sheet
  searchdict[point['Tabela']] = [point['EnShare']]; //adding to object a key and value
 }

//three layer menu
if (point.Alumni === 'Exchange'){
    marker.addTo(exchange);
  } else if (point.Alumni === 'Alumni'){
    marker.addTo(alumnu);
  } else if (point.Alumni === 'FEUP Friend'){
    marker.addTo(feupfriend);
  }

// TABEL ENDS HERE

        if (layers !== undefined && layers.length !== 1) {
          if (point.Layer === 'FAUP'){
	            marker.addTo(faup);
	          } else if (point.Layer === 'FBAUP'){
	            marker.addTo(fbaup);
	          } else if (point.Layer === 'FCUP'){
	            marker.addTo(fcup);
	          } else if (point.Layer === 'FCNAUP'){
	            marker.addTo(fcnaup);
	          } else if (point.Layer === 'FADEUP'){
	            marker.addTo(fadeup);
	          } else if (point.Layer === 'FDUP'){
	            marker.addTo(fdup);
	          } else if (point.Layer === 'FEP'){
	            marker.addTo(fep);
	          } else if (point.Layer === 'FEUP'){
	            marker.addTo(feup);
	          } else if (point.Layer === 'FFUP'){
	            marker.addTo(ffup);
	          } else if (point.Layer === 'FLUP'){
	            marker.addTo(flup);
	          } else if (point.Layer === 'FMUP'){
	            marker.addTo(fmup);
	          } else if (point.Layer === 'FMDUP'){
	            marker.addTo(fmdup);
	          } else if (point.Layer === 'FPCEUP'){
	            marker.addTo(fpceup);
	          } else if (point.Layer === 'ICBAS'){
	            marker.addTo(icbas);
	          } else if (point.Layer === 'PBS'){
	            marker.addTo(pbs);
	          } else if (point.Layer === 'REITORIA'){
	            marker.addTo(reitoria);
	          } else if (point.Layer === 'Other'){
	            marker.addTo(other);
	          } else {
	          continue;
	          }
        }

        markerArray.push(marker);
      }
    }

//ordering alphabetically the object
    let orderdict = sortObj(searchdict);
    //console.log(orderdict);

    for (var key of Object.keys(orderdict)) {
      var node = document.createElement('a');
        node.classList.add('anchortabela');
        node.href = orderdict[key];
        var textnode = document.createTextNode(key);
        node.appendChild(textnode);
        document.getElementById("mytabeladropdown").appendChild(node);
        //console.log(key + " -> " + orderdict[key])
  }

var overlays = {
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FAUP'><i class='fa fa-map-marker' style='color: #c6c6c6' aria-hidden='true'></i></a>&nbsp;FAUP": faup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FBAUP'><i class='fa fa-map-marker' style='color: #58595b' aria-hidden='true'></i></a>&nbsp;FBAUP": fbaup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FCUP'><i class='fa fa-map-marker' style='color: #a1d2f1' aria-hidden='true'></i></a>&nbsp;FCUP": fcup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FCNAUP'><i class='fa fa-map-marker' style='color: #dfa800' aria-hidden='true'></i></a>&nbsp;FCNAUP": fcnaup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FADEUP'><i class='fa fa-map-marker' style='color: #abcf2d' aria-hidden='true'></i></a>&nbsp;FADEUP": fadeup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FDUP'><i class='fa fa-map-marker' style='color: #ef3340' aria-hidden='true'></i></a>&nbsp;FDUP": fdup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FEP'><i class='fa fa-map-marker' style='color: ##da0813' aria-hidden='true'></i></a>&nbsp;FEP": fep,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FEUP'><i class='fa fa-map-marker' style='color: #96362a' aria-hidden='true'></i></a>&nbsp;FEUP": feup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FFUP'><i class='fa fa-map-marker' style='color: #42065E' aria-hidden='true'></i></a>&nbsp;FFUP": ffup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FLUP'><i class='fa fa-map-marker' style='color: #023f5e' aria-hidden='true'></i></a>&nbsp;FLUP": flup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FMUP'><i class='fa fa-map-marker' style='color: #f2e300' aria-hidden='true'></i></a>&nbsp;FMUP": fmup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FMDUP'><i class='fa fa-map-marker' style='color: #f05e22' aria-hidden='true'></i></a>&nbsp;FMDUP": fmdup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-FPCEUP'><i class='fa fa-map-marker' style='color: #f6a252' aria-hidden='true'></i></a>&nbsp;FPCEUP": fpceup,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-ICBAS'><i class='fa fa-map-marker' style='color: #edce16' aria-hidden='true'></i></a>&nbsp;ICBAS": icbas,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-PBS'><i class='fa fa-map-marker' style='color: #2638c4' aria-hidden='true'></i></a>&nbsp;PBS": pbs,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-REITORIA'><i class='fa fa-map-marker' style='color: #be9d6b' aria-hidden='true'></i></a>&nbsp;REITORIA": reitoria,
  "<a title='Click to isolate this layer!' href='https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-OTHER'><i class='fa fa-map-marker' style='color: #c6c6c6' aria-hidden='true'></i></a>&nbsp;Other": other
};


faup.addTo(map);
fbaup.addTo(map);
fcup.addTo(map);
fcnaup.addTo(map);
fadeup.addTo(map);
fdup.addTo(map);
fep.addTo(map);
feup.addTo(map);
ffup.addTo(map);
flup.addTo(map);
fmup.addTo(map);
fmdup.addTo(map);
fpceup.addTo(map);
icbas.addTo(map);
pbs.addTo(map);
reitoria.addTo(map);
other.addTo(map);

//3 layer menu
var overlays2 = {
	      "Alumni": alumnu,
	      "Exchange": exchange,
	      "FEUP Friend": feupfriend
	    };

	    alumnu.addTo(map);
	    exchange.addTo(map);
	    feupfriend.addTo(map);

    var group = L.featureGroup(markerArray);
    var clusters = (getSetting('_markercluster') === 'on') ? true : false;

    // if layers.length === 0, add points to map instead of layer
    if (overlays === undefined || overlays.length === 0) {
      map.addLayer(
        clusters
        ? L.markerClusterGroup({showCoverageOnHover: false}).addLayer(group).addTo(map)
        : group
      );
    } else {
      if (clusters) {
        // Add multilayer cluster support
        multilayerClusterSupport = L.markerClusterGroup.layerSupport({showCoverageOnHover: false});
        multilayerClusterSupport.addTo(map);

        for (i in overlays) {
          multilayerClusterSupport.checkIn(overlays[i]);
          overlays[i].addTo(map);
        }
      }

      var pos = (getSetting('_pointsLegendPos') == 'off')
        ? 'topleft'
        : getSetting('_pointsLegendPos');

      var pointsLegend = L.control.layers(baseLayers, overlays, {
        collapsed: false,
        position: pos,
      });

// three layer menu
      var pointsLegend2 = L.control.layers(null, overlays2, {
        collapsed: false,
        position: 'topleft'
      });
      pointsLegend2.addTo(map)

      if (getSetting('_pointsLegendPos') !== 'off') {
        pointsLegend.addTo(map);
        pointsLegend._container.id = 'points-legend';
        pointsLegend._container.className += ' ladder';
      }
    }

    $('#points-legend').prepend('<h6 class="pointer">' + 'Faculdades' + '</h6>');
    if (getSetting('_pointsLegendIcon') != '') {
      $('#points-legend h6').prepend('<span class="legend-icon"><i class="fa '
        + getSetting('_pointsLegendIcon') + '"></i></span>');
    }

    var displayTable = getSetting('_displayTable') == 'on' ? true : false;

    // Display table with active points if specified
    var columns = getSetting('_tableColumns').split(',')
                  .map(Function.prototype.call, String.prototype.trim);

    if (displayTable && columns.length > 1) {
      tableHeight = trySetting('_tableHeight', 40);
      if (tableHeight < 10 || tableHeight > 90) {tableHeight = 40;}
      $('#map').css('height', (100 - tableHeight) + 'vh');
      map.invalidateSize();

      // Set background (and text) color of the table header
      var colors = getSetting('_tableHeaderColor').split(',');
      if (colors[0] != '') {
        $('table.display').css('background-color', colors[0]);
        if (colors.length >= 2) {
          $('table.display').css('color', colors[1]);
        }
      }

      // Update table every time the map is moved/zoomed or point layers are toggled
      map.on('moveend', updateTable);
      map.on('layeradd', updateTable);
      map.on('layerremove', updateTable);

      // Clear table data and add only visible markers to it
      function updateTable() {
        var pointsVisible = [];
        for (i in points) {
          if (map.hasLayer(layers[points[i].Layer]) &&
              map.getBounds().contains(L.latLng(points[i].Latitude, points[i].Longitude))) {
            pointsVisible.push(points[i]);
          }
        }

        tableData = pointsToTableData(pointsVisible);

        table.clear();
        table.rows.add(tableData);
        table.draw();
      }

      // Convert Leaflet marker objects into DataTable array
      function pointsToTableData(ms) {
        var data = [];
        for (i in ms) {
          var a = [];
          for (j in columns) {
            a.push(ms[i][columns[j]]);
          }
          data.push(a);
        }
        return data;
      }

      // Transform columns array into array of title objects
      function generateColumnsArray() {
        var c = [];
        for (i in columns) {
          c.push({title: columns[i]});
        }
        return c;
      }

      // Initialize DataTable
      var table = $('#maptable').DataTable({
        paging: false,
        scrollCollapse: true,
        scrollY: 'calc(' + tableHeight + 'vh - 40px)',
        info: false,
        searching: false,
        columns: generateColumnsArray(),
      });
    }

    completePoints = true;
    return group;
  }

  var polygon = 0; // current active polygon
  var layer = 0; // number representing current layer among layers in legend

  /**
   * Store bucket info for Polygons
   */
  allDivisors = [];
  allColors = [];
  allIsNumerical = [];
  allGeojsons = [];
  allPolygonLegends = [];
  allPolygonLayers = [];
  allPopupProperties = [];
  allTextLabelsLayers = [];
  allTextLabels = [];

  function loadAllGeojsons(p) {
    if (p < polygonSettings.length && getPolygonSetting(p, '_polygonsGeojsonURL').trim()) {
      // Pre-process popup properties to be used in onEachFeature below
      polygon = p;
      var popupProperties = getPolygonSetting(p, '_popupProp').split(';');
      for (i in popupProperties) { popupProperties[i] = popupProperties[i].split(','); }
      allPopupProperties.push(popupProperties);

      // Load geojson
      $.getJSON(getPolygonSetting(p, '_polygonsGeojsonURL').trim(), function(data) {
          geoJsonLayer = L.geoJson(data, {
            onEachFeature: onEachFeature,
            pointToLayer: function(feature, latlng) {
              return L.circleMarker(latlng, {
                className: 'geojson-point-marker'
              });
            }
          });
          allGeojsons.push(geoJsonLayer);
          loadAllGeojsons(p+1);
      });
    } else {
      processAllPolygons();
    }
  }

  function processAllPolygons() {
    var p = 0;  // polygon sheet

    while (p < polygonSettings.length && getPolygonSetting(p, '_polygonsGeojsonURL').trim()) {
      isNumerical = [];
      divisors = [];
      colors = [];

      polygonLayers = getPolygonSetting(p, '_polygonLayers').split(';');
      for (i in polygonLayers) { polygonLayers[i] = polygonLayers[i].split(','); }

      divisors = getPolygonSetting(p, '_bucketDivisors').split(';');

      if (divisors.length != polygonLayers.length) {
        alert('Error in Polygons: The number of sets of divisors has to match the number of properties');
        return;
      }

      colors = getPolygonSetting(p, '_bucketColors').split(';');
      for (i = 0; i < divisors.length; i++) {
        divisors[i] = divisors[i].split(',');
        for (j = 0; j < divisors[i].length; j++) {
          divisors[i][j] = divisors[i][j].trim();
        }
        if (!colors[i]) {
          colors[i] = [];
        } else {
          colors[i] = colors[i].split(',');
        }
      }

      for (i = 0; i < divisors.length; i++) {
        if (divisors[i].length == 0) {
          alert('Error in Polygons: The number of divisors should be > 0');
          return; // Stop here
        } else if (colors[i].length == 0) {
          // If no colors specified, generate the colors
          colors[i] = palette(tryPolygonSetting(p, '_colorScheme', 'tol-sq'), divisors[i].length);
          for (j = 0; j < colors[i].length; j++) {
            colors[i][j] = '#' + colors[i][j].trim();
          }
        } else if (divisors[i].length != colors[i].length) {
          alert('Error in Polygons: The number of divisors should match the number of colors');
          return; // Stop here
        }
      }

      // For each set of divisors, decide whether textual or numerical
      for (i = 0; i < divisors.length; i++) {
        if (!isNaN(parseFloat(divisors[i][0].trim()))) {
          isNumerical[i] = true;
          for (j = 0; j < divisors[i].length; j++) {
            divisors[i][j] = parseFloat(divisors[i][j].trim());
          }
        } else {
          isNumerical[i] = false;
        }
      }

      allDivisors.push(divisors);
      allColors.push(colors);
      allIsNumerical.push(isNumerical);
      allPolygonLayers.push(polygonLayers);

      var legendPos = tryPolygonSetting(p, '_polygonsLegendPosition', 'off');
      polygonsLegend = L.control({position: (legendPos == 'off') ? 'topleft' : legendPos});

      polygonsLegend.onAdd = function(map) {
        var content = '<h6 class="pointer">' + getPolygonSetting(p, '_polygonsLegendTitle') + '</h6>';
        content += '<form>';

        for (i in polygonLayers) {
          var layer = polygonLayers[i][1]
            ? polygonLayers[i][1].trim()
            : polygonLayers[i][0].trim();

            layer = (layer == '') ? 'On' : layer;

          content += '<label><input type="radio" name="prop" value="' + p + ';' + i + '"> ';
          content += layer + '</label><br>';
        }

        content += '<label><input type="radio" name="prop" value="' + p + ';-1"> Off</label></form><div class="polygons-legend-scale">';

        var div = L.DomUtil.create('div', 'leaflet-control leaflet-control-custom leaflet-bar ladder polygons-legend' + p);
        div.innerHTML = content;
        div.innerHTML += '</div>';
        return div;
      };

      polygonsLegend.addTo(map);
      if (getPolygonSetting(p, '_polygonsLegendPosition') == 'off') {
        $('.polygons-legend' + p).css('display', 'none');
      }
      allPolygonLegends.push(polygonsLegend);

      p++;
    }

    // Generate polygon labels layers
    for (var i in allTextLabels) {
      var g = L.featureGroup(allTextLabels[i]);
      allTextLabelsLayers.push(g);
    }

    // This is triggered when user changes the radio button
    $('.ladder input:radio[name="prop"]').change(function() {
      polygon = parseInt($(this).val().split(';')[0]);
      layer = parseInt($(this).val().split(';')[1]);

      if (layer == -1) {
        $('.polygons-legend' + polygon).find('.polygons-legend-scale').hide();
        if (map.hasLayer(allGeojsons[polygon])) {
          map.removeLayer(allGeojsons[polygon]);
          if (map.hasLayer(allTextLabelsLayers[polygon])) {
            map.removeLayer(allTextLabelsLayers[polygon]);
          }
        }
      } else {
        updatePolygons();
      }
    });

    for (t = 0; t < p; t++) {
      if (getPolygonSetting(t, '_polygonShowOnStart') == 'on') {
        $('.ladder input:radio[name="prop"][value="' + t + ';0"]').click();
      } else {
        $('.ladder input:radio[name="prop"][value="' + t + ';-1"]').click();
      }
    }

    $('.polygons-legend-merged h6').eq(0).click().click();

    completePolygons = true;
  }


  function updatePolygons() {
    p = polygon;
    z = layer;
    allGeojsons[p].setStyle(polygonStyle);

    if (!map.hasLayer(allGeojsons[p])) {
      map.addLayer(allGeojsons[p]);
      if (!map.hasLayer(allTextLabelsLayers[p]) && allTextLabelsLayers[p]) {
        map.addLayer(allTextLabelsLayers[p]);
      }
    }

    doubleClickPolylines();

    // If no scale exists: hide the legend. Ugly temporary fix.
    // Can't use 'hide' because it is later toggled
    if (allDivisors[p][z] == '') {
      $('.polygons-legend' + p).find('.polygons-legend-scale').css(
        {'margin': '0px', 'padding': '0px', 'border': '0px solid'}
      );
      return;
    }

    $('.polygons-legend' + p + ' .polygons-legend-scale').html('');

    var labels = [];
    var from, to, isNum, color;

    for (var i = 0; i < allDivisors[p][z].length; i++) {
      var isNum = allIsNumerical[p][z];
      var from = allDivisors[p][z][i];
      var to = allDivisors[p][z][i+1];

      var color = getColor(from);
      from = from ? comma(from) : from;
      to = to ? comma(to) : to;

      labels.push(
        '<i style="background:' + color + '; opacity: '
        + tryPolygonSetting(p, '_colorOpacity', '0') + '"></i> ' +
        from + ((to && isNum) ? '&ndash;' + to : (isNum) ? '+' : ''));
    }

    $('.polygons-legend' + p + ' .polygons-legend-scale').html(labels.join('<br>'));
    $('.polygons-legend' + p + ' .polygons-legend-scale').show();

    togglePolygonLabels();
  }

  /**
   * Generates CSS for each geojson feature
   */
  function polygonStyle(feature) {
    var value = feature.properties[allPolygonLayers[polygon][layer][0].trim()];

    if (feature.geometry.type == 'Point') {
      return {  // Point style
        radius: 4,
        weight: 1,
        opacity: 1,
        color: getColor(value),
        fillOpacity: tryPolygonSetting(polygon, '_colorOpacity', '0'),
        fillColor: 'white'
      }
    } else {
      return {  // Polygon and Polyline style
        weight: 0,
        opacity: 0,
        color: tryPolygonSetting(polygon, '_outlineColor', 'white'),
        dashArray: '3',
        fillOpacity: tryPolygonSetting(polygon, '_colorOpacity', '0'),
        fillColor: getColor(value)
      }
    }
  }

  /**
   * Returns a color for polygon property with value d
   */
  function getColor(d) {
    var num = allIsNumerical[polygon][layer];
    var col = allColors[polygon][layer];
    var div = allDivisors[polygon][layer];

    var i;

    if (num) {
      i = col.length - 1;
      while (d < div[i]) i -= 1;
    } else {
      for (i = 0; i < col.length - 1; i++) {
        if (d == div[i]) break;
      }
    }

    if (!col[i]) {i = 0}
    return col[i];
  }


  /**
   * Generates popup windows for every polygon
   */
  function onEachFeature(feature, layer) {
    // Do not bind popups if 1. no popup properties specified and 2. display
    // images is turned off.
    if (getPolygonSetting(polygon, '_popupProp') == ''
     && getPolygonSetting(polygon, '_polygonDisplayImages') == 'off') return;

    var info = '';
    props = allPopupProperties[polygon];

    for (i in props) {
      if (props[i] == '') { continue; }

      info += props[i][1]
        ? props[i][1].trim()
        : props[i][0].trim();

      var val = feature.properties[props[i][0].trim()];
      info += ': <b>' + (val ? comma(val) : val) + '</b><br>';
    }

    if (getPolygonSetting(polygon, '_polygonDisplayImages') == 'on') {
      if (feature.properties['img']) {
        info += '<img src="' + feature.properties['img'] + '">';
      }
    }

    layer.bindPopup(info);


    // Add polygon label if needed
    if (!allTextLabels[polygon]) { allTextLabels.push([]) }

    if (getPolygonSetting(polygon, '_polygonLabel') !== '') {
      var myTextLabel = L.marker(polylabel(layer.feature.geometry.coordinates, 1.0).reverse(), {
        icon: L.divIcon({
          className: 'polygon-label' + polygon + ' polygon-label',
          html: feature.properties[getPolygonSetting(polygon, '_polygonLabel')],
        })
      });
      allTextLabels[polygon].push(myTextLabel);
    }
  }

  /**
   * Perform double click on polyline legend checkboxes so that they get
   * redrawn and thus get on top of polygons
   */
  function doubleClickPolylines() {
    $('#polylines-legend form label input').each(function(i) {
      $(this).click().click();
    });
  }

  /**
   * Here all data processing from the spreadsheet happens
   */
  function onMapDataLoad(options, points, polylines) {

    createDocumentSettings(options);

    document.title = getSetting('_mapTitle');
    addBaseMap();

    // Add point markers to the map
    var layers;
    var group = '';
    if (points && points.length > 0) {
      layers = determineLayers(points);
      group = mapPoints(points, layers);
    } else {
      completePoints = true;
    }

    centerAndZoomMap(group);

    // Add polylines
    if (polylines && polylines.length > 0) {
      processPolylines(polylines);
    } else {
      completePolylines = true;
    }

    // Add polygons
    if (getPolygonSetting(0, '_polygonsGeojsonURL')
      && getPolygonSetting(0, '_polygonsGeojsonURL').trim()) {
      loadAllGeojsons(0);
    } else {
      completePolygons = true;
    }

    // Add Nominatim Search control
    if (getSetting('_mapSearch') !== 'off') {
      var geocoder = L.Control.geocoder({
        expand: 'click',
        position: getSetting('_mapSearch'),

        geocoder: L.Control.Geocoder.nominatim({
          geocodingQueryParams: {
            viewbox: '',  // by default, viewbox is empty
            bounded: 1,
          }
        }),
      }).addTo(map);

      function updateGeocoderBounds() {
        var bounds = map.getBounds();
        geocoder.options.geocoder.options.geocodingQueryParams.viewbox = [
            bounds._southWest.lng, bounds._southWest.lat,
            bounds._northEast.lng, bounds._northEast.lat
          ].join(',');
      }

      // Update search viewbox coordinates every time the map moves
      map.on('moveend', updateGeocoderBounds);
    }

    // Add location control
    if (getSetting('_mapMyLocation') !== 'off') {
      var locationControl = L.control.locate({
        keepCurrentZoomLevel: true,
        returnToPrevBounds: true,
        position: getSetting('_mapMyLocation')
      }).addTo(map);
    }

    // Add zoom control
    if (getSetting('_mapZoom') !== 'off') {
      L.control.zoom({position: getSetting('_mapZoom')}).addTo(map);
    }

    map.on('zoomend', function() {
      togglePolygonLabels();
    });

    addTitle();

    // Change Map attribution to include author's info + urls
    changeAttribution();

    // Append icons to categories in markers legend
    // $('#points-legend label span').each(function(i) {
    //     var legendIcon = (markerColors[i].indexOf('.') > 0)
    //       ? '<img src="' + markerColors[i] + '" class="markers-legend-icon">'
    //       : '&nbsp;<a title="Click to isolate this layer!" href="https://alumni.up.pt/en/mapa-alumni/#3/37.02/0.18/MAP-' + markerLayerUrl[i] + '"><i class="fa fa-map-marker" style="color: '
    //         + markerColors[i]
    //         + '"></i></a>';
    //     $(this).prepend(legendIcon);
    //   });

    // When all processing is done, hide the loader and make the map visible
    showMap();

    function showMap() {
      if (completePoints && completePolylines && completePolygons) {
        $('.ladder h6').append('<span class="legend-arrow"><i class="fa fa-chevron-down"></i></span>');
        //$('.ladder h6').addClass('minimize'); //collapses the "faculdades" layers menu

        for (i in allPolygonLegends) {
          if (getPolygonSetting(i, '_polygonsLegendIcon') != '') {
            $('.polygons-legend' + i + ' h6').prepend(
              '<span class="legend-icon"><i class="fa ' + getPolygonSetting(i, '_polygonsLegendIcon') + '"></i></span>');
          }
        }

        $('.ladder h6').click(function() {
          if ($(this).hasClass('minimize')) {
            $('.ladder h6').addClass('minimize');
            $('.legend-arrow i').removeClass('fa-chevron-up').addClass('fa-chevron-down');
            $(this).removeClass('minimize')
              .parent().find('.legend-arrow i')
              .removeClass('fa-chevron-down')
              .addClass('fa-chevron-up');
          } else {
            $(this).addClass('minimize');
            $(this).parent().find('.legend-arrow i')
              .removeClass('fa-chevron-up')
              .addClass('fa-chevron-down');
          }
        });

        $('.ladder h6').first().click();

        $('#map').css('visibility', 'visible');
        $('.loader').hide();

        // Open intro popup window in the center of the map
        if (getSetting('_introPopupText') != '') {
          initIntroPopup(getSetting('_introPopupText'), map.getCenter());
        };

        togglePolygonLabels();
      } else {
        setTimeout(showMap, 50);
      }
    }

    // Add Google Analytics if the ID exists
    var ga = getSetting('_googleAnalytics');
    //console.log(ga)
    if ( ga && ga.length >= 10 ) {
      var gaScript = document.createElement('script');
      gaScript.setAttribute('src','https://www.googletagmanager.com/gtag/js?id=' + ga);
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', ga);
    }
  }

  /**
   * Adds title and subtitle from the spreadsheet to the map
   */
  function addTitle() {
    var dispTitle = getSetting('_mapTitleDisplay');

    if (dispTitle !== 'off') {
      var title = '<h1 class="pointer">UP Alumni Ambassador</h1>';
      var subtitle = '<h5>' + getSetting('_mapSubtitle') + '</h5>';

      if (dispTitle == 'topleft') {
        $('div.leaflet-top').prepend('<div class="map-title leaflet-bar leaflet-control leaflet-control-custom">' + title + subtitle + '</div>');
      } else if (dispTitle == 'topcenter') {
        $('#map').append('<div class="div-center"></div>');
        $('.div-center').append('<div class="map-title leaflet-bar leaflet-control leaflet-control-custom">' + title + subtitle + '</div>');
      }

      $('.map-title h1').click(function() { location.reload(); });
    }
  }
  /**
   * Adds polylines to the map
   */
  function processPolylines(p) {
    if (!p || p.length == 0) return;

    var pos = (getSetting('_polylinesLegendPos') == 'off')
      ? 'topleft'
      : getSetting('_polylinesLegendPos');

    var polylinesLegend = L.control.layers(null, null, {
      position: pos,
      collapsed: false,
    });

    for (i = 0; i < p.length; i++) {
      $.getJSON(p[i]['GeoJSON URL'], function(index) {
        return function(data) {
          latlng = [];

          for (l in data['features']) {
            latlng.push(data['features'][l].geometry.coordinates);
          }

          // Reverse [lon, lat] to [lat, lon] for each point
          for (l in latlng) {
            for (c in latlng[l]) {
              latlng[l][c].reverse();
              // If coords contained 'z' (altitude), remove it
              if (latlng[l][c].length == 3) {
                latlng[l][c].shift();
              }
            }
          }

          line = L.polyline(latlng, {
            color: (p[index]['Color'] == '') ? 'grey' : p[index]['Color'],
            weight: trySetting('_polylinesWeight', 2),
            pane: 'shadowPane'
          }).addTo(map);

          if (p[index]['Description'] && p[index]['Description'] != '') {
            line.bindPopup(p[index]['Description']);
          }

          polylinesLegend.addOverlay(line,
            '<i class="color-line" style="background-color:' + p[index]['Color']
            + '"></i> ' + p[index]['Display Name']);

          if (index == 0) {
            if (polylinesLegend._container) {
              polylinesLegend._container.id = 'polylines-legend';
              polylinesLegend._container.className += ' ladder';
            }

            if (getSetting('_polylinesLegendTitle') != '') {
              $('#polylines-legend').prepend('<h6 class="pointer">' + getSetting('_polylinesLegendTitle') + '</h6>');
              if (getSetting('_polylinesLegendIcon') != '') {
                $('#polylines-legend h6').prepend('<span class="legend-icon"><i class="fa '
                  + getSetting('_polylinesLegendIcon') + '"></i></span>');
              }

              // Add map title if set to be displayed in polylines legend
              if (getSetting('_mapTitleDisplay') == 'in polylines legend') {
                var title = '<h1>' + getSetting('_mapTitle') + '</h1>';
                var subtitle = '<h6>' + getSetting('_mapSubtitle') + '</h6>';
                $('#polylines-legend').prepend(title + subtitle);
              }
            }
          }

          if (p.length == index + 1) {
            completePolylines = true;
          }
        };
      }(i));
    }

    if (getSetting('_polylinesLegendPos') !== 'off') {
      polylinesLegend.addTo(map);
    }
  }


  function initIntroPopup(info, coordinates) {
    // This is a pop-up for mobile device
    if (window.matchMedia("only screen and (max-width: 760px)").matches) {
      $('body').append('<div id="mobile-intro-popup"><p>' + info +
        '</p><div id="mobile-intro-popup-close"><i class="fa fa-times"></i></div></div>');

      $('#mobile-intro-popup-close').click(function() {
        $("#mobile-intro-popup").hide();
      });
      return;
    }

    /* And this is a standard popup for bigger screens */
    L.popup({className: 'intro-popup'})
      .setLatLng(coordinates) // this needs to change
      .setContent(info)
      .openOn(map);
  }

  /**
   * Turns on and off polygon text labels depending on current map zoom
   */
  function togglePolygonLabels() {
    for (i in allTextLabels) {
      if (map.getZoom() <= tryPolygonSetting(i, '_polygonLabelZoomLevel', 9)) {
        $('.polygon-label' + i).hide();
      } else {
        if ($('.polygons-legend' + i + ' input[name=prop]:checked').val() != '-1') {
          $('.polygon-label' + i).show();
        }
      }
    }
  }

  /**
   * Changes map attribution (author, GitHub repo, email etc.) in bottom-right
   */
  function changeAttribution() {
    var attributionHTML = $('.leaflet-control-attribution')[0].innerHTML;
    var credit = 'View <a href="' + googleDocURL + '" target="_blank">data</a>';
    var name = getSetting('_authorName');
    var url = getSetting('_authorURL');

    if (name && url) {
      if (url.indexOf('@') > 0) { url = 'mailto:' + url; }
      credit += ' by <a href="' + url + '">' + name + '</a> | ';
    } else if (name) {
      credit += ' by ' + name + ' | ';
    } else {
      credit += ' | ';
    }

    credit += 'View <a href="' + getSetting('_githubRepo') + '">code</a>';
    if (getSetting('_codeCredit')) credit += ' by ' + getSetting('_codeCredit');
    credit += ' with ';
    $('.leaflet-control-attribution')[0].innerHTML = credit + attributionHTML;
  }


  /**
   * Loads the basemap and adds it to the map
   */
  function addBaseMap() {
    var basemap = trySetting('_tileProvider', 'CartoDB.Positron');
    L.tileLayer.provider(basemap, {
      maxZoom: 18,
      noWrap: true
    }).addTo(map);
    L.control.attribution({
      position: trySetting('_mapAttribution', 'bottomright')
    }).addTo(map);
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getSetting(s) {
    return documentSettings[constants[s]];
  }

  /**
   * Returns the value of a setting s
   * getSetting(s) is equivalent to documentSettings[constants.s]
   */
  function getPolygonSetting(p, s) {
    if (polygonSettings[p]) {
      return polygonSettings[p][constants[s]];
    }
    return false;
  }

  /**
   * Returns the value of setting named s from constants.js
   * or def if setting is either not set or does not exist
   * Both arguments are strings
   * e.g. trySetting('_authorName', 'No Author')
   */
  function trySetting(s, def) {
    s = getSetting(s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  function tryPolygonSetting(p, s, def) {
    s = getPolygonSetting(p, s);
    if (!s || s.trim() === '') { return def; }
    return s;
  }

  /**
   * Triggers the load of the spreadsheet and map creation
   */
   var mapData;

   $.ajax({
       url:'./csv/Options.csv',
       type:'HEAD',
       error: function() {
         // Options.csv does not exist in the root level, so use Tabletop to fetch data from
         // the Google sheet

         if (typeof googleApiKey !== 'undefined' && googleApiKey) {

          var parse = function(res) {
            return Papa.parse(Papa.unparse(res[0].values), {header: true} ).data;
          }

          var apiUrl = 'https://sheets.googleapis.com/v4/spreadsheets/'
          var spreadsheetId = googleDocURL.indexOf('/d/') > 0
            ? googleDocURL.split('/d/')[1].split('/')[0]
            : googleDocURL

          $.getJSON(
            apiUrl + spreadsheetId + '?key=' + googleApiKey
          ).then(function(data) {
              var sheets = data.sheets.map(function(o) { return o.properties.title })

              if (sheets.length === 0 || !sheets.includes('Options')) {
                'Could not load data from the Google Sheet'
              }

              // First, read 3 sheets: Options, Points, and Polylines
              $.when(
                $.getJSON(apiUrl + spreadsheetId + '/values/Options?key=' + googleApiKey),
                $.getJSON(apiUrl + spreadsheetId + '/values/Points?key=' + googleApiKey),
                $.getJSON(apiUrl + spreadsheetId + '/values/Polylines?key=' + googleApiKey)
              ).done(function(options, points, polylines) {

                // Which sheet names contain polygon data?
                var polygonSheets = sheets.filter(function(name) { return name.indexOf('Polygons') === 0})

                // Define a recursive function to fetch data from a polygon sheet
                var fetchPolygonsSheet = function(polygonSheets) {

                  // Load map once all polygon sheets have been loaded (if any)
                  if (polygonSheets.length === 0) {
                    onMapDataLoad(
                      parse(options),
                      parse(points),
                      parse(polylines)
                    )
                  } else {

                    // Fetch another polygons sheet
                    $.getJSON(apiUrl + spreadsheetId + '/values/' + polygonSheets.shift() + '?key=' + googleApiKey, function(data) {
                      createPolygonSettings( parse([data]) )
                      fetchPolygonsSheet(polygonSheets)
                    })

                  }

                }

                // Start recursive function
                fetchPolygonsSheet( polygonSheets )

              })

            }
          )

         } else {
          alert('You load data from a Google Sheet, you need to add a free Google API key')
         }

       },

       /*
       Loading data from CSV files.
       */
       success: function() {

        var parse = function(s) {
          return Papa.parse(s[0], {header: true}).data
        }

        $.when(
          $.get('./csv/Options.csv'),
          $.get('./csv/Points.csv'),
          $.get('./csv/Polylines.csv')
        ).done(function(options, points, polylines) {

          function loadPolygonCsv(n) {

            $.get('./csv/Polygons' + (n === 0 ? '' : n) + '.csv', function(data) {
              createPolygonSettings( parse([data]) )
              loadPolygonCsv(n+1)
            }).fail(function() {
              // No more sheets to load, initialize the map
              onMapDataLoad( parse(options), parse(points), parse(polylines) )
            })

          }

          loadPolygonCsv(0)

        })

       }
   });
  /**
   * Reformulates documentSettings as a dictionary, e.g.
   * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
   */
  function createDocumentSettings(settings) {
    for (var i in settings) {
      var setting = settings[i];
      documentSettings[setting.Setting] = setting.Customize;
    }
  }

  /**
   * Reformulates polygonSettings as a dictionary, e.g.
   * {"webpageTitle": "Leaflet Boilerplate", "infoPopupText": "Stuff"}
   */
  function createPolygonSettings(settings) {
    var p = {};
    for (var i in settings) {
      var setting = settings[i];
      p[setting.Setting] = setting.Customize;
    }
    polygonSettings.push(p);
  }

  // Returns a string that contains digits of val split by comma evey 3 positions
  // Example: 12345678 -> "12,345,678"
  function comma(val) {
      while (/(\d+)(\d{3})/.test(val.toString())) {
          val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
      }
      return val;
  }

});