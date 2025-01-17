// Skeleton.tsx
'use client';

export default function Skeleton({ width = "100%", height = "20px", borderRadius = "4px",className = "" }: { width?: string; height?: string; borderRadius?: string; className?: string }) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius,
          animation: "pulse 1.5s infinite",
        }}
        className={`bg-customRectangle skeleton ${className}`}
      />
    );
  }
  