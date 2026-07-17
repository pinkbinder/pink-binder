import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';
import { PokemonTypeBadge } from './pokemon-type-badge';

describe('PokemonTypeBadge', () => {
  it('renders the type label as a link', () => {
    render(<PokemonTypeBadge type="fire" href="/types/fire" />);
    const link = screen.getByRole('link', { name: /fire/i });
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('/types/fire');
  });

  it('applies the clickable badge class', () => {
    const { container } = render(<PokemonTypeBadge type="water" href="/types/water" />);
    const link = container.querySelector('a');
    expect(link?.className).toContain('rounded-full');
  });

  it('renders an accessible label containing the type', () => {
    render(<PokemonTypeBadge type="grass" href="/types/grass" />);
    expect(screen.getByText('grass')).not.toBeNull();
  });
});
