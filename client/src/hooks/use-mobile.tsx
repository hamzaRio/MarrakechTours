import { useEffect, useState } from "react";

// Hook for detecting mobile screen sizes
export default function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if window exists (for SSR)
    if (typeof window === "undefined") return;

    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Run on mount
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  return isMobile;
}
