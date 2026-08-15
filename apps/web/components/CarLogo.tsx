export function CarLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Carrosserie (face avant) */}
      <path
        d="M8 30c0-3 1-5.5 2.5-8l2-4C14 14.5 16.5 13 20 13h8c3.5 0 6 1.5 7.5 5l2 4c1.5 2.5 2.5 5 2.5 8v6a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-2H15v2a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-6Z"
        fill="currentColor"
      />
      {/* Pare-brise */}
      <path
        d="M15 20.5c1-2.5 2.5-4 5-4h8c2.5 0 4 1.5 5 4l1 2.5H14l1-2.5Z"
        fill="white"
        fillOpacity="0.9"
      />
      {/* Phares */}
      <circle cx="13" cy="27" r="2.6" fill="white" />
      <circle cx="35" cy="27" r="2.6" fill="white" />
      {/* Calandre */}
      <rect x="19" y="26" width="10" height="2.4" rx="1.2" fill="white" fillOpacity="0.85" />
    </svg>
  );
}
