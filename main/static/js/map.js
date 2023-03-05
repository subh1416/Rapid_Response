
if (navigator.geolocation) {
    
    navigator.geolocation.getCurrentPosition(function (position) {



        mapboxgl.accessToken = 'pk.eyJ1Ijoic3ViaDE0MTYiLCJhIjoiY2xlMWt1aWI0MG8xODNvcGRyeWFkcWtseiJ9.dUshhgBnVs4sg3qjK0poAw';
        var lng = position.coords.longitude;
        var lat = position.coords.latitude;
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat], // starting position
            zoom: 15
        });
        


        // an arbitrary start will always be the same
        // only the end or destination will change

        const start = [lng, lat];
        console.log(start)

        // create a function to make a directions request
        async function getRoute(end) {
            // make a directions request using cycling profile
            // an arbitrary start will always be the same
            // only the end or destination will change
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            const data = json.routes[0];
            const route = data.geometry.coordinates;
            const geojson = {
                type: 'Feature',
                properties: {},
                geometry: {
                    type: 'LineString',
                    coordinates: route
                }
            };
            // if the route already exists on the map, we'll reset it using setData
            if (map.getSource('route')) {
                map.getSource('route').setData(geojson);
            }
            // otherwise, we'll make a new request
            else {
                map.addLayer({
                    id: 'route',
                    type: 'line',
                    source: {
                        type: 'geojson',
                        data: geojson
                    },
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round'
                    },
                    paint: {
                        'line-color': '#3887be',
                        'line-width': 5,
                        'line-opacity': 0.75
                    }
                });
            }
            // add turn instructions here at the end
        }

        const stores = {
            'type': 'FeatureCollection',
            'features': [
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'Sion Hospital',
                        'Address': '2250 Leestown Rd'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [72.8599, 19.0363]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'Kj Somaiya Hospital',
                        'Address': 'near kjsit-world popular institute'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [72.8746, 19.0475]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'Central Baptist Hospital',
                        'Address': '1740 Nicholasville Rd'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.512283, 38.018918]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'VA Medical Center -- Cooper Dr Division',
                        'Address': '1101 Veterans Dr'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.506483, 38.02972]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'Shriners Hospital for Children',
                        'Address': '1900 Richmond Rd'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.472941, 38.022564]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'Eastern State Hospital',
                        'Address': '627 W Fourth St'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.498816, 38.060791]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'Cardinal Hill Rehabilitation Hospital',
                        'Address': '2050 Versailles Rd'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.54212, 38.046568]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'St. Joseph Hospital',
                        'ADDRESS': '1 St Joseph Dr'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.523636, 38.032475]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'UK Healthcare Good Samaritan Hospital',
                        'Address': '310 S Limestone'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.501222, 38.042123]
                    }
                },
                {
                    'type': 'Feature',
                    'properties': {
                        'Name': 'UK Medical Center',
                        'Address': '800 Rose St'
                    },
                    'geometry': {
                        'type': 'Point',
                        'coordinates': [-84.508205, 38.031254]
                    }
                }
            ]
        };

        /**
         * Assign a unique id to each store. You'll use this `id`
         * later to associate each point on the map with a listing
         * in the sidebar.
         */
        stores.features.forEach((store, i) => {
            store.properties.id = i;
            console.log(store.properties.i)
        });

        map.on('load', () => {
            // make an initial directions request that
            // starts and ends at the same location
            getRoute(start);
            d3.json(
                'datas',
                function(err, data) {
                  if (err) throw err;
                  map.addSource('stores', {
                            'type': 'geojson',
                            'data': data
                      });

            // Add starting point to the map
            map.addLayer({
                id: 'point',
                type: 'circle',
                source: {
                    type: 'geojson',
                    data: {
                        type: 'FeatureCollection',
                        features: [
                            {
                                type: 'Feature',
                                properties: {},
                                geometry: {
                                    type: 'Point',
                                    coordinates: start
                                }
                            }
                        ]
                    }
                },
                paint: {
                    'circle-radius': 10,
                    'circle-color': '#3887be'
                }
            });
            buildLocationList(data);
            addMarkers();
        });


            map.on('click', (event) => {
                const coords = Object.keys(event.lngLat).map((key) => event.lngLat[key]);
                console.log(coords)
                const end = {
                    type: 'FeatureCollection',
                    features: [
                        {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: coords
                            }
                        }
                    ]
                };
                if (map.getLayer('end')) {
                    map.getSource('end').setData(end);
                } else {
                    map.addLayer({
                        id: 'end',
                        type: 'circle',
                        source: {
                            type: 'geojson',
                            data: {
                                type: 'FeatureCollection',
                                features: [
                                    {
                                        type: 'Feature',
                                        properties: {},
                                        geometry: {
                                            type: 'Point',
                                            coordinates: coords
                                        }
                                    }
                                ]
                            }
                        },
                        paint: {
                            'circle-radius': 10,
                            'circle-color': '#f30'
                        }
                    });
                }
                getRoute(coords);
            });



        });
        function addMarkers() {
            /* For each feature in the GeoJSON object above: */
            for (const marker of stores.features) {
                /* Create a div element for the marker. */
                const el = document.createElement('div');
                /* Assign a unique `id` to the marker. */
                el.id = `marker-${marker.properties.id}`;
                /* Assign the `marker` class to each marker for styling. */
                el.className = 'marker';

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
                el.addEventListener('click', (e) => {
                    /* Fly to the point */
                    flyToStore(marker);
                    /* Close all other popups and display popup for clicked store */
                    createPopUp(marker);
                    /* Highlight listing in sidebar */
                    const activeItem = document.getElementsByClassName('active');
                    e.stopPropagation();
                    if (activeItem[0]) {
                        activeItem[0].classList.remove('active');
                    }
                    const listing = document.getElementById(
                        `listing-${marker.properties.id}`
                    );
                    listing.classList.add('active');
                });
            }
        }

        /**
         * Add a listing for each store to the sidebar.
         **/
        function buildLocationList(stores) {
            
            for (const store of stores.features) {
                
                    /* Add a new listing section to the sidebar. */
                    const listings = document.getElementById('listings');
                    const listing = listings.appendChild(document.createElement('div'));
                    /* Assign a unique `id` to the listing. */
                    listing.id = `listing-${store.properties.id}`;
                    /* Assign the `item` class to each listing for styling. */
                    listing.className = 'item';

                    /* Add the link to the individual listing created above. */
                    const link = listing.appendChild(document.createElement('a'));
                    link.href = '#';
                    link.className = 'title';
                    link.id = `link-${store.properties.id}`;
                    link.innerHTML = `${store.properties.Hospital_Name}`;

                    /* Add details to the individual listing. */
                    const details = listing.appendChild(document.createElement('div'));
                    details.innerHTML = `${store.properties.Location}`;


                    /**
                     * Listen to the element and when it is clicked, do four things:
                     * 1. Update the `currentFeature` to the store associated with the clicked link
                     * 2. Fly to the point
                     * 3. Close all other popups and display popup for clicked store
                     * 4. Highlight listing in sidebar (and remove highlight for all other listings)
                     **/
                    link.addEventListener('click', function () {
                        for (const feature of stores.features) {
                            if (this.id === `link-${feature.properties.id}`) {
                                getRoute(store.geometry.coordinates)
                                createPopUp(feature);
                            }
                        }
                        const activeItem = document.getElementsByClassName('active');
                        if (activeItem[0]) {
                            activeItem[0].classList.remove('active');
                        }
                        this.parentNode.classList.add('active');


                    });
                }
            
        }

        function createPopUp(currentFeature) {
            const popUps = document.getElementsByClassName('mapboxgl-popup');
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
                zoom: 15
            });
        }


    });
}

