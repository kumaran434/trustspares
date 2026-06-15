import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Clock } from 'lucide-react';

// Fix for default marker icon in react-leaflet
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface ShopMapPreviewProps {
    latitude: number;
    longitude: number;
    shopName: string;
}

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const ShopMapPreview: React.FC<ShopMapPreviewProps> = ({ latitude, longitude, shopName }) => {
    const [distance, setDistance] = useState<number | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const dist = calculateDistance(position.coords.latitude, position.coords.longitude, latitude, longitude);
                setDistance(dist);
            }, () => {
                console.log("Geolocation permission denied or failed.");
            });
        }
    }, [latitude, longitude]);

    const position: L.LatLngExpression = [latitude, longitude];
    
    // Estimate time: assume 25 km/h average city speed
    const estimatedMinutes = distance ? Math.round((distance / 25) * 60) : null;

    return (
        <div className="flex flex-col gap-2 mt-2 mb-2">
            {distance !== null && estimatedMinutes !== null && (
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-blue-100 shadow-sm">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                        <MapPin size={14} className="text-blue-600" />
                        <span>{distance < 1 ? `${Math.round(distance * 1000)} m` : `${distance.toFixed(1)} km`}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs">
                        <Clock size={14} className="text-blue-600" />
                        <span>~{estimatedMinutes} mins</span>
                    </div>
                </div>
            )}
            <div className="h-28 w-full rounded-xl overflow-hidden border border-gray-200 z-0 relative shadow-inner">
                <MapContainer center={position} zoom={15} className="h-full w-full z-0" zoomControl={false} dragging={false} scrollWheelZoom={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                </MapContainer>
                {/* Overlay to prevent map interaction stealing scroll */}
                <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_10px_rgba(0,0,0,0.1)]"></div>
            </div>
        </div>
    );
};

export default ShopMapPreview;
