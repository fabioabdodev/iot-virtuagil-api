import * as React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Offer {
  id: string | number;
  imageSrc: string;
  imageAlt: string;
  tag: string;
  title: string;
  description: string;
  brandLogoSrc: string;
  brandName: string;
  promoCode?: string;
  href: string;
}

interface OfferCardProps {
  offer: Offer;
}

const OfferCard = React.forwardRef<HTMLAnchorElement, OfferCardProps>(
  ({ offer }, ref) => (
    <motion.a
      ref={ref}
      href={offer.href}
      className="group relative h-[380px] w-[300px] flex-shrink-0 snap-start overflow-hidden rounded-2xl"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ perspective: '1000px' }}
    >
      <img
        src={offer.imageSrc}
        alt={offer.imageAlt}
        className="absolute inset-0 h-2/4 w-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute bottom-0 left-0 right-0 flex h-2/4 flex-col justify-between border-t border-white/10 bg-[rgba(8,14,18,0.92)] p-5 backdrop-blur-sm">
        <div className="space-y-2">
          <div className="flex items-center text-xs text-stone-300">
            <Tag className="mr-2 h-4 w-4 text-[#7fe2bf]" />
            <span>{offer.tag}</span>
          </div>
          <h3 className="text-xl font-bold leading-tight text-white">
            {offer.title}
          </h3>
          <p className="text-sm text-stone-300">{offer.description}</p>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <div className="flex items-center gap-3">
            <img
              src={offer.brandLogoSrc}
              alt={`${offer.brandName} logo`}
              className="h-8 w-8 rounded-full bg-[rgba(17,34,28,0.8)]"
            />
            <div>
              <p className="text-xs font-semibold text-white">
                {offer.brandName}
              </p>
              {offer.promoCode && (
                <p className="text-xs text-stone-400">{offer.promoCode}</p>
              )}
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(30,80,62,0.72)] text-[#d8f8ea] transition-transform duration-300 group-hover:rotate-[-45deg] group-hover:bg-[#2ca476] group-hover:text-white">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </motion.a>
  ),
);
OfferCard.displayName = 'OfferCard';

export interface OfferCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  offers: Offer[];
}

const OfferCarousel = React.forwardRef<HTMLDivElement, OfferCarouselProps>(
  ({ offers, className, ...props }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = current.clientWidth * 0.8;
        current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    };

    return (
      <div
        ref={ref}
        className={cn('group relative w-full', className)}
        {...props}
      >
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[rgba(7,11,16,0.7)] text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-[rgba(7,11,16,0.9)] group-hover:opacity-100"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex snap-x snap-mandatory space-x-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/12 bg-[rgba(7,11,16,0.7)] text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 hover:bg-[rgba(7,11,16,0.9)] group-hover:opacity-100"
          aria-label="Scroll Right"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    );
  },
);
OfferCarousel.displayName = 'OfferCarousel';

export { OfferCarousel, OfferCard };
