import { renderToStaticMarkup } from 'react-dom/server';
import { Hero } from './Hero';
import { Team } from './Team';
import { LogoCloud } from './LogoCloud';

// Spec 6.3: decorativa (`alt=""`, no aporta información que el texto de al lado no diga ya)
// vs. de contenido (alt real, porque es la única forma de saber qué muestra la imagen).
describe('alt de imágenes decorativas vs. de contenido', () => {
  it('la imagen de fondo del hero es decorativa: el título ya dice de qué se trata', () => {
    const html = renderToStaticMarkup(
      <Hero
        sectionProps={{
          variant: 'split',
          title: 'Electricistas certificados',
          imageUrl: 'https://bucket.example.com/hero.jpg',
        }}
      />,
    );
    expect(html).toContain('alt=""');
  });

  it('la foto de una persona del equipo es de contenido: su nombre es el alt', () => {
    const html = renderToStaticMarkup(
      <Team
        sectionProps={{
          title: 'Equipo',
          members: [{ name: 'Ana Torres', role: 'Gerenta', photoUrl: 'https://bucket.example.com/ana.jpg' }],
        }}
      />,
    );
    expect(html).toContain('alt="Ana Torres"');
  });

  it('el logo de una marca en el carrusel de clientes es de contenido: usa el alt de la biblioteca', () => {
    const html = renderToStaticMarkup(
      <LogoCloud
        sectionProps={{
          logos: [{ url: 'https://bucket.example.com/logo.png', alt: 'Constructora Andes' }],
        }}
      />,
    );
    expect(html).toContain('alt="Constructora Andes"');
  });
});
