import { Element as PolymerElement } from '../../@polymer/polymer/polymer-element.js';
import { DomRepeat } from '../../@polymer/polymer/lib/elements/dom-repeat.js';

import { CircleMarker } from '../../leaflet/src/layer/vector/CircleMarker.js';
import { GeoJSON } from '../../leaflet/src/layer/GeoJSON.js';
import '../../leaflet/src/Leaflet.js';
import { MarkerClusterGroup } from '../../leaflet.markercluster/src/';

// Dev only
// import { LeafletMap } from '../../@ggcity/leaflet-map/leaflet-map.js';

export class LeafletGeoJSON extends PolymerElement {
  static get properties () {
    return {
      map: {
        type: Object,
        observer: '_mapSet'
      },

      source: {
        type: String,
        observer: '_sourceChange',
        reflectToAttribute: true
      },

      fillColor: {
        type: String,
        value: '#FF80AB'
      },

      outlineColor: {
        type: String,
        value: '#FF1744'
      },

      radius: {
        type: Number,
        value: 10
      },

      weight: {
        type: Number,
        value: 3
      },

      opacity: {
        type: Number,
        value: 1.0
      },

      cluster: Boolean,
      maxClusterRadius: {
        type: Number,
        value: 80
      },
      identify: Boolean,
      minZoom: Number,
      maxZoom: Number,
      attribution: String
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();

    this._clusterGroup = new MarkerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: this.maxClusterRadius
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.map.removeLayer(this._clusterGroup);
  }

  _addGeoJSONLayer(geojson) {
    this._geoJSONOptions = {
      pointToLayer: (this.cluster) ? this._clusterPoints.bind(this) : this._simplePoints.bind(this),
      attribution: this.attribution,
      onEachFeature: (this.identify) ? this._onEachFeature.bind(this) : null
    };
    this._geoJSONLayer = new GeoJSON(geojson, this._geoJSONOptions);

    this.map.addLayer(this._clusterGroup);
  }

  _clusterPoints(feature, latlng) {
    this._clusterGroup.addLayer(
      new CircleMarker(latlng, {
        color: this.outlineColor,
        fillColor: this.fillColor,
        radius: this.radius,
        weight: this.weight,
        opacity: this.opacity
      }).bindPopup(this._generatePopupContent(feature))
    );
  }

  _simplePoints(feature, latlng) {
    return new CircleMarker(latlng);
  }

  _onEachFeature(feature, layer) {
    layer.bindPopup(this._generatePopupContent(feature));
  }

  _generatePopupContent (feature) {
    let rows = '';
    for (let p in feature.properties) {
      let fieldName = p.replace(/\w\S*/g, function(txt){ return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase().replace('_', ' '); })
      rows += `<tr><td>${fieldName}:</td><td><strong>${feature.properties[p]}</strong></td></tr>`;
    }

    return `<table class='table'>${rows}</table>`;
  }

  _sourceChange() {
    if (this.map && this._geoJSONLayer) this._geoJSONLayer.removeFrom(this.map);

    fetch(this.source)
      .then(res => res.json())
      .then(this._addGeoJSONLayer.bind(this));
    // .catch(() => alert('Unable to load layer'));
  }

  _mapSet() {
    // console.log('adding layer');
    // this.map.addLayer(this._geoJSONLayer);
  }
}

customElements.define('leaflet-geojson-points', LeafletGeoJSON);
