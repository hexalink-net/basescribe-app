"use client";

import NextTopLoader from 'nextjs-toploader';

export default function ProgressBarWrapper() {
  return (
    <NextTopLoader
      color="#ffffff"
      height={1}
      showSpinner={false}
    />
  );
}