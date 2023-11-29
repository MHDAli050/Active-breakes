/* eslint-disable  */

//const { doc } = require("prettier");


export const displayMap = (locations)=>{
mapboxgl.accessToken = 'pk.eyJ1IjoibWhkLWFsaSIsImEiOiJjbGczams3YTIwZnhmM2xuOXE1amgyc2JpIn0.cHjm8-TK7uNiHj5RYYbYQg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mhd-ali/clg3zqlze01iw01pewt6r2pob',
  scrollZoom : false,
//   center:[-118.11134,34.11124],
//   zoom:8,
   interactive:false
});
//another solution to stop scrolling the map
map.scrollZoom.disable();



const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
        element:el,
        anchor:'bottom'
    }).setLngLat(loc.coordinates).addTo(map);

    new mapboxgl.Popup({offset :30}).setLngLat(loc.coordinates).setHTML(`<p> Day ${loc.day} : ${loc.description} </p>`).addTo(map);

    //extend map bounds to include current location
    bounds.extend(loc.coordinates)
    
});


map.fitBounds(bounds,{
    padding:{
        top:200,
        bottom:150,
        right:100,
        left:100
    }
});
}