'use client';

export default function Skeleton({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  className = "",
  style = {},
}: {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties; // 🛠 스타일 속성 추가
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        animation: "pulse 1.5s infinite",
        ...style, // 추가된 스타일 병합
      }}
      className={`bg-customRectangle skeleton ${className}`}
    />
  );
}