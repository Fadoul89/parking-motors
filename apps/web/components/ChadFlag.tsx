export function ChadFlag({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size * 1.5}
      height={size}
      viewBox="0 0 3 2"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Drapeau du Tchad"
      role="img"
      style={{ display: "block", borderRadius: Math.max(2, size / 12) }}
    >
      <rect width="1" height="2" x="0" fill="#002664" />
      <rect width="1" height="2" x="1" fill="#FECB00" />
      <rect width="1" height="2" x="2" fill="#C60C30" />
    </svg>
  );
}
