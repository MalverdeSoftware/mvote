import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Frame from './Frame.jsx';

describe('Frame', () => {
  it('names MalverdeSoftware at the top and in the footer', () => {
    render(<Frame><p>Board</p></Frame>);
    expect(screen.getByRole('link', { name: 'MalverdeSoftware' })).toHaveAttribute('href', 'https://github.com/MalverdeSoftware');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('MalverdeSoftware · Indigenous-led software development');
    expect(screen.getByText('Board')).toBeInTheDocument();
  });
});
