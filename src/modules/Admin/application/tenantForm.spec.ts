import { proposeSlug } from './tenantForm';

describe('proposeSlug', () => {
  it('pasa a minúsculas y reemplaza espacios por guiones', () => {
    expect(proposeSlug('Pastelería Luna')).toBe('pasteleria-luna');
  });

  it('quita tildes y eñes', () => {
    expect(proposeSlug('Eléctrica Ñuñoa')).toBe('electrica-nunoa');
  });

  it('colapsa símbolos y espacios repetidos en un solo guion', () => {
    expect(proposeSlug('Café  &  Postres!!')).toBe('cafe-postres');
  });

  it('no deja guiones al inicio ni al final', () => {
    expect(proposeSlug('  -Dulce Encanto- ')).toBe('dulce-encanto');
  });

  it('nombre vacío propone una dirección vacía', () => {
    expect(proposeSlug('')).toBe('');
  });
});
