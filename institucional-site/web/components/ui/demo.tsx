import { OfferCarousel, type Offer } from '@/components/ui/offer-carousel';

const sampleOffers: Offer[] = [
  {
    id: 1,
    imageSrc:
      'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=1966&auto=format&fit=crop',
    imageAlt: 'International travel landmarks collage',
    tag: 'Discount',
    title: 'Up to R$300 OFF',
    description: 'On international flights.',
    brandLogoSrc:
      'https://images.unsplash.com/photo-1568322445389-f64ac2515020?q=80&w=256&auto=format&fit=crop',
    brandName: 'Travel Club',
    promoCode: 'TRAVEL300',
    href: '#',
  },
  {
    id: 2,
    imageSrc:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1998&auto=format&fit=crop',
    imageAlt: 'A delicious looking burger',
    tag: 'Discount',
    title: 'Snack more. Save more.',
    description: 'Get R$75 OFF on purchases of R$299 or more.',
    brandLogoSrc:
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=256&auto=format&fit=crop',
    brandName: 'McD',
    promoCode: 'TWID75',
    href: '#',
  },
  {
    id: 3,
    imageSrc:
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1974&auto=format&fit=crop',
    imageAlt: 'Logos of popular streaming services',
    tag: 'Discount',
    title: 'Flat R$55 OFF on membership',
    description: 'Exclusive offer on streaming plans.',
    brandLogoSrc:
      'https://images.unsplash.com/photo-1611605698335-8b1569810432?q=80&w=256&auto=format&fit=crop',
    brandName: 'Prime Plus',
    promoCode: 'TWID550',
    href: '#',
  },
];

export default function OfferCarouselDemo() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 md:p-10">
      <div className="w-full max-w-6xl">
        <h2 className="mb-6 text-3xl font-bold text-foreground">
          Deals of the Day
        </h2>
        <OfferCarousel offers={sampleOffers} />
      </div>
    </div>
  );
}
