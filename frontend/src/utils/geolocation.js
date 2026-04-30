/**
 * Geolocation Service
 * Handles browser-based GPS tracking with high accuracy
 */

class GeolocationService {
  constructor() {
    this.watcherId = null;
    this.isTracking = false;
    this.currentPosition = null;
    this.onLocationUpdate = null;
    this.onError = null;
    
    // Geolocation options
    this.options = {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    };
  }

  /**
   * Start watching user location
   * @param {Function} onUpdate - Callback when location updates
   * @param {Function} onError - Callback on error
   */
  startTracking(onUpdate, onError) {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by this browser';
      onError?.(error);
      return;
    }

    if (this.isTracking) {
      console.warn('Tracking is already active');
      return;
    }

    this.onLocationUpdate = onUpdate;
    this.onError = onError;
    this.isTracking = true;

    this.watcherId = navigator.geolocation.watchPosition(
      this.handleSuccess.bind(this),
      this.handleError.bind(this),
      this.options
    );
  }

  /**
   * Stop watching location
   */
  stopTracking() {
    if (this.watcherId !== null) {
      navigator.geolocation.clearWatch(this.watcherId);
      this.watcherId = null;
      this.isTracking = false;
      this.currentPosition = null;
    }
  }

  /**
   * Handle successful position update
   */
  handleSuccess(position) {
    const { latitude, longitude, accuracy, timestamp } = position.coords;
    
    this.currentPosition = {
      lat: latitude,
      lng: longitude,
      accuracy,
      timestamp: new Date(timestamp).toISOString(),
    };

    // Call the update callback
    this.onLocationUpdate?.(this.currentPosition);
  }

  /**
   * Handle geolocation error
   */
  handleError(error) {
    let message = 'Unknown error';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable GPS in settings.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information is unavailable.';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out. Retrying...';
        break;
      default:
        message = `Error: ${error.message}`;
    }

    console.error('Geolocation error:', message);
    this.onError?.(message);
  }

  /**
   * Get current position (one-time)
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject('Geolocation is not supported');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp).toISOString(),
          });
        },
        (error) => {
          reject(error.message);
        },
        this.options
      );
    });
  }

  /**
   * Check if tracking is active
   */
  isActive() {
    return this.isTracking;
  }

  /**
   * Get last known position
   */
  getLastPosition() {
    return this.currentPosition;
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
export default GeolocationService;
