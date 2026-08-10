"use client";

import dynamic from "next/dynamic";

// Wrapped dynamic to keep Hero.tsx as Server Component.
// ssr:false is only allowed inside Client Components.
const WebGLHero = dynamic(() => import("./WebGLHero"), {
  ssr: false,
  loading: () => null,
});

export default function HeroWebGL() {
  return <WebGLHero />;
}
