"use client";

import NextTopLoader from 'nextjs-toploader';

export default function ProgressBarWrapper() {
  return (
    <NextTopLoader
      color="#F0F171"
      height={1}
      showSpinner={false}
    />
  );
}