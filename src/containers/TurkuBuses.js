import React, {Component} from 'react';
import axios from 'axios';
import Controls from "../components/Controls/Controls"
import Aux from '../hoc/Auxx/Auxx'
import GoogleMap from '../components/Map/Map'
import MediaQuery from 'react-responsive';
import './TurkuBuses.css'

class TurkuBuses extends Component {
    state = {
        version: 0,
        name_idRoutes: {},
        routes: [],
        selectedRoute: null,
        isSelected: false,
        busTrip: null,
        markers: null
    };

    // fetches version after component mounting
    componentDidMount() {
        this.fetchVersion();
    };

    // fetching version info
    fetchVersion = () => {
        axios.all([axios.get('https://data.foli.fi/gtfs/')
        ]).then(axios.spread((response) => {
            let version = response.data.latest;
            this.setState({version: version});
            this.fetchRouteNumbers(version);
        })).catch(error => console.log(error));
    };

    // fetching route names data
    fetchRouteNumbers = (version) => {
        axios.all([axios.get("https://data.foli.fi/gtfs/v0/" + version + "/routes")
        ]).then(axios.spread((response) => {
            this.saveRoutes(response.data);
        })).catch(error => console.log(error));
    };

    // saving route numbers as options in drop down menu
    saveRoutes = (data) => {
        let route;
        let routes = [];
        let name_idRoutes = new Map();
        for (let i = 0; i < data.length; i++) {
            route = data[i].route_short_name;
            routes.push(route);
            name_idRoutes.set(route, data[i].route_id);
        }
        routes = routes.sort();
        this.setState({name_idRoutes, routes});
    };

    // called after hitting Show route button; obtains route ID and calls function to find shape ID
    showRoute = () => {
        if (!this.state.isSelected) {
            alert("Select route first.");
        } else {
            let selectedRoute = this.state.selectedRoute;
            if (this.state.isSelected) {
                this.deleteMarkers();
                let busID = this.state.name_idRoutes.get(selectedRoute);
                this.findShapeId(busID);
            }
        }
    };

    // finds shape ID and calls function that obtains coordinates of given shape
    findShapeId = (busid) => {
        let shapeID;
        axios.all([axios.get("https://data.foli.fi/gtfs/v0/" + this.state.version + "/trips/route/" + busid)
        ]).then(axios.spread((response) => {
            shapeID = response.data[0].shape_id;
            this.findShapeCoords(shapeID);
        })).catch(error => console.log(error));
    };


    // obtains data about shapes and calls function to get required coordinates and drawing function
    findShapeCoords = (shapeid) => {
        axios.all([axios.get("https://data.foli.fi/gtfs/v0/" + this.state.version + "/shapes/" + shapeid)
        ]).then(axios.spread((response) => {
            this.getRouteCoords(response.data);
        })).catch(error => console.log(error));
    };

    // getting required route coordinates
    getRouteCoords = (data) => {
        let routeCoordinates = [];
        let lat;
        let lng;
        for (let i = 0; i < data.length; i++) {
            lat = data[i].lat;
            lng = data[i].lon;
            routeCoordinates.push({lat: lat, lng: lng});
        }
        this.setState({busTrip: routeCoordinates});
    };

    // reacts to changed select value
    selectHandler = (event) => {
        this.setState({selectedRoute: event.target.value, isSelected: true});
    };

    // show buses button click handler, gets data from API
    showBuses = (event) => {
        this.showRoute();
        this.fetchBusData(event.target.value);
    };

    // fetches bus data
    fetchBusData = () => {
        if (this.state.isSelected) {
            axios.all([axios.get("https://data.foli.fi/siri/vm/pretty")
            ]).then(axios.spread((response) => {
                this.getBusesCoords(response.data);
            })).catch(error => console.log(error));
        } else {
            alert("Select route first.");
        }
    };

    // getting selected bus line coordinates of buses
    getBusesCoords = (data) => {
        let vehicles = data.result.vehicles;
        let keys = Object.keys(vehicles);
        let coordPairs = new Map();
        let listOfCoordPairs = [];
        for (let i in keys) {
            if (vehicles[keys[i]] !== undefined) {
                let vehicle = vehicles[keys[i]];
                if (vehicle["publishedlinename"] === this.state.selectedRoute) {
                    coordPairs.set("lat", vehicle.latitude);
                    coordPairs.set("lng", vehicle.longitude);
                    listOfCoordPairs.push(coordPairs);
                }
            }
        }
        this.setState({markers: listOfCoordPairs});
        if (listOfCoordPairs.length === 0) {
            alert("No buses no. " + this.state.selectedRoute + " running at this moment.");
            if (this.state.busTrip || this.state.markers) {
                this.deleteRoute();
                this.deleteMarkers();
            }
        }
    };

    // deleting shown route
    deleteRoute = () => {
        if (this.state.busTrip != null) {
            this.setState({busTrip: null});
        }
    };

    // deletes existing markers
    deleteMarkers = () => {
        let markers = this.state.markers;
        if (markers !== null) {
            this.setState({markers: null});
        }
    };

    // called after hitting Refresh button
    refresh = () => {
        if (this.state.markers !== null) {
            this.fetchBusData();
        }
    };

    render() {

        return (
            <Aux>
                <MediaQuery query='(min-device-width: 800px)'>
                    <div className="main-large">
                        <div className="left-large">
                            <Controls options={this.state.routes}
                                      handleSelect={this.selectHandler}
                                      showBuses={this.showBuses}
                                      refresh={this.refresh}
                                      showRoute={this.showRoute}
                                      size="large"
                            /></div>
                        <div className="right-large"><GoogleMap markers={this.state.markers}
                                                                route={this.state.busTrip}/></div>
                    </div>
                </MediaQuery>
                <MediaQuery query='(max-device-width: 799px)'>
                    <div className="main-small">
                        <div className="left-small">
                            <Controls options={this.state.routes}
                                      handleSelect={this.selectHandler}
                                      showBuses={this.showBuses}
                                      refresh={this.refresh}
                                      showRoute={this.showRoute}
                                      size="small"
                            /></div>
                        <div className="right-small"><GoogleMap markers={this.state.markers}
                                                                route={this.state.busTrip}/>
                        </div>
                    </div>
                </MediaQuery>
            </Aux>
        )
    }
}

export default TurkuBuses;

