let new_jersey_toll_map;
const labels = "HLCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*+=-?><|_";
let labelIndex = 0;
let infoWindow;

let zoomLevel;

//let originMarkerObject, destinationMarkerObject; 
let directionsService;
let directionsRenderer;
let directionsRenderers = []; // Array to hold DirectionsRenderer objects
let polylines = []; // Array to hold the polylines

let originMarkerObjects = [];
let destinationMarkerObjects = [];
let tunnelMarkerObjects = [];
let bridgeMarkerObjects = [];
let tollFacilityMarkerObjects = [];

let borderPolygon;

// GLOBALS listed above //////////////////////////
// INIT MAP draws the MAP on the Page //////////////////////

// Modify initMap() as follows
// put the lines inside the following 'if' block into a function.
// name function "drawAllTollRoads"
//   if(selectedTollway === 'all'){
// Then modify the code of initMap to call that function.

function initMap() {
    infoWindow = new google.maps.InfoWindow();
    const center_of_new_jersey = {
        lat: 40.0736,
        lng: -74.5974
    };
    new_jersey_toll_map = new google.maps.Map(document.getElementById('map'), {
        center: center_of_new_jersey,
        zoom: 10,
    });

    directionsSetup();
    drawStateBorder("New Jersey");

    trafficLayer = new google.maps.TrafficLayer();

    // Add listners for various events that a user might take.
    google.maps.event.addListener(new_jersey_toll_map, 'zoom_changed', zoomChange);                     // Map Zoom level has changed.
    document.getElementById('tollwayType').addEventListener('change', setOotionsBasedOnTollwayType);    // User has changed what type of tollway (Road, Bridge or Tunnel) to display.
    document.getElementById('whichTollwayToDisplay').addEventListener('change', drawSelectedTollway);   // User has selected a Toll Road, a Toll Bridge, or a Toll Tunnel to display.
    document.getElementById('clearButton').addEventListener('click', clearMap);                         // User has clicked the clear map button
    document.getElementById('trafficButton').addEventListener('click', toggleTrafficLayer);             // User has clicked on the (Show/Hide) Traffic button.

    google.maps.event.addListener(infoWindow, 'domready', function () {
        
        // Select all elements with the class 'info_link' within the element with the ID 'myInfoWinDiv'
        document.querySelectorAll('#myInfoWinDiv .info_link').forEach(link => {
            // Add a click event listener to each selected link
            link.addEventListener('click', event => {
                // Prevent the default behavior of the link (e.g., navigating to a new page)
                event.preventDefault();

                // Extract the target section ID from the link's 'href' attribute, removing the '#'
                const targetSection = event.target.getAttribute('href').substring(1);
                
                // Log the target section ID to the console
                console.log(targetSection);

                // Load the content of the linked section into the modal content
                const modalContent = document.getElementById('modal-content');
                modalContent.innerHTML = document.getElementById(targetSection).outerHTML;
                
                // Display the modal by changing its style to 'block'
                const modal = document.getElementById('modal');
                modal.style.display = 'block';
            });
        });

        // Add a click event listener to the entire modal
        // Close the modal when clicking outside the modal content
        document.getElementById('modal').addEventListener('click', event => {
            if (event.target === document.getElementById('modal')) {
                event.target.style.display = 'none';
            }
        });
    });

    // Draw all tollroads. We start off with toll roads drawn but no bridges or tunnels. 
    // Map displays tollroads or bridges or tunnels. Displaying everything makes the screen to busy and complicated. 
    drawAll(directionsService, directionsRenderers, "allTR");
}

// When toggled "On" we show traffic, when "Off" we do not show traffic.
function toggleTrafficLayer() {
    // clearMap();       
    if (trafficLayer.getMap() == null || trafficLayer.getMap() == 'undefined' ) {        
      trafficLayer.setMap(new_jersey_toll_map);
      trafficButton.textContent = 'Hide Traffic';
    } else {  
      trafficLayer.setMap(null);
      trafficButton.textContent = 'Show Traffic';
    }
}

// 1) Set up what tollways can be selected based on tollway type selection (selectedOption).
// 2) Draw all the toll entities of the type selected on that map. IE draw Toll Roads, or all Toll Bridges, or all Toll Tunnels.
function setOotionsBasedOnTollwayType() {
    const selectedOption = document.querySelector('input[name="tollwayOption"]:checked').value;
    const modeSelect = document.getElementById('whichTollwayToDisplay');
    const selectedTollway = this.value;    
    // Clear existing options
    modeSelect.innerHTML = '';

    // Add options based on the selected radio button
    if (selectedOption === 'tollRoads') {    

        // Add options for showing all tollways
        //modeSelect.innerHTML += '<option value="allTollRoads">All Toll Roads</option>';
        modeSelect.innerHTML += '<option value="allTR">All Toll Roads</option>';
        modeSelect.innerHTML += '<option value="ACE">Atlantic City Expressway</option>';
        modeSelect.innerHTML += '<option value="GSP">Garden State Parkway</option>';
        modeSelect.innerHTML += '<option value="NJTP">New Jersey Turn Pike</option>';
        clearMap();
        drawAll(directionsService, directionsRenderers, "allTR");
    } else if (selectedOption === 'tollBridges') {

        // Add options for Group 2: Bridges
        //modeSelect.innerHTML += '<option value="allTollBridges">All Toll Bridges</option>';
        modeSelect.innerHTML += '<option value="allBR">All Toll Bridges</option>';
        modeSelect.innerHTML += '<option value="TIB1">Townsends Inlet Bridge</option>';
        modeSelect.innerHTML += '<option value="MTB1">Middle Thorofare Bridge</option>';
        modeSelect.innerHTML += '<option value="GWB1">George Washington Bridge</option>';
        modeSelect.innerHTML += '<option value="BB01">Bayonne Bridge</option>';
        modeSelect.innerHTML += '<option value="TPB1">Tacony-Palmyra Bridge</option>';
        modeSelect.innerHTML += '<option value="BBB1">Burlington-Bristol Bridge</option>';
        modeSelect.innerHTML += '<option value="BFB1">Ben Franklin Bridge</option>';
        modeSelect.innerHTML += '<option value="BRB1">Betsy Ross Bridge</option>';
        modeSelect.innerHTML += '<option value="CMJBB">Commodore John Barry Bridge</option>';
        modeSelect.innerHTML += '<option value="WWB1">Walt Whitman Bridge</option>';
        modeSelect.innerHTML += '<option value="DWGTB">Delaware Water Gap Toll Bridge</option>';
        modeSelect.innerHTML += '<option value="EPTB">Easton-Phillipsburg Toll Bridge</option>';
        modeSelect.innerHTML += '<option value="I78TB">I-78 Toll Bridge</option>';
        modeSelect.innerHTML += '<option value="MMB1">Milford-Montague Bridge</option>';
        modeSelect.innerHTML += '<option value="NHLB">New Hope-Lambertville Bridge</option>';
        modeSelect.innerHTML += '<option value="PCTB">Portland-Columbia Toll Bridge</option>';
        modeSelect.innerHTML += '<option value="TMTB">Trenton-Morrisville Toll Bridge</option>';
        modeSelect.innerHTML += '<option value="TIB1">Townsends Inlet Bridge</option>';
        modeSelect.innerHTML += '<option value="MTB1">Middle Thorofare Bridge</option>';
        modeSelect.innerHTML += '<option value="OCLB">Ocean City-Longport Bridge</option>';
        modeSelect.innerHTML += '<option value="GSB1">Grassy Sound Bridge</option>';
        modeSelect.innerHTML += '<option value="CIB1">Corson’s Inlet Bridge</option>';
        modeSelect.innerHTML += '<option value="DFB1">Dingman’s Ferry Bridge</option>';
        modeSelect.innerHTML += '<option value="MBDEB">Margate Bridge</option>';
        modeSelect.innerHTML += '<option value="GWB1">George Washington Bridge</option>';
        modeSelect.innerHTML += '<option value="BB01">Bayonne Bridge</option>';
        modeSelect.innerHTML += '<option value="GB01">Goethals Bridge</option>';
        modeSelect.innerHTML += '<option value="OC01">Outerbridge Crossing</option>';
        clearMap();
        drawAll(directionsService, directionsRenderers, "allBR");
    } else if (selectedOption === 'tollTunnels') {
        // Add options for Group 3: tunnels
        //modeSelect.innerHTML += '<option value="allTollTunnels">All Toll Tunnels</option>';
        modeSelect.innerHTML += '<option value="allTT">All Toll Tunnels</option>';
        modeSelect.innerHTML += '<option value="HolTnl">Holland Tunnel</option>';
        modeSelect.innerHTML += '<option value="LncTnl">Lincoln Tunnel</option>';
        clearMap();
        drawAll(directionsService, directionsRenderers, "allTT");
    }
}


// Draw the individual toll entity that the user has chosen. 
// Note that the user can choose "All" of a particular type.
function drawSelectedTollway() {
    const selectedTollway = this.value;
    if (selectedTollway === 'allTR') {
        drawAll(directionsService, directionsRenderers, selectedTollway);       
    } else if (selectedTollway === 'allTT') {        
        drawAll(directionsService, directionsRenderers, selectedTollway);       
    } else if (selectedTollway === 'allBR') {
        drawAll(directionsService, directionsRenderers, selectedTollway);        
    } else if (selectedTollway === 'NJTP') {        
        drawNJTP(directionsService, directionsRenderers, selectedTollway); 
              
    } else {
        clearMap();
        drawSelectedItem(directionsService, directionsRenderers, selectedTollway);        
    }
    displaytollFacilitys(selectedTollway) 
}


// Set up google DirectionsService and associated DirectionRenderer(s). 
function directionsSetup() {
    directionsService = new google.maps.DirectionsService();
    for (let i = 0; i < 24; i++) {
        directionsRenderer = new google.maps.DirectionsRenderer({
            map: new_jersey_toll_map,
            polylineOptions: {
                strokeColor: 'green',
                strokeOpacity: 1.0,
                strokeWeight: 5,
            },
            suppressMarkers: true
        });
        directionsRenderers.push(directionsRenderer);
    }
}

// zoomChange() is called when the zoom level is changed by the user.
// Here we adjust various markers to be bigger as the user zooms in and back to smaller when the user zooms back out.
// When the user is zoomed out, large markers cause the map to become dominated by the markers themselves. 
// But large markers are a benefit when the user zooms in.
// Because Smaller makers "get lost" when the user zooms in.
// This function makes sure that the markers are sized appropriately no matter the zoom level.
function zoomChange() {
    var currentZoom = new_jersey_toll_map.getZoom();
    // console.log(currentZoom);
    
    if (currentZoom > 14) {   // This is zoomed in pretty close
       
        console.log(bridgeMarkerObjects.length);
        // Bridge markers
        for (i = 0; i < bridgeMarkerObjects.length; i++) {
            bridgeMarkerObjects[i].setIcon({
                url: 'bridge.png', // Example marker image path
                scaledSize: new google.maps.Size(150, 75)          // Updated marker size
            });
        }
        // origin markers are for one end of a toll road.
        for (i = 0; i < originMarkerObjects.length; i++) {

            originMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(80, 80)           // Updated marker size
            });
        }
        // destination markers are for the other end of a toll road.
        for (i = 0; i < destinationMarkerObjects.length; i++) {

            destinationMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(80, 80)           // Updated marker size   
            });
        }

        for (i = 0; i < tollFacilityMarkerObjects.length; i++) {

            tollFacilityMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(80, 80)
            });
        }

        // When zoomed in we do not need the special state border 'borderPolygon', 
        // Google's dotted line and state name(s) on each side of that dotted line are enough.
        borderPolygon.setMap(null);

    } else if (currentZoom > 11) {
        
        // console.log(bridgeMarkerObjects.length);
        for (i = 0; i < bridgeMarkerObjects.length; i++) {

            bridgeMarkerObjects[i].setIcon({
                url: 'bridge.png', 
                scaledSize: new google.maps.Size(100, 50) 
            });
        }
        for (i = 0; i < originMarkerObjects.length; i++) {

            originMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(60, 60) 
            });
        }
        for (i = 0; i < destinationMarkerObjects.length; i++) {

            destinationMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(60, 60)
            });
        }
        for (i = 0; i < tollFacilityMarkerObjects.length; i++) {

            tollFacilityMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(60, 60)
            });
        }

        borderPolygon.setMap(null);

    } else if (currentZoom > 10) {

        //console.log(bridgeMarkerObjects.length);
        for (i = 0; i < bridgeMarkerObjects.length; i++) {

            bridgeMarkerObjects[i].setIcon({
                url: 'bridge.png',
                scaledSize: new google.maps.Size(75, 38) 
            });
        }
        for (i = 0; i < originMarkerObjects.length; i++) {

            originMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(50, 50) 
            });
        }
        for (i = 0; i < destinationMarkerObjects.length; i++) {

            destinationMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(50, 50)
            });
        }
        for (i = 0; i < tollFacilityMarkerObjects.length; i++) {

            tollFacilityMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(50, 50)
            });
        }
        
        borderPolygon.setMap(null);

    } else {     // We are zoomed pretty far out.

        for (i = 0; i < bridgeMarkerObjects.length; i++) {

            bridgeMarkerObjects[i].setIcon({
                url: 'bridge.png',
                scaledSize: new google.maps.Size(50, 25)
            });
        }
        for (i = 0; i < originMarkerObjects.length; i++) {

            originMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(30, 30)
            });
        }
        for (i = 0; i < destinationMarkerObjects.length; i++) {

            destinationMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(30, 30)
            });
        }
        for (i = 0; i < tollFacilityMarkerObjects.length; i++) {

            tollFacilityMarkerObjects[i].setIcon({
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(25, 25)
            });
        }

        borderPolygon.setMap(new_jersey_toll_map);   // Since we are zoomed out, draw the border of the state.
    }
}

// drawStateBorder draws a relatively thick border around the state (New Jersey in this case).
// Without this border, the outline of the state will not be noticeable to the user as the tiny dotted lines Google uses are barely noticeable.
// Without this thicker border the state of New Jersey will not be distinguishable from other states on the map.
function drawStateBorder(State) {
    var borderCoordinates;

    if (State == "New Jersey") {
        // Tracing the latitude and longitude points will form the outline of the state of New Jersey.
        // To see what is going on go to the first 3 coordinates in succession on a Google map.
        borderCoordinates = [
            { lat: 41.1408300000000, lng: -74.2365470000000 },  
            { lat: 40.9984290000000, lng: -73.9024540000000 }, 
            { lat: 40.7081510000000, lng: -74.0229470000000 },
            { lat: 40.6669516146945, lng: -74.0483308028706 },
            { lat: 40.6424280000000, lng: -74.1872550000000 },
            { lat: 40.4890740000000, lng: -74.2748860000000 },
            { lat: 40.4094280625361, lng: -73.9570069503315 },
            { lat: 40.2973810000000, lng: -73.9791310000000 },
            { lat: 39.7530860607066, lng: -74.0758823853955 },
            { lat: 39.3608240000000, lng: -74.4118090000000 },
            { lat: 39.2458080000000, lng: -74.6144560000000 },
            { lat: 38.9938690000000, lng: -74.7951950000000 },
            { lat: 38.9182793032345, lng: -74.8947663421085 },
            { lat: 38.9261414980385, lng: -74.9830278487527 },
            { lat: 39.1581770000000, lng: -74.8883030000000 },
            { lat: 39.2403310000000, lng: -75.1785810000000 },
            { lat: 39.4594090000000, lng: -75.5345820000000 },
            { lat: 39.6072860000000, lng: -75.5564900000000 },
            { lat: 39.6291940000000, lng: -75.5619670000000 },
            { lat: 39.6839640000000, lng: -75.5071970000000 },
            { lat: 39.8044560000000, lng: -75.4140890000000 },
            { lat: 39.8866100000000, lng: -75.1457190000000 },
            { lat: 39.9632880000000, lng: -75.1292890000000 },
            { lat: 40.1275960000000, lng: -74.8225800000000 },
            { lat: 40.1081988237735, lng: -74.7790332910275 },
            { lat: 40.1425885344716, lng: -74.7052188989376 },
            { lat: 40.2152270000000, lng: -74.7732870000000 },
            { lat: 40.4178740000000, lng: -75.0580880000000 },
            { lat: 40.5438430000000, lng: -75.0690420000000 },
            { lat: 40.5767050000000, lng: -75.1950120000000 },
            { lat: 40.6917210000000, lng: -75.2059660000000 },
            { lat: 40.8669830000000, lng: -75.0526110000000 },
            { lat: 40.9710450000000, lng: -75.1347650000000 },
            { lat: 41.1791680000000, lng: -74.8828260000000 },
            { lat: 41.2887070000000, lng: -74.8280570000000 },
            { lat: 41.3599070000000, lng: -74.6966100000000 },
            { lat: 41.1408300000000, lng: -74.2365470000000 }   
        ]; 
    }

    if (typeof new_jersey_toll_map !== 'undefined') {

        borderPolygon = new google.maps.Polygon({
            paths: borderCoordinates,
            map: new_jersey_toll_map,
            strokeColor: '#000000',   // Border color
            fillColor: '#3498DB',     // Fill color
            strokeWeight: 3,          // Border thickness in pixels
            fillOpacity: 0.0          // Fill opacity (0 to 1)
        });

    } else {
        console.error('Map object (new_jersey_toll_map) not found or initialized.');
    }
}



function drawAll(directionsService, directionsRenderers, selectedTollways) {
    let requests;

    if (selectedTollways === 'allTR') {
        requests = [
            getDirectionsRequest('ACE'),
            getDirectionsRequest('GSP'),
            getDirectionsRequest('NJTP'),
            getDirectionsRequest('NJTPWS'),
            getDirectionsRequest('NJTPNBE'),
            getDirectionsRequest('NJTPPHM')
        ];
        zoomLevel = 8;
    } else if (selectedTollways === 'allTT') {
        requests = [
            getDirectionsRequest('HolTnl'),
            getDirectionsRequest('LncTnl')
        ];
        zoomLevel = 10;
    } else if (selectedTollways === 'allBR') {
        requests = [
            getDirectionsRequest('TPB1'),
            getDirectionsRequest('BBB1'),
            getDirectionsRequest('BFB1'),
            getDirectionsRequest('BRB1'),
            getDirectionsRequest('CMJBB'),
            getDirectionsRequest('WWB1'),
            getDirectionsRequest('DWGTB'),
            getDirectionsRequest('EPTB'),
            getDirectionsRequest('PCTB'),
            getDirectionsRequest('I78TB'),
            getDirectionsRequest('MMB1'),
            getDirectionsRequest('NHLB'),
            getDirectionsRequest('TMTB'),
            getDirectionsRequest('TIB1'),
            getDirectionsRequest('MTB1'),
            getDirectionsRequest('OCLB'),
            getDirectionsRequest('GSB1'),
            getDirectionsRequest('CIB1'),
            getDirectionsRequest('DFB1'),
            getDirectionsRequest('MBDEB'),
            getDirectionsRequest('GWB1'),
            getDirectionsRequest('BB01'),
            getDirectionsRequest('GB01'),
            getDirectionsRequest('OC01')
        ];
        zoomLevel = 8;
    } else {
        alert("You be lost fool!")
        requests = [
            getDirectionsRequest('HolTnl'),
        ];
    }

    // alert("zoomlevel =" + zoomLevel);
    // The promises thing is an attempt to delay before .setZoom (below) is called.
    // It does not always work.

    const promises = requests.map((request, index) => {
        return new Promise((resolve, reject) => {
            directionsService.route(request, function (result, status) {
                if (status == 'OK') {
                    // if(directionsRenderers[index]) {
                    directionsRenderers[index].setDirections(result);

                    // Create the renderer's polyline
                    const polyline = createPolylineFromRenderer(directionsRenderers[index]);
                    polylines.push(polyline);

                    resolve(); // Resolve the promise when rendering is done
                    // }
                } else {
                    alert(`Directions request ${index+1} failed due to ${status}`);
                    reject(`Directions request ${index+1} failed due to ${status}`);
                }
            })
        });
    });

    Promise.all(promises)
        .then(() => {
            // All promises have resolved, indicating rendering is complete

            // Delay setting the zoom level by 500 milliseconds (adjust as needed)

            let allmarker;
            setTimeout(() => {
                switch (selectedTollways) {
                    case "allTR":
                        //allmarker.push(originMarkerObjects);
                        allmarker = originMarkerObjects;
                        break;
                    case "allTT":
                        //allmarker.push(tunnelMarkerObjects);
                        allmarker = tunnelMarkerObjects;
                        break;
                    case "allBR":
                        //allmarker.push(bridgeMarkerObjects);
                        allmarker = bridgeMarkerObjects;
                        break;
                    default:
                        break;
                }
                var bounds = new google.maps.LatLngBounds();
                for (i = 0; i < allmarker.length; i++) {
                    var position = new google.maps.LatLng(allmarker[i].position);
                    bounds.extend(position);
                    // Center the map to fit all markers on the screen
                }
                new_jersey_toll_map.fitBounds(bounds);
            }, 500);
        })
        .catch(error => {
            // Handle any errors here
            console.error(error);
        });

    // Set the center back to the geographical center of new jersey.
    const center_of_new_jersey = {
        lat: 40.0736,
        lng: -74.5974
    };
    new_jersey_toll_map.setCenter(center_of_new_jersey);

}


// The New Jersey Turnpike needs a separate function because it is not just one road. 
// It has offshoots and "multiple paths."
// 'NJTP' - Main New Jersey turnpike
// 'NJTPWS' - Western Spur (of the New Jersey turnpike)
// 'NJTPNBE' - Newark Bay Extension (of the New Jersey turnpike)
// 'NJTPPHM' -  Pearl Harbor Memorial Expressway (of the New Jersey turnpike)
function drawNJTP(directionsService, directionsRenderers) {
    const requests = [
        getDirectionsRequest('NJTP'),
        getDirectionsRequest('NJTPWS'),
        getDirectionsRequest('NJTPNBE'),
        getDirectionsRequest('NJTPPHM')
    ];

    const promises = requests.map((request, index) => {
        return new Promise((resolve, reject) => {
            directionsService.route(request, function (result, status) {
                if (status == 'OK') {
                    directionsRenderers[index].setDirections(result);
                    // Create the renderer's polyline
                    const polyline = createPolylineFromRenderer(directionsRenderers[index]);
                    polylines.push(polyline);
                    resolve(); // Resolve the promise when rendering is done
                } else {
                    alert(`Directions request ${index+1} failed due to ${status}`);
                    reject(`Directions request ${index+1} failed due to ${status}`);
                }
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            // All promises have resolved, indicating rendering is complete
            // Delay setting the zoom level by 500 milliseconds (adjust as needed)
            setTimeout(function () {
                new_jersey_toll_map.setZoom(zoomLevel);
            }, 500);
        })
        .catch(error => {
            // Handle any errors here
            console.error(error);
        });
}

function drawSelectedItem(directionsService, directionsRenderers, selectedTollway) {
    const request = getDirectionsRequest(selectedTollway);     
    directionsService.route(request, function (result, status) {
        if (status == 'OK') {
            directionsRenderers[0].setDirections(result);
            // Create the renderer's polyline
            const polyline = createPolylineFromRenderer(directionsRenderers[0]);
            polylines.push(polyline);

            // Delay setting the zoom level by 500 milliseconds (adjust as needed)
            setTimeout(function () {
                zoomLevel = 8;// 13;
                new_jersey_toll_map.setZoom(zoomLevel);
            }, 500);
        } else {
            alert('Directions request failed due to ' + status);
        }
    });
}


///////////////////////////////////////////////////////////////////////////////////
//  THIS Clears everythig with the button click.
//  You can call this with other user flow actions other than the click
///////////////////////////////////////////////////////////////////////////////////
function clearMap() {
    directionsRenderers.forEach(renderer => renderer.set('directions', null));

    originMarkerObjects.forEach(marker => marker.setMap(null));
    destinationMarkerObjects.forEach(marker => marker.setMap(null));
    tunnelMarkerObjects.forEach(marker => marker.setMap(null));
    bridgeMarkerObjects.forEach(marker => marker.setMap(null));

    for (let i = 0; i < tollFacilityMarkerObjects.length; i++) {
        tollFacilityMarkerObjects[i].setMap(null);
    }
    tollFacilityMarkerObjects = [];

    labelIndex = 0;

    // Set the center back to the geographical center_of_new_jersey
    const center_of_new_jersey = {
        lat: 40.0736,
        lng: -74.5974
    };
    new_jersey_toll_map.setCenter(center_of_new_jersey);

    // And set the zoom level back to 9
    new_jersey_toll_map.setZoom(9);
}


//////////////////////////////////////////////////////////////////////////////////
//  THIS IS WHERE YOU MANUALLY ENTER THE COORDINATES
//   Hard coded coordinates in the case statements would best be entered via some 
//    JSON file input of data for the tollway system
//
/*
Toll Name   CASE ABBREV.
Tacony-Palmyra Bridge   TPB1
Burlington-Bristol Bridge   BBB1
Ben Franklin Bridge BFB1
Betsy Ross Bridge   BRB1
Commodore John Barry Bridge CMJBB
Walt Whitman Bridge WWB1
Delaware Water Gap Toll Bridge  DWGTB
Easton-Phillipsburg Toll Bridge EPTB
I-78 Toll Bridge    I78TB
Milford-Montague Bridge MMB1
New Hope-Lambertville Bridge    NHLB
Portland-Columbia Toll Bridge   PCTB
Trenton-Morrisville Toll Bridge TMTB
    
Townsends Inlet Bridge  TIB1
Middle Thorofare Bridge MTB1
Ocean City-Longport Bridge  OCLB
Grassy Sound Bridge GSB1
Corson’s Inlet Bridge   CIB1
Dingman’s Ferry Bridge  DFB1
Margate Bridge  MBDEB
    
George Washington Bridge    GWB1
Bayonne Bridge  BB01
Goethals Bridge GB01
Outerbridge Crossing    OC01
    
Atlantic City Expressway    ACE
Garden State Parkway    GSP
New Jersey Turnpike NJTP
Holland Tunnel  HolTnl
Lincoln Tunnel  LncTnl
New Jersey Turnpike Western Spur    NJTPWS
New Jersey Turnpike Newark Bay Extension    NJTPNBE
New Jersey Turnpike Pearl Harbor Memorial Expressway    NJTPPHM
*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////

function getDirectionsRequest(selectedTollway) {
    let request = {};
    let originMarker, destinationMarker, bridgeMarker, tunnelMarker; // OrginMarker and destinationMarker are for roads where we want to mark beginning/end.
    let originCoordinates = {}; // We need this for bridges and tunnels so we can draw a line on them   
    let destinationCoordinates = {}; // We need this for bridges and tunnels so we can draw a line on them      
    let centerCoordinates = {}; // For bridges and tunnels we will have a single marker "in the middle", we don't care so much about origin and destination.
    let rtitle = '';
    let theLink = '';
    const ROAD = 1;
    const BRIDGE = 2;
    const TUNNEL = 3;
    var type = 0;

    theLink = '<a href = "http://www.wikipedia.org" target="_blank">' + "http://www.wikipedia.org </a>";

    switch (selectedTollway) {
        case 'ACE':
            originCoordinates = {
                lat: 39.78810721759777,
                lng: -75.04914312352363
            };
            destinationCoordinates = {
                lat: 39.36126143729921, 
                lng: -74.43974527081917
            };
            rtitle = 'Atlantic City Expressway <br>';
            theLink = '<a href = "#Atlantic-City-Expressway" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = ROAD;           
            break;
        case 'TPB1':
            originCoordinates = {
                lat: 40.01718964409225,
                lng: -75.04772543386274
            };
            destinationCoordinates = {
                lat: 40.00708120169494,
                lng: -75.03914753500241
            };
            rtitle = 'Tacony Palmyra Bridge <br>';
            theLink = '<a href = "#Tacony-Palmyra-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'GSP':
            originCoordinates = {
                lat: 41.066322138410825, 
                lng:-74.05744842800459
            };
           destinationCoordinates = {
                lat: 38.961688208615335, 
                lng: -74.90377113297397
            };
            rtitle = 'Garden State Parkway <br>';
            theLink = '<a href = "#Garden-State-Parkway" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = ROAD;
            break;
        case 'NJTP':
            originCoordinates = {
                lat: 39.68523058596287, 
                lng: -75.50909045440962
            };
            destinationCoordinates = {
                lat: 40.857266858589625, 
                lng: -73.97459246173831
            };
            theLink = '<a href = "#New-Jersey-Turnpike" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            rtitle = 'New Jersey Turnpike <br>';
            type = ROAD;
            break;
        case 'HolTnl':
            originCoordinates = {
                lat: 40.72990112520719,
                lng: -74.03878298540806
            };
            destinationCoordinates = {
                lat: 40.72098999354002,
                lng: -74.00704847833313
            };
            rtitle = 'Holland Tunnel <br>';
            theLink = '<a href = "#Holland-Tunnel" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";

            type = TUNNEL;
            break;
        case 'LncTnl':
            originCoordinates = {
                lat: 40.76601370113409,
                lng: -74.02271203592419
            };
            destinationCoordinates = {
                lat: 40.75627378113294,
                lng: -73.99586114590628
            };
            rtitle = 'Lincoln Tunnel <br>';
            theLink = '<a href = "#Lincoln-Tunnel" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = TUNNEL;
            break;
        case 'NJTPWS':
            originCoordinates = {
                lat: 40.735464692165884, 
                lng: -74.12404067213991
            };
            destinationCoordinates = {
                lat: 40.83297725216983,
                lng: -74.0222052541449
            };
            rtitle = 'New Jersey Turnpike Western Spur <br>';
            theLink = '<a href = "#New-Jersey-Turnpike-Western-Spur" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = ROAD;
            break;
        case 'NJTPNBE':
            /* originCoordinates = {
                lat: 40.70666316813498, 
                lng: -74.15217162888305
            };*/

            originCoordinates = {
                lat: 40.70637246998847, 
                lng: -74.15127422097625
            };
            destinationCoordinates = {
                lat: 40.730436270908434, 
                lng: -74.04464077177711
            };
            rtitle = 'New Jersey Turnpike Newark Bay Extension <br>';
            theLink = '<a href = "#New-Jersey-Turnpike-Newark-Bay-Extension" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = ROAD;
            break;
        case 'NJTPPHM':
            originCoordinates = {
                lat: 40.097870298190635, 
                lng: -74.73504925825881
            };
            destinationCoordinates = {
                lat: 40.11644860540062, 
                lng: -74.8283549242335
            }; 

            /* originCoordinates = {
                lat: 40.64084051011854,
                lng: -74.20558943194335
            };
            destinationCoordinates = {
                lat: 40.5674508226656,
                lng: -74.19288484451043
            }; */
            rtitle = 'New Jersey Turnpike Pearl Harbor Memorial Expressway <br>';
            theLink = '<a href = "#New-Jersey-Turnpike-Pearl-Harbor-Memorial-Expressway" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = ROAD;
            break;
        case 'BBB1':
            originCoordinates = {
                lat: 40.08389729592954,
                lng: -74.87050837206895
            };
            destinationCoordinates = {
                lat: 40.07636539179788,
                lng: -74.86762472841757
            };
            rtitle = 'Burlington-Bristol Bridge <br>';
            theLink = '<a href = "#Burlington-Bristol-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'BFB1':
            originCoordinates = {
                lat: 39.95516075876829,
                lng: -75.14736415422271
            };
            destinationCoordinates = {
                lat: 39.94809572604726,
                lng: -75.11888129965543
            };
            rtitle = 'Ben Franklin Bridge <br>';
            theLink = '<a href = "#Ben-Franklin-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'BRB1':
            originCoordinates = {
                lat: 39.99041421910392,
                lng: -75.0762349837770
            };
            destinationCoordinates = {
                lat: 39.97848945479895,
                lng: -75.0518068696454
            };
            rtitle = 'Betsy Ross Bridge <br>';
            theLink = '<a href = "#Betsy-Ross-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'CMJBB':
            originCoordinates = {
                lat: 39.83411840833792,
                lng: -75.3777774390214
            };
            destinationCoordinates = {
                lat: 39.80995282337697,
                lng: -75.35258456885268
            };
            rtitle = 'Commodore John Barry Bridge <br>';
            theLink = '<a href = "#Commodore-John-Barry-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'WWB1':
            originCoordinates = {
                lat: 39.90981582657176,
                lng: -75.15476545850133
            };
            destinationCoordinates = {
                lat: 39.90288577117054,
                lng: -75.11599322749736
            };
            rtitle = 'Walt Whitman Bridge <br>';
            theLink = '<a href = "#Walt-Whitman-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'DWGTB':
            originCoordinates = {
                lat: 40.98319416901781,
                lng: -75.13789877321163
            };
            destinationCoordinates = {
                lat: 40.97230888059611,
                lng: -75.13299115462935
            };
            rtitle = 'Delaware Water Gap Toll Bridge <br>';
            theLink = '<a href = "#Delaware-Water-Gap-Toll-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'EPTB':
            originCoordinates = {
                lat: 40.69443872567363,
                lng: -75.20516907745427
            };
            destinationCoordinates = {
                lat: 40.69474783891606,
                lng: -75.20117795040697
            };
            rtitle = 'Easton-Phillipsburg Toll Bridge <br>';
            theLink = '<a href = "#Easton-Phillipsburg-Toll-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'I78TB':
            originCoordinates = {
                lat: 40.67380392588803,
                lng: -75.1795195123700
            };
            destinationCoordinates = {
                lat: 40.67084707715194,
                lng: -75.17691332388647
            };
            rtitle = 'I-78 Toll Bridge <br>';
            theLink = '<a href = "#I-78-Toll-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'MMB1':
            originCoordinates = {
                lat: 41.30995195575081,
                lng: -74.80263067888357
            };
            destinationCoordinates = {
                lat: 41.30536389552986,
                lng: -74.79884225190024
            };
            rtitle = 'Milford-Montague Bridge <br>';
            theLink = '<a href = "#Milford-Montague-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'NHLB':
            originCoordinates = {
                lat: 40.36439340414349,
                lng: -74.95133352542761
            };
            destinationCoordinates = {
                lat: 40.36533139483931,
                lng: -74.94668237161038
            };
            rtitle = 'New Hope-Lambertville Bridge <br>';
            theLink = '<a href = "#New-Hope-Lambertville-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'PCTB':
            originCoordinates = {
                lat: 40.91901266062307,
                lng: -75.09542126555813
            };
            destinationCoordinates = {
                lat: 40.92240944676448,
                lng: -75.09053964515891
            };
            rtitle = 'Portland-Columbia Toll Bridge <br>';
            theLink = '<a href = "#Portland-Columbia-Toll-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'TMTB':
            originCoordinates = {
                lat: 40.20713031870883,
                lng: -74.77156451823144
            };
            destinationCoordinates = {
                lat: 40.21119855487570,
                lng: -74.76353320929441
            };
            rtitle = 'Trenton-Morrisville Toll Bridge <br>';
            theLink = '<a href = "#Trenton-Morrisville-Toll-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'TIB1':
            originCoordinates = {
                lat: 39.11708735597754,
                lng: -74.71613467117976
            };
            destinationCoordinates = {
                lat: 39.12135928452956,
                lng: -74.71515467243059
            };
            rtitle = 'Townsends Inlet Bridge <br>';
            theLink = '<a href = "#Townsends-Inlet-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'MTB1':
            originCoordinates = {
                lat: 38.95505507109283,
                lng: -74.87042200453006
            };
            destinationCoordinates = {
                lat: 38.95702448160473,
                lng: -74.87635693766697
            };
            rtitle = 'geMiddle Thorofare Bride <br>';
            theLink = '<a href = "#Middle-Thorofare-Bride" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'OCLB':
            originCoordinates = {
                lat: 39.29660368411945,
                lng: -74.55697286990134
            };
            destinationCoordinates = {
                lat: 39.30733458731994,
                lng: -74.55797679954259
            };
            rtitle = 'Ocean City-Longport Bridge <br>';
            theLink = '<a href = "#Ocean-City-Longport-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'GSB1':
            originCoordinates = {
                lat: 39.02847655579279,
                lng: -74.8021504934016
            };
            destinationCoordinates = {
                lat: 39.03175782311263,
                lng: -74.79903385055995
            };
            rtitle = 'Grassy Sound Bridge <br>';
            theLink = '<a href = "#Grassy-Sound-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'CIB1':
            originCoordinates = {
                lat: 39.21379024643521,
                lng: -74.64997242793726
            };
            destinationCoordinates = {
                lat: 39.21746848447668,
                lng: -74.64617978439414
            };
            rtitle = 'Corsons Inlet Bridge <br>';
            theLink = '<a href = "#Corsons-Inlet-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'DFB1':
            originCoordinates = {
                lat: 41.22009919168487,
                lng: -74.85797559137175
            };
            destinationCoordinates = {
                lat: 41.22004270126510,
                lng: -74.86081873295115
            };
            rtitle = 'Dingmans Ferry Bridge <br>';
            theLink = '<a href = "#Dingmans-Ferry-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'MBDEB':
            originCoordinates = {
                lat: 39.33761358813797,
                lng: -74.51522172912343
            };
            destinationCoordinates = {
                lat: 39.33750571481239,
                lng: -74.51273263913694
            };
            rtitle = 'Margate Bridge <br>';
            theLink = '<a href = "#Margate-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'GWB1':
            originCoordinates = {
                lat: 40.85326532132662,
                lng: -73.96102231668232
            };
            destinationCoordinates = {
                lat: 40.84996063788464,
                lng: -73.94396050134921
            };
            rtitle = 'George Washington Bridge <br>';
            theLink = '<a href = "#George-Washington-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'BB01':
            originCoordinates = {
                lat: 40.63624266449847,
                lng: -74.1445087506968
            };
            destinationCoordinates = {
                lat: 40.64579073028844,
                lng: -74.14052467919912
            };
            rtitle = 'Bayonne Bridge <br>';
            theLink = '<a href = "#Bayonne-Bridge" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            type = BRIDGE;
            break;
        case 'GB01':
            originCoordinates = {
                lat: 40.63703727234731,
                lng: -74.20062584517852
            };
            destinationCoordinates = {
                lat: 40.62772517052654,
                lng: -74.18211294533562
            };
            rtitle = 'Goethals Bridge <br>';
            theLink = '<a href = "#Goethals-Bridge" class="info_link">' + rtitle + 
            "</a> <br><i>E-ZPass Accepted</i><br>" + 
            '<a href = "#Goethals-Bridge" class="info_link">' + "Toll Info</a>";
            console.log(theLink)
            type = BRIDGE;
            break;
        case 'OC01':
            originCoordinates = {
                lat: 40.52438981852773,
                lng: -74.25733807461168
            };
            destinationCoordinates = {
                lat: 40.52529268023093,
                lng: -74.23751108236073
            };
            rtitle = 'Outerbridge Crossing <br>';
            type = BRIDGE;
            theLink = '<a href = "#Outerbridge-Crossing" class="info_link">' + rtitle + "</a> <br><i>E-ZPass Accepted</i>";
            break;
    }

    request = {
        origin: `${originCoordinates.lat}, ${originCoordinates.lng}`,
        destination: `${destinationCoordinates.lat}, ${destinationCoordinates.lng}`,
        travelMode: 'DRIVING',
    };

    // Set up the appropriate markers:
    if (type === ROAD) {
        // Create the origin and destination markers for the road, push them, and add listeners for each.
        originMarker = {
            position: originCoordinates,
            title: rtitle + ' Northern Terminus',
            label: labels[labelIndex++ % labels.length],            
        };
        destinationMarker = {
            position: destinationCoordinates,
            title: rtitle + ' Southern Terminus',
            label: labels[labelIndex++ % labels.length],         
        };

        const newOriginMarker = new google.maps.Marker({
            position: originMarker.position,
            map: new_jersey_toll_map,
            title: originMarker.title,
            label: originMarker.label,
           icon:{
                url: 'favicon.png',   //'https://www.fischersoftwareusa.com/MapIcons/tunnel.svg',
                scaledSize: new google.maps.Size(30, 30),
           }
        });
        originMarkerObjects.push(newOriginMarker);

        const newDestinationMarker = new google.maps.Marker({
            position: destinationMarker.position,
            map: new_jersey_toll_map,
            title: destinationMarker.title,
            label: destinationMarker.label,
            icon:{
                url: 'favicon.png',   //'https://www.fischersoftwareusa.com/MapIcons/tunnel.svg',
                scaledSize: new google.maps.Size(30, 30),
            }
        });
        destinationMarkerObjects.push(newDestinationMarker);
        
        // Add a click listener for the new origin marker
        newOriginMarker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(newOriginMarker.getTitle());
            infoWindow.open(newOriginMarker.getMap(), newOriginMarker);
        });

        // Add a click listener for the new destination marker
        newDestinationMarker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(newDestinationMarker.getTitle());
            infoWindow.open(newDestinationMarker.getMap(), newDestinationMarker);
        });
    }
    if (type === TUNNEL) {
        // Calculate the position of the center of the tunnel, create a tunnel marker for the tunnel, push it at that center position, and add a listener.

        centerCoordinates = {
            lat: ((originCoordinates.lat + destinationCoordinates.lat) / 2) + .002,  // We want bridge markers just to the north of the center of the bridge, hence the + .007
            lng: (originCoordinates.lng + destinationCoordinates.lng) / 2
        };

        tunnelMarker = {
            position: centerCoordinates,
            
            title: rtitle + " " + theLink,
            label: labels[labelIndex++ % labels.length],
            icon: {
                url: 'tunnel.png',   //'https://www.fischersoftwareusa.com/MapIcons/tunnel.svg',
                scaledSize: new google.maps.Size(50, 50),
            }
        };

        const newTunnelMarker = new google.maps.Marker({
            position: tunnelMarker.position,
            map: new_jersey_toll_map,
            // title: tunnelMarker.title,
            title: "<div id='myInfoWinDiv'>"+ " " + tunnelMarker.title+"</div>",
            label: tunnelMarker.label,
            icon: tunnelMarker.icon, // Add the icon property
        });
            
            
        tunnelMarkerObjects.push(newTunnelMarker);
        // Add a click listener for the new tunnel marker
        newTunnelMarker.addListener("click", () => {
         //   console.log(newTunnelMarker.getTitle());
            infoWindow.close();
            infoWindow.setContent(newTunnelMarker.getTitle());
            infoWindow.open(newTunnelMarker.getMap(), newTunnelMarker);
        });
    }
    if (type === BRIDGE) {
        // Calculate where the center of the bridge is, create a bridge marker, push it at that center position, and add a listener.
        centerCoordinates = {
            lat: (originCoordinates.lat + destinationCoordinates.lat) / 2,
            lng: (originCoordinates.lng + destinationCoordinates.lng) / 2
        };
        bridgeMarker = {
            position: centerCoordinates,
            // title: "<div id='myInfoWinDiv'>"+ rtitle + " " + theLink+"</div>",
            title: "<div id='myInfoWinDiv'>"+ " " + theLink+"</div>",
            label: labels[labelIndex++ % labels.length],
            icon: {
                url: 'bridge.png',
                scaledSize: new google.maps.Size(50, 50),
            }
        };

        const newBridgeMarker = new google.maps.Marker({
            position: bridgeMarker.position,
            map: new_jersey_toll_map,
            title: bridgeMarker.title,
            label: bridgeMarker.label,
            icon: bridgeMarker.icon, // Add the icon property
        });
        bridgeMarkerObjects.push(newBridgeMarker);

        // Add a click listener for the new bridge marker
        newBridgeMarker.addListener("click", () => {
           
            infoWindow.close();
            infoWindow.setContent(newBridgeMarker.getTitle());
            infoWindow.open(newBridgeMarker.getMap(), newBridgeMarker);            
 
        });

       
    }
 
    return request;
}

// Create a function to generate a polyline from a DirectionsRenderer
function createPolylineFromRenderer(directionsRenderer) {
    
    const route = directionsRenderer.getDirections().routes[0].overview_path;
    
    const polyline = new google.maps.Polyline({
        path: route,
        strokeColor: 'transparent',
        strokeOpacity: 0,
        map: new_jersey_toll_map, // Assuming map is your Google Map object
        zIndex: 1 // Make sure the polyline is above other elements on the map
    });
     
   // Add a click listener to the polyline
    polyline.addListener('click', function (event) {
        // Handle click event here
        const xMarker = new google.maps.Marker({
            position: event.latLng,
            map:new_jersey_toll_map,
            title: 'Tollways'
        });        
       
        const summary = directionsRenderer.getDirections().routes[0].summary;   
        console.log(summary)
        let href_link  = ''
        switch(summary){
            case 'Atlantic City Expy E':
                href_link = '#Atlantic-City-Expressway';
                break;
            case 'Garden State Pkwy':
                href_link = '#Garden-State-Parkway';
                break;
            case 'I-78 E':
                href_link = '#New-Jersey-Turnpike-Western-Spur';
                break;
            case 'I-95 S':
                href_link = '#New-Jersey-Turnpike-Newark-Bay-Extension';
                break;
            case 'NJ Tpke and I-95 N'://NJ Tpke and I-95 N
                href_link = '#New-Jersey-Turnpike-Pearl-Harbor-Memorial-Expressway';
                break;             
        }
        // add this here
        infoWindow.close();
        let content = '<div id="myInfoWinDiv"><a href = "'+href_link+'" class="info_link">' + summary + "</a> </div>";        
        infoWindow.setContent(content);
        infoWindow.open(xMarker.getMap(), xMarker);
        xMarker.setVisible(false);
         
    });

    return polyline;
}
 

// Put down markers for each toll facility on 'selectedTollway'
function displaytollFacilitys(selectedTollway) {

    clearTollFacilityMarkerObjects(); // Clear any marker objects that may be on the map.

    // Note to Chao (1): this is what I meant by an "objected oriented approach". IE we define a class here
    // and populate it down below
    class TollFacility {
        constructor(lat, lng, type, name, description) {
            this.coordinates = { lat, lng };
            this.type = type;
            this.name = name;
            this.description = description;
        }
    }
    let tollFacilities = [];

    switch (selectedTollway) {

        // Note to Chao (2): the data for the tollFacilities is at current embedded in the code (below).
        // We *could* save the data in JSON files if it makes sense, or....see Note 3.

        // Note Chao (3): it's possible that the TollGuru API (https://tollguru.com/) would be able to give us the information 
        // below (and more) - either directly or indirectly. I don't want to do much more coding in here before I know the answer.
        // If neither TollGuru nor anyone else is able to give us this info then may *we* create a database of it. First for New Jersey,
        // Then the next state and so on. Eventually that database may be valuable. Or maybe TollGuru (or someone else) has already done
        // this. What I do know is that people *DO* want this information.

        // Note to Chao (4): notice that the locations of the toll facilities are not all correct and I do not have all of them in the list
        // Below. Before continuing getting them 'by hand' by hunting and pecking on the map, it makes sense to see of TollGuru (or 
        // something else) can give us this info.

        case 'GSP':
            // Create an ojbect of type TollFacility for each toll facility on the Garden State Parkway
            // Gantry (Open Road) tolls

            tollFacilities.push(new TollFacility(40.97966266078757, -74.07114757611724, 'Pascack Valley', 'Pascack Valley<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(40.90840881131936, -74.09751522619595, 'Bergen', 'Bergen<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(40.805127711492624, -74.1843032421231, 'Essex', 'Essex<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(40.7034533808443, -74.24638506064323, 'Union', 'Union<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(40.48542647749342, -74.30346112353588, 'Raritan', 'Raritan<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(40.25042979413255, -74.08167349210795, 'Asbury Park', 'Asbury Park<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(39.99712478680219, -74.20648964476356, 'Toms River', 'Toms River<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(39.774536858382845, -74.24525374813796, 'Barnegat', 'Barnegat<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(39.61301527712338, -74.4242477966653, 'New Gretna', 'New Gretna<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(39.306735439498446, -74.61829895554904, 'Great Egg SB', 'Great Egg SB<br /> <i>$1.50</i>'));
            tollFacilities.push(new TollFacility(39.193841081492735, -74.70989836286729, 'Cape May', 'Cape May<br /> <i>$1.50</i>'));

            // Interchanges
            tollFacilities.push(new TollFacility(40.95998857641483, -74.0654852051987, 'Paramus  (Northbound)', 'Paramus  (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(40.957846133118, -74.06656065870894, 'Paramus  (Southbound)', 'Paramus  (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(40.905458150934166, -74.10023764149632, 'Saddle Brook  (Northbound)', 'Saddle Brook  (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(40.878292, -74.165733, 'Clifton (Northbound)', 'Clifton (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.876939, -74.168774, 'Clifton (Southbound)', 'Clifton (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.852381, -74.174490, 'Passaic (Northbound)', 'Passaic (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.850310, -74.175135, 'Passaic (Southbound)', 'Passaic (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.829668, -74.176651, 'Watchung (Northbound)', 'Watchung (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.829456, -74.177890, 'Watchung (Southbound)', 'Watchung (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.783995, -74.200702, 'Bloomfield (Northbound)', 'Bloomfield (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.786951, -74.199795, 'Bloomfield (Southbound)', '*Bloomfield (Southbound) Details '));
//            tollFacilities.push(new TollFacility(permanently closed, -permanently closed, 'East Orange (Northbound)', 'East Orange (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.755734, -74.207798, 'East Orange (Southbound)', 'East Orange (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.739493, -74.216166, 'Irvington (Northbound)', 'Irvington (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.739160, -74.217401, 'Irvington (Southbound)', 'Irvington (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.709311, -74.248137, 'Union Ramp (Northbound)', 'Union Ramp (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.482993, -74.302977, 'Sayreville (Southbound)', 'Sayreville (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.421282, -74.215025, 'Matawan (Southbound)', 'Matawan (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.421626, -74.206054, 'Keyport (Northbound)', 'Keyport (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.421626, -74.206054, 'Keyport (Southbound)', 'Keyport (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.372720, -74.143510, 'Holmdel (Northbound)', 'Holmdel (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.375160, -74.150580, 'Holmdel (Southbound)', 'Holmdel (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.339816, -74.101311, 'Red Bank (Northbound)', 'Red Bank (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.337830, -74.102760, 'Red Bank (Southbound)', 'Red Bank (Southbound) Details '));
            tollFacilities.push(new TollFacility(40.284920, -74.083530, 'Eatontown (Northbound)', 'Eatontown (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.174951, -74.098848, 'Belmar/Wall (Northbound)', 'Belmar/Wall (Northbound) Details '));
            tollFacilities.push(new TollFacility(40.174310, -74.101020, 'Belmar/Wall (Southbound)', 'Belmar/Wall (Southbound) Details '));

            tollFacilities.push(new TollFacility(40.10243382067626, -74.13925260108407, 'Brick  (Southbound)', 'Brick  (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(40.10163448563131, -74.13891986639152, 'Brick (Northbound)', 'Brick (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(40.064018298041496, -74.16396905412715, 'Lakewood  (Southbound)', 'Lakewood  (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(40.063338431339034, -74.16266125552126, 'Lakewood (Northbound)', 'Lakewood (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.90594986696987, -74.21291285321689, 'Berkeley  (Southbound)', 'Berkeley  (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.893695928958664, -74.21132800689804, 'Berkeley (Northbound)', 'Berkeley (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.86443455970464, -74.21818800870736, 'Lacey  (Northbound)', 'Lacey  (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.86328013500461, -74.22179258312185, 'Lacey (Southbound)', 'Lacey  (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.79353581523983, -74.2345767081678, 'Waretown (Northbound)', 'Waretown (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.795063053888, -74.23917881904826, 'Waretown (Southbound)', 'Waretown (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.32196143417799, -74.61482424891213, 'Somers Point Ramp (Southbound)', 'Somers Point (Southbound) <br/> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a>'));
            tollFacilities.push(new TollFacility(39.01061324382371, -74.86729376737021, 'Wildwood Ramp (Southbound)', 'Wildwood (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            tollFacilities.push(new TollFacility(39.006982549132196, -74.86533136935493, 'Wildwood Ramp (Northbound)', 'Wildwood (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>'));
            break;
        case 'ACE':
            // Different method of creating ojbects of type TollFacility, this time for each toll facility on the Atlantic City Expressway
            const tollFacilityCoordinates = [
                {lat: 39.73302, lng: -75.00834},
                {lat: 39.70847, lng: -74.97786},
                {lat: 39.66869, lng: -74.89265},
                {lat: 39.61497, lng: -74.82963},
                {lat: 39.50962, lng: -74.68097},
                {lat: 39.44669, lng: -74.62021},
                {lat: 39.43374, lng: -74.58683},
                {lat: 39.40203, lng: -74.52418},
                {lat: 39.39177962258875, lng: -74.51032372222157},
                {lat: 39.51371318827333, lng: -74.686514149208}
            ];

            const tollFacilityNames = [
                'Exit 41',
                'Exit 38',
                'Exit 33',
                'Exit 28',
                'Exit 17',
                'Exit 12',
                'Exit 9',
                'Exit 5',
                'Pleasantville Toll Plaza',
                'Egg Harbor Toll Plaza',
            ];

            const tollFacilityDescriptions = [
                'Exit 41 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3150" target="_blank">Details </a>',
                'Exit 38 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3149" target="_blank">Details </a>',
                'Exit 33 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3148" target="_blank">Details </a>',
                'Exit 28 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3146" target="_blank">Details </a>',
                'Exit 17 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3143" target="_blank">Details </a>',
                'Exit 12 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3140" target="_blank">Details </a>',
                'Exit 9 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3139" target="_blank">Details </a>',
                'Exit 5 <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3137" target="_blank">Details </a>',
                'Pleasantville Toll Plaza <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3135" target="_blank">Details </a>',
                'Egg Harbor Toll Plaza <br/><a href="https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3144" target="_blank">Details </a>',
            ];

            // Loop to create TollFacility objects and push them into the array
            for (let i = 0; i < tollFacilityCoordinates.length; i++) {
                tollFacilities.push(new TollFacility(
                    tollFacilityCoordinates[i].lat,
                    tollFacilityCoordinates[i].lng,
                    tollFacilityNames[i],
                    tollFacilityDescriptions[i]
                ));
            }
            break;
    }   

    for (let i = 0; i < tollFacilities.length; i++) {
        const tollFacilityMarker = new google.maps.Marker({
            position: tollFacilities[i].coordinates,
            map: new_jersey_toll_map,
            title: tollFacilities[i].name,
            icon: {
                url: 'favicon.png',
                scaledSize: new google.maps.Size(25, 25),
            },
        });

        tollFacilityMarkerObjects.push(tollFacilityMarker);

        tollFacilityMarker.addListener('click', () => {
            infoWindow.close();
            infoWindow.setContent(tollFacilities[i].description);
            infoWindow.open(tollFacilityMarker.getMap(), tollFacilityMarker);
        });
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////
// This is not currently being used as of deliver on September 27, 2023
//  USE this to add additional markers by Lat Long coordinates
//  Notice that this function is not being called and the data in there is negligable
//////////////////////////////////////////////////////////////////

function displaytollFacilitysSav(selectedTollway) {

    clearTollFacilityMarkerObjects(); // Clear any marker objects that may be on the map.

    let tollFacilityCoordinates = [];
    let tollFacilityTitles = [];
    let tollFacilityContents = [];
    
    switch (selectedTollway) {
        case 'IJAMT':
            //
            break;
        case 'GSP':
            // Define coordinates for the Garden State Parkway
            tollFacilityCoordinates = [
                {lat: 39.193841081492735, lng: -74.70989836286729},
                {lat: 39.193841081492735, lng: -74.80989836286729},
                {lat: 39.193841081492735, lng: -74.90989836286729},
                {lat: 39.193841081492735, lng: -74.99989836286729},
                {lat: 39.193841081492735, lng: -75.10989836286729},
                {lat: 39.193841081492735, lng: -74.20989836286729},
                {lat: 39.193841081492735, lng: -74.30989836286729},
                {lat: 39.193841081492735, lng: -74.40989836286729},
                {lat: 39.193841081492735, lng: -74.50989836286729},
                {lat: 39.193841081492735, lng: -74.60989836286729},
                {lat: 39.193841081492735, lng: -74.70989836286729},
                {lat: 39.79353581523983, lng: -74.2345767081678},
                {lat: 39.795063053888, lng: -74.23917881904826},
                {lat: 39.006982549132196, lng: -74.86533136935493},
                {lat: 39.01061324382371, lng: -74.86729376737021},
                {lat: 39.32196143417799, lng: -74.61482424891213},

            ];
            tollFacilityContents = [
                'Cape May<br /> <i>$1.50</i>',
                'Great Egg SB<br /> <i>$1.50</i>', 
                'New Gretna<br /> <i>$1.50</i>', 
                'Barnegat<br /> <i>$1.50</i>',
                'Toms River<br /> <i>$1.50</i>',
                'Asbury Park<br /> <i>$1.50</i>',
                'Raritan<br /> <i>$1.50</i>',
                'Union<br /> <i>$1.50</i>',
                'Essex<br /> <i>$1.50</i>', 
                'Bergen<br /> <i>$1.50</i>', 
                'Pascack Valley<br /> <i>$1.50</i>',
                'Waretown (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>',
                'Waretown (Southbound <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>',
                'Wildwood (Northbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>',
                'Wildwood (Southbound) <br /> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a></i>',
                'Somers Point (Southbound) <br/> <a href = "https://www.njta.com/media/3305/toll_rate_schedule_gsp-_final_2017-04-04.pdf" target="_blank">Details </a>',
            ];

            tollFacilityTitles = [
                'Cape May',
                'Great Egg SB', 
                'New Gretna', 
                'Barnegat',
                'Toms River',
                'Asbury Park',
                'Raritan',
                'Union',
                'Essex', 
                'Bergen', 
                'Pascack Valley',
                'Waretown (Northbound)',
                'Waretown (Southbound)',
                'Wildwood Ramp (Northbound) ',
                'Wildwood Ramp (Southbound) ',
                'Somers Point Ramp (Southbound)'
            ];
            break;
        case 'ACE':
            tollFacilityCoordinates = [
                {lat: 39.73302, lng: -75.00834},
                {lat: 39.70847, lng: -74.97786},
                {lat: 39.66869, lng: -74.89265},
                {lat: 39.61497, lng: -74.82963},
                {lat: 39.50962, lng: -74.68097},
                {lat: 39.44669, lng: -74.62021}, 
                {lat: 39.43374, lng: -74.58683},
                {lat: 39.40203, lng: -74.52418},
                {lat: 39.39177962258875, lng: -74.51032372222157},
                {lat: 39.51371318827333, lng: -74.686514149208}
            ];
            tollFacilityContents = [
                'Exit 41 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3150" target="_blank">Details </a>',
                'Exit 38 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3149" target="_blank">Details </a>',
                'Exit 33 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3148" target="_blank">Details </a>',
                'Exit 28 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3146" target="_blank">Details </a>',
                'Exit 17 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3143" target="_blank">Details </a>',
                'Exit 12 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3140" target="_blank">Details </a>',
                'Exit 9 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3139" target="_blank">Details </a>',
                'Exit 5 <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3137" target="_blank">Details </a>',
                'Pleasantville Toll Plaza <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3135" target="_blank">Details </a>',
                'Egg Harbor Toll Plaza <br/><a href = "https://www.sjta.com/acexpressway/acx_map_exit.asp?exit=3144" target="_blank">Details </a>',
            ];
            tollFacilityTitles = [
                'Exit 41',
                'Exit 38',
                'Exit 33',
                'Exit 28',
                'Exit 17',
                'Exit 12',
                'Exit 9',
                'Exit 5',
                'Pleasantville Toll Plaza',
                'Egg Harbor Toll Plaza',
            ];
            break;
    }   
    for (let i = 0; i < tollFacilityCoordinates.length; i++) {
        const tollFacilityMarker = new google.maps.Marker({
            position: tollFacilityCoordinates[i],
            map: new_jersey_toll_map,            
            title: tollFacilityTitles[i],                                       
            icon: {
                url: 'toll-road.png',
                scaledSize: new google.maps.Size(25, 25)           // Updated marker size   
            },
        });
        tollFacilityMarkerObjects.push(tollFacilityMarker);
        tollFacilityMarker.addListener("click", () => {
            infoWindow.close();
            infoWindow.setContent(tollFacilityContents[i]);
            infoWindow.open(tollFacilityMarker.getMap(), tollFacilityMarker);
        });
    }
}


function clearTollFacilityMarkerObjects(){
    for (let i = 0; i < tollFacilityMarkerObjects.length; i++) {
        tollFacilityMarkerObjects[i].setMap(null);
    }
    tollFacilityMarkerObjects = [];
}

