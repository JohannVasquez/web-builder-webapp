import { COMPONENT_MAP, resolveSectionComponent } from './componentMap';

describe('componentMap', () => {
  it.each(['Hero', 'Features', 'CallToAction', 'TextBlock', 'ContactForm'])(
    'resolves the "%s" section type to a component',
    (type) => {
      expect(resolveSectionComponent(type)).toBeDefined();
    },
  );

  it('returns undefined for unknown section types so they are silently skipped', () => {
    expect(resolveSectionComponent('VideoGallery')).toBeUndefined();
    expect(resolveSectionComponent('')).toBeUndefined();
  });

  it('exposes every mapped component as a callable component', () => {
    for (const component of Object.values(COMPONENT_MAP)) {
      expect(typeof component).toBe('function');
    }
  });
});
