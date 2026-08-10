"use client";

import dynamic from "next/dynamic";

// Lightweight alias — primary WebGL hero is vanilla WebGL2 (WebGLHero.tsx)
// kept under ~5KB gzipped. This file exists as the optional three.js
// entry point for demos; it lazy-loads three only when explicitly used.

// To enable three variant, use:
//   const ThreeHero = dynamic(() => import("./HeroCanvasThree"), { ssr: false })
// Currently re-exports the vanilla implementation to avoid bundling three.

import WebGLHero from "./WebGLHero";

export default WebGLHero;

// Example three.js dynamic variant (not bundled unless imported directly):
// export const ThreeHero = dynamic(() => import("./HeroCanvasThreeImpl"), { ssr: false });
export const ThreeHero = dynamic(() => Promise.resolve(WebGLHero), {
  ssr: false,
});
