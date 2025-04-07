'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function RouteProgressBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    const startLoading = () => {
      setVisible(true);
      setLoading(true);
      setProgress(10);

      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);
    };

    const finishLoading = () => {
      clearInterval(interval);
      setProgress(100);

      timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
        setLoading(false);
      }, 400); // fade-out delay
    };

    startLoading();
    finishLoading();

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [pathname]);

  return (
    <div
      className={`fixed top-0 left-0 w-full z-50 transition-opacity duration-300 ease-in-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="h-[2px] w-full bg-transparent">
        <div
          className="h-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
