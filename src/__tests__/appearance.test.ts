import {
  mergeAppearance,
  defaultAppearance,
  type OptionalAppearance,
} from '../appearance';

describe('appearance.ts', () => {
  it('should export defaultAppearance as a valid object', () => {
    expect(defaultAppearance).toBeDefined();
    expect(defaultAppearance.brand.colors.primaryColor).toBe('#64749c');
  });

  describe('mergeAppearance', () => {
    it('should return defaults when no partial is provided', () => {
      const result = mergeAppearance({});
      expect(result).toEqual(defaultAppearance);
    });

    it('should deeply merge partial appearance without mutating defaults', () => {
      const partial: OptionalAppearance = {
        brand: {
          colors: {
            primaryColor: '#newColor',
            textColor: '#newText',
          },
        },
        buttons: {
          primary: {
            normal: {
              backgroundColor: '#customBg',
            },
          },
        },
      };
      const result = mergeAppearance(partial);
      expect(result.brand.colors.primaryColor).toBe('#newColor');
      expect(result.brand.colors.textColor).toBe('#newText');
      expect(result.buttons.primary.normal.backgroundColor).toBe('#customBg');
      // Unchanged fields remain default
      expect(result.brand.colors.danger).toBe(
        defaultAppearance.brand.colors.danger
      );
      // Defaults not mutated
      expect(defaultAppearance.brand.colors.primaryColor).toBe('#64749c');
    });

    it('should handle nested partials correctly (e.g., typography)', () => {
      const partial: OptionalAppearance = {
        brand: {
          typography: {
            heading1: {
              fontSize: 30,
              color: '#custom',
            },
          },
        },
      };
      const result = mergeAppearance(partial);
      expect(result.brand.typography.heading1.fontSize).toBe(30);
      expect(result.brand.typography.heading1.color).toBe('#custom');
      expect(result.brand.typography.heading1.fontWeight).toBe(
        defaultAppearance.brand.typography.heading1.fontWeight
      );
    });

    it('should handle empty partial as no-op', () => {
      const result = mergeAppearance({});
      expect(result).toEqual(defaultAppearance);
    });

    it('should skip undefined values in partial (preserve defaults)', () => {
      const partial: OptionalAppearance = {
        brand: {
          colors: {
            primaryColor: undefined,
          },
        },
      };
      const result = mergeAppearance(partial);
      expect(result.brand.colors.primaryColor).toBe(
        defaultAppearance.brand.colors.primaryColor
      ); // Unchanged
    });

    it('should override entire subsections', () => {
      const newColors = {
        primaryColor: '#overrideAll',
        textColor: '#overrideAll',
        // Omit some to test partial override
      };
      const partial: OptionalAppearance = {
        brand: {
          colors: newColors,
        },
      };
      const result = mergeAppearance(partial);
      expect(result.brand.colors.primaryColor).toBe('#overrideAll');
      expect(result.brand.colors.textColor).toBe('#overrideAll');
      expect(result.brand.colors.danger).toBe(
        defaultAppearance.brand.colors.danger
      ); // Unchanged if omitted
    });

    it('should override primitive values (e.g., numbers, booleans)', () => {
      const partial: OptionalAppearance = {
        brand: {
          baseComponentStyling: {
            cornerRadius: 10,
          },
        },
        buttons: {
          primary: {
            base: {
              showIcon: true,
            },
          },
        },
      };
      const result = mergeAppearance(partial);
      expect(result.brand.baseComponentStyling.cornerRadius).toBe(10);
      expect(result.buttons.primary.base.showIcon).toBe(true);
    });

    it('should not mutate the input partial', () => {
      const partial: OptionalAppearance = {
        brand: {
          colors: {
            primaryColor: '#new',
          },
        },
      };
      const originalPartial = JSON.stringify(partial); // Snapshot
      mergeAppearance(partial);
      expect(JSON.stringify(partial)).toBe(originalPartial); // Unchanged
    });
  });
});
