import Image from "next/image";

type LogoVariant = "dark" | "light" | "white";

interface ShowVibeLogoProps {
  className?: string;
  width?: number;
  variant?: LogoVariant;
  priority?: boolean;
}

const WORDMARK_RATIO = 540 / 2540;

export function ShowVibeLogo({
  className,
  width = 160,
  variant = "dark",
  priority = false,
}: ShowVibeLogoProps) {
  const height = Math.round(width * WORDMARK_RATIO);
  const src =
    variant === "white"
      ? "/logo/wordmark-white.png"
      : variant === "dark"
      ? "/logo/wordmark-dark.png"
      : "/logo/wordmark-light.png";

  return (
    <Image
      src={src}
      alt="ShowVibe"
      width={width}
      height={height}
      priority={priority}
      className={className}
      style={{ height: "auto", width }}
    />
  );
}

