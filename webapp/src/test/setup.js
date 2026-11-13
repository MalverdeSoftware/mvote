import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ring UI reads the color scheme when it loads, and jsdom has no matchMedia.
window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });

afterEach(cleanup);
