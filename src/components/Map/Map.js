import React, {Component} from "react";
import GoogleMapReact from 'google-map-react';
import {Marker} from "../Marker/Marker";
import {Point} from "../Point/Point";


class Map extends Component {
    static defaultProps = {
        center: {lat: 60.45148, lng: 22.26869},
        zoom: 11
    };

    // makes marker load while initial render
    //  static renderMarkers(map, maps, lat, lng) {
    //      let marker = new maps.Marker({
    //          position: {lat: lat, lng: lng},
    //          map
    //      });
    //  }

    render() {
        let markers = [];
        if (this.props.markers !== null) {
            markers = this.props.markers.map(item => {
                return <Marker
                    lat={item.get("lat")}
                    lng={item.get("lng")}/>
            });
        }

        let route = [];
        if (this.props.route !== null) {
            route = this.props.route.map(item => {
                return <Point
                    lat={item.lat}
                    lng={item.lng}/>
            });
        }

        return (
            <GoogleMapReact defaultCenter={this.props.center}
                            center={this.props.center}
                            defaultZoom={this.props.zoom}
                            bootstrapURLKeys={{key: 'AIzaSyBhogmDOm3jU1RERtYAc0S_JR5o3JoYfBc'}}
                //onGoogleApiLoaded={({map, maps}) => this.renderMarkers(map, maps)}
                            yesIWantToUseGoogleMapApiInternals={true}>
                {markers.length > 0 ? markers : null}
                {route.length > 0 ? route : null}
            </GoogleMapReact>
        )
    }
}


export default Map;

