"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
  photoUrl?: string;
};

// Real testimonials only — never invent a name or a quote. Add more here as
// they come in; the feed and its reveal pacing need no other changes.
export const TESTIMONIALS: Testimonial[] = [
  {
    id: "marie-claire",
    name: "Marie-Claire Ngum",
    location: "Bamenda",
    quote:
      "Buying this books changed the way I looked at my pastry business. At 19 I was able to approach companies and shops like Santa Lucia.",
    photoUrl: "/brand/testimonials/marie-claire.jpg",
  },
  {
    id: "ebai-doris",
    name: "Ebai Doris",
    location: "Buea",
    quote:
      "She has been in this business for over 7 years, but her mid has never been open for expansions. Thanks to the workbook, she had a blueprint of where to start from.. now she can even assist other women",
    photoUrl: "/brand/testimonials/ebai-doris.jpg",
  },
  {
    id: "ebai-doris",
    name: "Ebai Doris",
    location: "Buea",
    quote:
      "She has been in this business for over 7 years, but her mid has never been open for expansions. Thanks to the workbook, she had a blueprint of where to start from.. now she can even assist other women",
    photoUrl: "/brand/testimonials/ebai-doris.jpg",
  },

];

const STORAGE_KEY = "oto_testimonials_revealed";
const REVEAL_DELAY_MS = 2400;
const TYPING_DELAY_MS = 1100;

export function Testimonials() {
  if (TESTIMONIALS.length === 0) return null;
  return <TestimonialFeed />;
}

function TestimonialFeed() {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const resumedRef = useRef(false);

  // Resume from where this visitor left off — refreshing never replays from empty.
  useEffect(() => {
    try {
      const stored = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
      if (stored > 0) setVisibleCount(Math.min(stored, TESTIMONIALS.length));
    } catch {
      // localStorage unavailable — fall back to a fresh reveal every visit.
    }
    resumedRef.current = true;
  }, []);

  // Start the reveal sequence once the panel actually scrolls into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || !resumedRef.current || visibleCount >= TESTIMONIALS.length) return;

    const typingTimer = setTimeout(() => setTyping(true), 250);
    const revealTimer = setTimeout(() => {
      setTyping(false);
      setVisibleCount((count) => {
        const next = Math.min(count + 1, TESTIMONIALS.length);
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // Non-fatal — the feed just replays fully-revealed next visit.
        }
        return next;
      });
    }, REVEAL_DELAY_MS + TYPING_DELAY_MS);

    return () => {
      clearTimeout(typingTimer);
      clearTimeout(revealTimer);
    };
  }, [started, visibleCount]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleCount, typing]);

  return (
    <section ref={sectionRef} className="bg-brown px-5 py-16">
      <div className="mx-auto max-w-2xl">
        <p className="kicker text-gold">What buyers say</p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-cream">
          Early readers, in their own words.
        </h2>

        <div
          ref={listRef}
          className="warm-shadow mt-8 flex max-h-[420px] flex-col gap-4 overflow-y-auto rounded-2xl bg-brown-d/60 p-5 sm:p-6"
        >
          {TESTIMONIALS.slice(0, visibleCount).map((t) => (
            <Bubble key={t.id} testimonial={t} />
          ))}
          {typing && <TypingBubble />}
        </div>
      </div>
    </section>
  );
}

function Bubble({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="animate-bubble-in flex gap-3">
      <Avatar photoUrl={testimonial.photoUrl} />
      <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-cream px-4 py-3">
        <p className="font-display text-sm font-semibold text-ink">
          {testimonial.name}{" "}
          <span className="font-sans text-xs font-normal text-muted">
            · {testimonial.location}
          </span>
        </p>
        <p className="mt-1 text-[14px] leading-relaxed text-ink/85">
          {testimonial.quote}
        </p>
      </div>
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="animate-bubble-in flex gap-3">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-caramel/25" />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-cream px-4 py-3.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
      </div>
    </div>
  );
}

function Avatar({ photoUrl }: { photoUrl?: string }) {
  if (!photoUrl) {
    return <div className="h-10 w-10 flex-shrink-0 rounded-full bg-caramel/30" />;
  }
  return (
    <Image
      src={photoUrl}
      alt=""
      width={40}
      height={40}
      className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
    />
  );
}
