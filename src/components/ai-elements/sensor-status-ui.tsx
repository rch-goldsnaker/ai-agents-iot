"use client";

/*
 * SensorStatusUI Component
 * 
 * A comprehensive, responsive React component for displaying IoT sensor status and attributes.
 * Features device information, connectivity status, and system metrics with glassmorphism design.
 * 
 * Props:
 * - data: SensorStatusData object containing device attributes, summary info, and metadata
 * - className?: Optional additional CSS classes
 * 
 * Features:
 * - Device connectivity indicators (WiFi, signal strength)
 * - LED status integration
 * - Network information display (IP, MAC, SSID)
 * - Responsive grid layout for multiple attributes
 * - Dynamic status indicators with color coding
 * - Glassmorphism visual effects
 * - Loading state with skeleton UI
 */

import { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Lightbulb, 
  Router, 
  Smartphone, 
  Clock, 
  Activity,
  Signal,
  AlertCircle,
  CheckCircle,
  Database,
  Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SensorAttribute {
  lastUpdateTs: number;
  key: string;
  value: string | number | boolean;
  timestamp: string;
}

interface SensorStatusData {
  entityId: string;
  attributes: SensorAttribute[];
  attributeCount: number;
  summary: {
    macAddress?: string;
    localIp?: string;
    ssid?: string;
    rssi?: number;
    ledState?: boolean;
    ledMode?: number;
    active?: boolean;
  };
  message: string;
  timestamp: string;
}

interface SensorStatusUIProps {
  data: SensorStatusData;
  className?: string;
}

const getSignalStrength = (rssi?: number) => {
  if (!rssi) return { level: 'unknown', color: 'text-gray-400', bars: 0 };
  
  if (rssi >= -50) return { level: 'excellent', color: 'text-green-400', bars: 4 };
  if (rssi >= -60) return { level: 'good', color: 'text-green-300', bars: 3 };
  if (rssi >= -70) return { level: 'fair', color: 'text-yellow-400', bars: 2 };
  if (rssi >= -80) return { level: 'poor', color: 'text-orange-400', bars: 1 };
  return { level: 'very poor', color: 'text-red-400', bars: 1 };
};

const getDeviceStatus = (active?: boolean) => {
  return active 
    ? { status: 'Online', color: 'text-green-400', bg: 'bg-green-400/20', border: 'border-green-400/30' }
    : { status: 'Offline', color: 'text-red-400', bg: 'bg-red-400/20', border: 'border-red-400/30' };
};

const getLedStatus = (ledState?: boolean) => {
  return ledState 
    ? { status: 'ON', color: 'text-green-400', icon: Lightbulb }
    : { status: 'OFF', color: 'text-red-400', icon: Lightbulb };
};

export function SensorStatusUI({ data, className }: SensorStatusUIProps) {
  const [mounted, setMounted] = useState(false);
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const signal = getSignalStrength(data.summary.rssi);
  const deviceStatus = getDeviceStatus(data.summary.active);
  const ledStatus = getLedStatus(data.summary.ledState);
  const date = new Date(data.timestamp);
  const LedIcon = ledStatus.icon;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-500",
      "from-blue-400/10 to-indigo-500/10 border-blue-400/30",
      animated ? "scale-100 opacity-100" : "scale-95 opacity-0",
      className
    )}>
      {/* Background gradient */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400/5 to-indigo-500/5" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-400/20 shadow-lg shadow-blue-400/20">
              <Database className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Sensor Status
              </h3>
              <p className="text-sm text-muted-foreground">
                Device Information & Connectivity
              </p>
            </div>
          </div>
          
          {/* Device status indicator */}
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium border",
            deviceStatus.bg,
            deviceStatus.color,
            deviceStatus.border
          )}>
            {deviceStatus.status}
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* WiFi Status */}
          <div className="p-4 rounded-lg bg-background/30 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              {data.summary.ssid ? (
                <Wifi className={cn("w-5 h-5", signal.color)} />
              ) : (
                <WifiOff className="w-5 h-5 text-red-400" />
              )}
              <span className="text-sm font-medium text-foreground">WiFi</span>
            </div>
            {data.summary.ssid ? (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground truncate">
                  {data.summary.ssid}
                </p>
                <div className="flex items-center gap-2">
                  <Signal className={cn("w-3 h-3", signal.color)} />
                  <span className={cn("text-xs", signal.color)}>
                    {data.summary.rssi} dBm ({signal.level})
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-red-400">Disconnected</p>
            )}
          </div>

          {/* LED Status */}
          <div className="p-4 rounded-lg bg-background/30 border border-border/50">
            <div className="flex items-center gap-3 mb-2">
              <LedIcon className={cn("w-5 h-5", ledStatus.color)} />
              <span className="text-sm font-medium text-foreground">LED</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                data.summary.ledState ? "bg-green-400 animate-pulse" : "bg-red-400"
              )} />
              <span className={cn("text-sm", ledStatus.color)}>
                {ledStatus.status}
              </span>
              {data.summary.ledMode !== undefined && (
                <span className="text-xs text-muted-foreground">
                  (Mode: {data.summary.ledMode})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Network Information */}
        {(data.summary.localIp || data.summary.macAddress) && (
          <div className="p-4 rounded-lg bg-background/30 border border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-foreground">Network</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {data.summary.localIp && (
                <div className="flex items-center gap-2">
                  <Router className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">IP:</span>
                  <span className="text-foreground font-mono">
                    {data.summary.localIp}
                  </span>
                </div>
              )}
              {data.summary.macAddress && (
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">MAC:</span>
                  <span className="text-foreground font-mono text-xs">
                    {data.summary.macAddress}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attributes Summary */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="w-4 h-4" />
            <span>{data.attributeCount} attributes total</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {date.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </span>
          </div>
        </div>

        {/* Status message */}
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-background/50 border border-border/50 backdrop-blur-sm">
            {data.summary.active ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <AlertCircle className="w-3 h-3 text-red-400" />
            )}
            {data.message}
          </div>
        </div>

        {/* Device ID */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Device: {data.entityId.slice(0, 8)}...{data.entityId.slice(-8)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SensorStatusUI;