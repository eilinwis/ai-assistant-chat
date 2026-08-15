import { useState } from 'react'
import heroImg from '../../assets/hero.png'
import logoImg from '../../assets/logo.png'
import reactLogo from '../../assets/react.svg'
import viteLogo from '../../assets/vite.svg'

interface GalleryImage {
  id: string
  src: string
  alt: string
}

const GALLERY_IMAGES: GalleryImage[] = [
  { id: 'hero', src: heroImg, alt: 'Hero illustration' },
  { id: 'logo', src: logoImg, alt: 'App logo' },
  { id: 'react', src: reactLogo, alt: 'React logo' },
  { id: 'vite', src: viteLogo, alt: 'Vite logo' },
]

export default function ImageGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = GALLERY_IMAGES[activeIndex]

  return (
    <div className="widget-gallery">
      <img
        className="widget-gallery__main"
        data-testid="gallery-main-image"
        src={active.src}
        alt={active.alt}
      />
      <p className="widget-gallery__caption" data-testid="gallery-caption">
        {active.alt}
      </p>
      <div className="widget-gallery__thumbs">
        {GALLERY_IMAGES.map((img, index) => (
          <button
            key={img.id}
            type="button"
            className={`widget-gallery__thumb${
              index === activeIndex ? ' widget-gallery__thumb--active' : ''
            }`}
            data-testid={`gallery-thumb-${img.id}`}
            aria-pressed={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          >
            <img src={img.src} alt="" />
          </button>
        ))}
      </div>
    </div>
  )
}
