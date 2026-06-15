import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Search, Loader2 } from 'lucide-react';

// Fix for default marker icon in react-leaflet
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onChange: (lat: number, lng: number) => void;
}

const MapUpdater = ({ center }: { center: L.LatLngExpression }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, 15);
    }, [center, map]);
    return null;
};

const FixMapRender = () => {
    const map = useMap();
    useEffect(() => {
        // Leaflet maps often render incorrectly if their container size changes or if they are in a modal.
        // This forces the map to recalculate its size after a short delay.
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 300);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const LocationMarker = ({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) => {
    const markerRef = useRef<L.Marker>(null);
    
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    return position === null ? null : (
        <Marker 
            draggable={true} 
            eventHandlers={eventHandlers} 
            position={position} 
            ref={markerRef}
        ></Marker>
    );
};

const LocationPicker: React.FC<LocationPickerProps> = ({ latitude, longitude, onChange }) => {
    const defaultCenter: L.LatLngExpression = [13.0827, 80.2707]; // Default to Chennai
    const [position, setPosition] = useState<L.LatLng | null>(
        latitude && longitude ? L.latLng(latitude, longitude) : null
    );
    const [mapCenter, setMapCenter] = useState<L.LatLngExpression>(
        latitude && longitude ? [latitude, longitude] : defaultCenter
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (position) {
            onChange(position.lat, position.lng);
        }
    }, [position]);

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);
                const newPos = L.latLng(lat, lon);
                setPosition(newPos);
                setMapCenter([lat, lon]);
            } else {
                alert("Location not found. Try adding city name (e.g., 'Arakkonam, Tamil Nadu').");
            }
        } catch (err) {
            console.error(err);
            alert("Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 h-full p-2">
            <form onSubmit={handleSearch} className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Search city or area (e.g., Arakkonam)" 
                    className="flex-1 bg-white p-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 outline-none shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    type="submit" 
                    disabled={isSearching}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center justify-center shadow-sm disabled:opacity-50"
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
            </form>
            <div className="flex-1 w-full overflow-hidden z-0 relative shadow-inner">
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg text-xs font-bold text-gray-800 pointer-events-none whitespace-nowrap border border-gray-200">
                    Tap map or drag pin to adjust
                </div>
                <MapContainer 
                    center={mapCenter} 
                    zoom={position ? 15 : 10} 
                    className="h-full w-full z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <FixMapRender />
                    <MapUpdater center={mapCenter} />
                    <LocationMarker position={position} setPosition={setPosition} />
                </MapContainer>
            </div>
        </div>
    );
};

export default LocationPicker;
