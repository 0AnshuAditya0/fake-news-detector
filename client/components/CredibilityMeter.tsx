"use client";

import React, { useEffect, useState } from "react";
import { getCredibilityColor, getCredibilityLabel } from "@/lib/utils";

interface CredibilityMeterProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

export function CredibilityMeter({ score, size = "md" }: CredibilityMeterProps) {
  const getColor = (scoreValue: number) => {
    if (scoreValue < 40) return "#EF4444"; // red
    if (scoreValue < 70) return "#F59E0B"; // yellow
    return "#10B981"; // green
  };

  const radius = size === "lg" ? 90 : size === "md" ? 70 : 50;
  const strokeWidth = size === "lg" ? 10 : size === "md" ? 8 : 6;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const textSize = size === "lg" ? "text-3xl sm:text-4xl md:text-5xl" : size === "md" ? "text-2xl sm:text-3xl md:text-4xl" : "text-xl sm:text-2xl";
  const labelSize = size === "lg" ? "text-base sm:text-lg" : size === "md" ? "text-sm sm:text-base" : "text-xs sm:text-sm";

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={getColor(score)}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`font-bold ${textSize} ${getCredibilityColor(score)}`}>
            {score}
          </div>
          <div className="text-xs">/ 100</div>
        </div>
      </div>
      <div className={`mt-4 font-bold uppercase tracking-widest ${labelSize} ${getCredibilityColor(score)}`}>
        {getCredibilityLabel(score)}
      </div>
    </div>
  );
}
