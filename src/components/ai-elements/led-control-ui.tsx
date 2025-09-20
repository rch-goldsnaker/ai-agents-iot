"use client";

/*
 * LedControlUI Component
 * 
 * A beautiful, responsive React component for displaying LED control results.
 * Features dynamic state indicators, animated transitions, and glassmorphism design.
 * 
 * Props:
 * - data: LedControlData object containing ledState, message, timestamp, and entityId
 * - className?: Optional additional CSS classes
 * 
 * Features:
 * - Animated LED state visualization (on/off with glow effects)
 * - Dynamic color coding (green for on, red for off)
 * - Interactive-style toggle visualization
 * - Responsive design for mobile and desktop
 * - Glassmorphism visual effects
 * - Loading state with skeleton UI
 */

import { useState, useEffect } from 'react';
import { Lightbulb, Zap, Power, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LedControlData {
  ledState: boolean;
  message: string;
  timestamp: string;
  entityId: string;
}

interface LedControlUIProps {
  data: LedControlData;
  className?: string;
}

const getLedStateColor = (isOn: boolean) => {
  return isOn 
    ? 'from-green-400/20 to-emerald-500/20 border-green-400/30' 
    : 'from-red-400/20 to-red-500/20 border-red-400/30';
};

const getLedTextColor = (isOn: boolean) => {
  return isOn ? 'text-green-400' : 'text-red-400';
};

export function LedControlUI({ data, className }: LedControlUIProps) {
  const [mounted, setMounted] = useState(false);
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const date = new Date(data.timestamp);
  const isOn = data.ledState;

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border backdrop-blur-md transition-all duration-500",
      getLedStateColor(isOn),
      animated ? "scale-100 opacity-100" : "scale-95 opacity-0",
      className
    )}>
      {/* Background glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl transition-all duration-1000",
        isOn ? "bg-green-400/5" : "bg-red-400/5"
      )} />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-3 rounded-full transition-all duration-500",
              isOn 
                ? "bg-green-400/20 shadow-lg shadow-green-400/30" 
                : "bg-red-400/20 shadow-lg shadow-red-400/20"
            )}>
              <Lightbulb className={cn(
                "w-6 h-6 transition-all duration-500",
                getLedTextColor(isOn),
                isOn && "drop-shadow-sm"
              )} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                LED Control
              </h3>
              <p className="text-sm text-muted-foreground">
                Device Status Update
              </p>
            </div>
          </div>
          
          {/* Status indicator */}
          <div className={cn(
            "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500",
            isOn 
              ? "bg-green-400/20 text-green-300 border border-green-400/30" 
              : "bg-red-400/20 text-red-300 border border-red-400/30"
          )}>
            {isOn ? "ON" : "OFF"}
          </div>
        </div>

        {/* LED Visualization */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            {/* LED bulb container */}
            <div className={cn(
              "w-20 h-20 rounded-full border-4 transition-all duration-700 flex items-center justify-center relative",
              isOn 
                ? "border-green-400 bg-green-400/30 shadow-2xl shadow-green-400/50" 
                : "border-red-400 bg-red-400/20 shadow-lg shadow-red-400/20"
            )}>
              {/* Power icon for off state */}
              {!isOn && (
                <Power className="w-8 h-8 text-red-400" />
              )}
              
              {/* Zap icon for on state - properly centered */}
              {isOn && (
                <Zap className="w-8 h-8 text-green-200 animate-pulse relative z-10" />
              )}
              
              {/* Inner glow - positioned behind the icon */}
              {isOn && (
                <div className="absolute inset-2 rounded-full bg-green-400/40 animate-pulse" />
              )}
            </div>
            
            {/* Radiating glow effect for ON state */}
            {isOn && (
              <>
                <div className="absolute inset-0 w-20 h-20 rounded-full border border-green-400/20 animate-ping" />
                <div className="absolute inset-0 w-24 h-24 -m-2 rounded-full border border-green-400/10 animate-ping" style={{ animationDelay: '0.5s' }} />
              </>
            )}
          </div>
        </div>

        {/* Status message */}
        <div className="text-center mb-4">
          <p className={cn(
            "text-lg font-medium transition-colors duration-500",
            getLedTextColor(isOn)
          )}>
            {data.message}
          </p>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="w-4 h-4" />
            <span className="truncate">
              {data.entityId.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Action indicator */}
        <div className="mt-4 text-center">
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all duration-500",
            "bg-background/50 border border-border/50 backdrop-blur-sm"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full transition-all duration-500",
              isOn ? "bg-green-400 animate-pulse" : "bg-red-400"
            )} />
            LED is now {isOn ? "illuminated" : "switched off"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LedControlUI;