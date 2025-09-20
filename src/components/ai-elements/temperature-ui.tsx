"use client";

/*
 * TemperatureUI Component
 * 
 * A beautiful, responsive React component for displaying IoT temperature sensor data.
 * Features dynamic color coding, day/night indicators, and glassmorphism design.
 * 
 * Props:
 * - data: TemperatureData object containing temperature, unit, timestamp, sensorId, and source
 * - className?: Optional additional CSS classes
 * 
 * Features:
 * - Dynamic temperature color coding (cold to hot gradient)
 * - Day/night time indicator icons
 * - Responsive design for mobile and desktop
 * - Glassmorphism visual effects
 * - Loading state with skeleton UI
 */

import { useState, useEffect } from 'react';
import { Thermometer, Sun, Moon, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemperatureData {
  temperature: string;
  unit: string;
  timestamp: string;
  sensorId: string;
  source: string;
}

interface TemperatureUIProps {
  data: TemperatureData;
  className?: string;
}

const getTimeIcon = (date: Date) => {
  const hour = date.getHours();
  return hour >= 6 && hour < 20 ? Sun : Moon;
};

const getTemperatureColor = (temp: number) => {
  if (temp <= 0) return 'text-blue-400';
  if (temp <= 10) return 'text-blue-300';
  if (temp <= 20) return 'text-green-400';
  if (temp <= 30) return 'text-yellow-400';
  if (temp <= 35) return 'text-orange-400';
  return 'text-red-400';
};

const getTemperatureBg = (temp: number) => {
  if (temp <= 0) return 'from-blue-500/10 to-blue-600/10';
  if (temp <= 10) return 'from-blue-400/10 to-blue-500/10';
  if (temp <= 20) return 'from-green-400/10 to-green-500/10';
  if (temp <= 30) return 'from-yellow-400/10 to-yellow-500/10';
  if (temp <= 35) return 'from-orange-400/10 to-orange-500/10';
  return 'from-red-400/10 to-red-500/10';
};

export function TemperatureUI({ data, className }: TemperatureUIProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const date = new Date(data.timestamp);
  const temperature = parseFloat(data.temperature);
  const TimeIcon = getTimeIcon(date);
  const isDay = date.getHours() >= 6 && date.getHours() < 20;
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br",
      getTemperatureBg(temperature),
      "backdrop-blur-sm p-6 shadow-lg transition-all duration-300 hover:shadow-xl",
      className
    )}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Header with time indicator */}
      <div className="relative flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-full",
            isDay ? "bg-yellow-400/20 text-yellow-400" : "bg-blue-400/20 text-blue-400"
          )}>
            <TimeIcon className="w-4 h-4" />
          </div>
          <span className="text-sm text-muted-foreground">
            {isDay ? 'Día' : 'Noche'}
          </span>
        </div>
        
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Thermometer className="w-3 h-3" />
          <span>Sensor</span>
        </div>
      </div>

      {/* Main temperature display */}
      <div className="relative text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Thermometer className={cn("w-8 h-8", getTemperatureColor(temperature))} />
          <span className={cn(
            "text-5xl font-bold tabular-nums",
            getTemperatureColor(temperature)
          )}>
            {temperature.toFixed(1)}
          </span>
          <span className={cn(
            "text-2xl font-semibold mt-2",
            getTemperatureColor(temperature)
          )}>
            {data.unit}
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Temperatura actual
        </div>
      </div>

      {/* Date and time information */}
      <div className="relative space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground/80 capitalize">
            {formatDate(date)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground/80">
            Última medición: {formatTime(date)}
          </span>
        </div>
        
        {/* Source information */}
        <div className="pt-2 border-t border-border/30">
          <div className="text-xs text-muted-foreground">
            Fuente: <span className="text-foreground/60">{data.source}</span>
          </div>
        </div>
      </div>

      {/* Ambient decoration based on temperature */}
      <div className={cn(
        "absolute top-4 right-4 w-16 h-16 rounded-full opacity-10 blur-xl",
        temperature > 25 ? "bg-red-400" : temperature > 15 ? "bg-yellow-400" : "bg-blue-400"
      )} />
    </div>
  );
}