import { Loader } from '@googlemaps/js-api-loader';

class MapsService {
  private map: google.maps.Map | null = null;
  private placesService: google.maps.places.PlacesService | null = null;

  async initMap(mapId: string, center: { lat: number; lng: number }, zoom: number = 12) {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
      libraries: ['places'],
    });

    const google = await loader.load();
    const mapElement = document.getElementById(mapId);

    if (!mapElement) return null;

    this.map = new google.maps.Map(mapElement, {
      center,
      zoom,
      styles: this.getMapStyles(),
    });

    this.placesService = new google.maps.places.PlacesService(this.map);

    return this.map;
  }

  async searchNearbyPlaces(
    location: { lat: number; lng: number },
    type: string,
    radius: number = 5000
  ) {
    if (!this.placesService) return [];

    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type,
    };

    return new Promise((resolve, reject) => {
      this.placesService!.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(results);
        } else {
          reject(status);
        }
      });
    });
  }

  async getPlaceDetails(placeId: string) {
    if (!this.placesService) return null;

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails({ placeId }, (result, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && result) {
          resolve(result);
        } else {
          reject(status);
        }
      });
    });
  }

  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
  ) {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    await loader.load();
    const directionsService = new google.maps.DirectionsService();

    return new Promise((resolve, reject) => {
      directionsService.route(
        {
          origin: new google.maps.LatLng(origin.lat, origin.lng),
          destination: new google.maps.LatLng(destination.lat, destination.lng),
          travelMode,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve(result);
          } else {
            reject(status);
          }
        }
      );
    });
  }

  private getMapStyles() {
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ];
  }
}

export const mapsService = new MapsService();
