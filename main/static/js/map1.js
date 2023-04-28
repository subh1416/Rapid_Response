
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
        mapboxgl.accessToken =
            "pk.eyJ1Ijoic3ViaDE0MTYiLCJhIjoiY2xlMWt1aWI0MG8xODNvcGRyeWFkcWtseiJ9.dUshhgBnVs4sg3qjK0poAw";
        var lng = position.coords.longitude;
        var lat = position.coords.latitude;
        const map = new mapboxgl.Map({
            container: "map",
            style: "mapbox://styles/mapbox/streets-v12",
            center: [lng, lat], // starting position
            zoom: 17,
            
        });

        // an arbitrary start will always be the same
        // only the end or destination will change

        const start = [lng, lat];
        map.addControl(new mapboxgl.NavigationControl());

        // create a function to make a directions request
        async function getRoute(end) {
            // make a directions request using cycling profile
            // an arbitrary start will always be the same
            // only the end or destination will change
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: "GET" }
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry.coordinates;
            const geojson = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: route,
                },
            };
            // if the route already exists on the map, we'll reset it using setData
            if (map.getSource("route")) {
                map.getSource("route").setData(geojson);
            }
            // otherwise, we'll make a new request
            else {
                map.addLayer({
                    id: "route",
                    type: "line",
                    source: {
                        type: "geojson",
                        data: geojson,
                    },
                    layout: {
                        "line-join": "round",
                        "line-cap": "round",
                    },
                    paint: {
                        "line-color": "#3887be",
                        "line-width": 5,
                        "line-opacity": 0.75,
                    },
                });
            }
            // add turn instructions here at the end
              // get the sidebar and add the instructions
        const instructions = document.getElementById('instructions');
        const steps = data.legs[0].steps;

        let tripInstructions = '';
        for (const step of steps) {
        tripInstructions += `<li>${step.maneuver.instruction}</li>`;
        }
        instructions.innerHTML = `<p><strong>Trip duration: ${Math.floor(
        data.duration / 60
        )} min 🚴 </strong></p><ol>${tripInstructions}</ol>`;
        console.log(instructions.innerHTML)
        }

        const stores = {
            type: "FeatureCollection",
            features: [
              
                
            ],
        };

        /**
         * Assign a unique id to each store. You'll use this `id`
         * later to associate each point on the map with a listing
         * in the sidebar.
         */
        stores.features.forEach((store, i) => {
            store.properties.id = i;
            console.log(store.properties.i);
        });

        map.on("load", () => {
            // make an initial directions request that
            // starts and ends at the same location
            getRoute(start);
            d3.json("datasp", function (err, data) {
                if (err) throw err;
                map.addSource("stores", {
                    type: "geojson",
                    data: data,
                });

                // Add starting point to the map
                map.addLayer({
                    id: "point",
                    type: "circle",
                    source: {
                        type: "geojson",
                        data: {
                            type: "FeatureCollection",
                            features: [
                                {
                                    type: "Feature",
                                    properties: {},
                                    geometry: {
                                        type: "Point",
                                        coordinates: start,
                                    },
                                },
                            ],
                        },
                    },
                    paint: {
                        "circle-radius": 10,
                        "circle-color": "#3887be",
                    },
                });

                buildLocationList(data);
            
                addMarkers();


                /* Get the coordinate of the search result */
                const searchResult = start;

                /**
                 * Calculate distances:
                 * For each store, use turf.disance to calculate the distance
                 * in miles between the searchResult and the store. Assign the
                 * calculated value to a property called `distance`.
                 */
                const options = { units: "miles" };
                for (const store of data.features) {
                    store.properties.distance = turf.distance(
                        searchResult,
                        store.geometry,
                        options
                    );
                }
                data.features.sort((a, b) => {
                    if (a.properties.distance > b.properties.distance) {
                        return 1;
                    }
                    if (a.properties.distance < b.properties.distance) {
                        return -1;
                    }
                    return 0; // a must be equal to b
                });

                /**
                 * Rebuild the listings:
                 * Remove the existing listings and build the location
                 * list again using the newly sorted stores.
                 */
                const listings = document.getElementById("listings");
                while (listings.firstChild) {
                    listings.removeChild(listings.firstChild);
                }
                buildLocationList(data);

                /* Open a popup for the closest store. */
                /*createPopUp(stores.features[0]);

                /** Highlight the listing for the closest store. */
                const activeListing = document.getElementById(
                    `listing-${stores.features[0].properties.id}`
                );
                activeListing.classList.add("active");
                

                /**
                 * Adjust the map camera:
                 * Get a bbox that contains both the geocoder result and
                 * the closest store. Fit the bounds to that bbox.
                 */
                const bbox = getBbox(stores, 0, searchResult);
                map.fitBounds(bbox, {
                    padding: 100,
                });

            });

            
        });


        function getBbox(sortedStores, storeIdentifier, searchResult) {
            const lats = [
                sortedStores.features[storeIdentifier].geometry.coordinates[1],
                searchResult.coordinates[1]
            ];
            const lons = [
                sortedStores.features[storeIdentifier].geometry.coordinates[0],
                searchResult.coordinates[0]
            ];
            const sortedLons = lons.sort((a, b) => {
                if (a > b) {
                    return 1;
                }
                if (a.distance < b.distance) {
                    return -1;
                }
                return 0;
            });
            const sortedLats = lats.sort((a, b) => {
                if (a > b) {
                    return 1;
                }
                if (a.distance < b.distance) {
                    return -1;
                }
                return 0;
            });
            return [
                [sortedLons[0], sortedLats[0]],
                [sortedLons[1], sortedLats[1]]
            ];
        }

        function addMarkers() {
            /* For each feature in the GeoJSON object above: */
            for (const marker of stores.features) {
                /* Create a div element for the marker. */
                const el = document.createElement("div");
                /* Assign a unique `id` to the marker. */
                el.id = `marker-${marker.properties.id}`;
                /* Assign the `marker` class to each marker for styling. */
                el.className = "marker";

                /**
                 * Create a marker using the div element
                 * defined above and add it to the map.
                 **/
                new mapboxgl.Marker(el, { offset: [0, -23] })
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map);

                /**
                 * Listen to the element and when it is clicked, do three things:
                 * 1. Fly to the point
                 * 2. Close all other popups and display popup for clicked store
                 * 3. Highlight listing in sidebar (and remove highlight for all other listings)
                 **/
                el.addEventListener("click", (e) => {
                    /* Fly to the point */
                    flyToStore(marker);
                    /* Close all other popups and display popup for clicked store */
                    createPopUp(marker);
                    /* Highlight listing in sidebar */
                    const activeItem = document.getElementsByClassName("active");
                    e.stopPropagation();
                    
                    if (activeItem[0]) {
                        activeItem[0].classList.remove("active");
                    }
                    const listing = document.getElementById(
                        `listing-${marker.properties.id}`
                    );
                    listing.classList.add("active");
                });
            }
        }

        /**
         * Add a listing for each store to the sidebar.
         **/
        function buildLocationList(stores) {
            
            for (const store of stores.features) {
                
                
                /* Add a new listing section to the sidebar. */
                const listings = document.getElementById("listings");
                
                const listing = listings.appendChild(
                    document.createElement("div")
                );
                /* Assign a unique `id` to the listing. */
                listing.id = `listing-${store.properties.id}`;
                /* Assign the `item` class to each listing for styling. */
                listing.className = `item`;

                /* Add the link to the individual listing created above. */
                const link = listing.appendChild(document.createElement("a"));
                link.href = "#";
                link.className = "title";
                link.id = `link-${store.properties.id}`;
                link.innerHTML = `${store.properties.Hospital_Name}`;

                /* Add details to the individual listing. */
                const details = listing.appendChild(
                    document.createElement("div")
                );
                details.innerHTML = `${store.properties.Location}<br>Emergency Number - ${store.properties.Emergency_Num}<br>Telephone Number - ${store.properties.Telephone}<br> Mobile Number - ${store.properties.Mobile_Number}`;
                

                /**
                 * Listen to the element and when it is clicked, do four things:
                 * 1. Update the `currentFeature` to the store associated with the clicked link
                 * 2. Fly to the point
                 * 3. Close all other popups and display popup for clicked store
                 * 4. Highlight listing in sidebar (and remove highlight for all other listings)
                 **/
                link.addEventListener("click", function () {
                    for (const feature of stores.features) {
                        if (this.id === `link-${feature.properties.id}`) {
                            getRoute(store.geometry.coordinates);
                            createPopUp(feature);
                        }
                    }
                    const activeItem = document.getElementsByClassName("active");
                    
                    if (activeItem[0]) {
                        activeItem[0].classList.remove("active");
                    }
                    this.parentNode.classList.add("active");
                });
                

                if (store.properties.distance) {
                    const roundedDistance =
                        Math.round(store.properties.distance * 100) / 100;
                    details.innerHTML += `<div><strong>${roundedDistance} miles away</strong></div>`;
                }
            }
        }
        const abc = document.getElementById("listings")
        createPopUp(abc[0])
        console.log(abc)

        function createPopUp(currentFeature) {
            const popUps = document.getElementsByClassName("mapboxgl-popup");
            if (popUps[0]) popUps[0].remove();
            const popup = new mapboxgl.Popup({ closeOnClick: false })
                .setLngLat(currentFeature.geometry.coordinates)
                .setHTML(
                    `<h3>${currentFeature.properties.Hospital_Name}</h3><h4>${currentFeature.properties.Location}</h4>`
                )
                .addTo(map);
              
        }
        function flyToStore(currentFeature) {
            map.flyTo({
                center: currentFeature.geometry.coordinates,
                zoom: 15,
            });
        }

      
    });
}


