interface SnookerBallIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SnookerBallIcon({ className = "", size = 'md' }: SnookerBallIconProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${sizeClasses[size]} ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ball base */}
      <circle cx="50" cy="50" r="45" fill="#1e293b" />
      {/* Main highlight */}
      <ellipse
        cx="35"
        cy="35"
        rx="12"
        ry="8"
        fill="white"
        fillOpacity="0.3"
        transform="rotate(-30 35 35)"
      />
      {/* Small highlight */}
      <circle cx="30" cy="30" r="4" fill="white" fillOpacity="0.5" />
    </svg>
  );
}
