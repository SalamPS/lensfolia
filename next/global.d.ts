// global.d.ts
import { Serwist } from '@serwist/window';

declare global {
  interface Window {
    serwist: Serwist;
  }
}

export {};
