
"use client";

import {
  Camera,
  Quote,
  Star,
  Heart,
  Sparkles,
} from "lucide-react";

const reviews = [
  {
    name: "Priya & Arun",
    initials: "PA",
    event: "Wedding Photography",
    review:
      "Every photograph brings back the beautiful emotions of our wedding. The team captured moments we will treasure forever.",
    color: "rose",
  },
  {
    name: "Rahul Kumar",
    initials: "RK",
    event: "Cinematic Wedding",
    review:
      "The cinematic film was beyond our expectations. Every frame looked like a movie scene!",
    color: "gold",
  },
  {
    name: "Divya & Karthik",
    initials: "DK",
    event: "Engagement",
    review:
      "From the first click to the final album, everything was wonderful. We absolutely loved the experience.",
    color: "purple",
  },
  {
    name: "Meena Family",
    initials: "MF",
    event: "Family Portraits",
    review:
      "They made our family session so comfortable and natural. The pictures are simply beautiful.",
    color: "blue",
  },
];

export function FloatingReviews() {
  return (
    <section className="sf-reviews">
      <div className="sf-review-glow sf-glow-one" />
      <div className="sf-review-glow sf-glow-two" />

      <div className="sf-review-container">

        {/* Section heading */}
        <div className="sf-review-heading">
          <div className="sf-review-eyebrow">
            <Sparkles size={15} />
            <span>LOVE FROM OUR CLIENTS</span>
          </div>

          <h2>
            Every Frame Has
            <br />
            <span>A Story To Tell.</span>
          </h2>

          <p>
            The best part of our journey is the beautiful
            memories we create with you.
          </p>
        </div>

        {/* Floating orbit stage */}
        <div className="sf-orbit-stage">

          {/* Decorative orbit rings */}
          <div className="sf-orbit-ring sf-ring-one" />
          <div className="sf-orbit-ring sf-ring-two" />
          <div className="sf-orbit-ring sf-ring-three" />

          {/* Central element */}
          <div className="sf-review-center">
            <div className="sf-center-inner">
              <div className="sf-center-camera">
                <Camera size={35} strokeWidth={1.3} />
              </div>

              <span className="sf-center-small">
                STUDIOFRAME
              </span>

              <h3>
                Moments
                <br />
                That Last
                <br />
                Forever.
              </h3>

              <div className="sf-center-line" />

              <div className="sf-center-love">
                <Heart size={13} fill="currentColor" />
                <span>Made with love</span>
              </div>
            </div>
          </div>

          {/* Orbiting review cards */}
          {reviews.map((review, index) => (
            <div
              className={`sf-orbit-path sf-path-${index + 1}`}
              key={review.name}
            >
              <article
                className={`sf-review-card sf-card-${review.color}`}
              >
                <div className="sf-card-top">
                  <div className="sf-quote-icon">
                    <Quote size={17} />
                  </div>

                  <div className="sf-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill="currentColor"
                        strokeWidth={1}
                      />
                    ))}
                  </div>
                </div>

                <p className="sf-review-message">
                  &quot;{review.review}&quot;
                </p>

                <div className="sf-card-divider" />

                <div className="sf-review-author">
                  <div className="sf-avatar">
                    {review.initials}
                  </div>

                  <div className="sf-author-info">
                    <strong>{review.name}</strong>
                    <span>{review.event}</span>
                  </div>

                  <div className="sf-verified">
                    <Heart size={13} fill="currentColor" />
                  </div>
                </div>
              </article>
            </div>
          ))}

          {/* Floating decorative details */}
          <div className="sf-floating-decoration sf-decoration-one">
            <Sparkles size={20} />
          </div>

          <div className="sf-floating-decoration sf-decoration-two">
            <Heart size={18} />
          </div>

          <div className="sf-floating-decoration sf-decoration-three">
            <Star size={15} />
          </div>

        </div>

        {/* Bottom note */}
        <div className="sf-review-bottom">
          <div className="sf-bottom-line" />
          <span>YOUR MOMENTS. OUR PASSION.</span>
          <div className="sf-bottom-line" />
        </div>

        <p className="sf-review-disclaimer">
          Sample testimonials for design preview. Replace with
          genuine customer feedback before publishing.
        </p>

      </div>

      <style jsx>{`
        .sf-reviews {
          box-sizing: border-box;
          position: relative;
          width: calc(100% - 3rem);
          max-width: 1200px;
          margin: 24px auto;
          overflow: hidden;
          isolation: isolate;
          padding: 34px 20px 22px;
          border-radius: 24px;
          color: #fff;
          background:
            radial-gradient(
              ellipse at 50% 45%,
              rgba(106, 66, 112, 0.16),
              transparent 48%
            ),
            linear-gradient(
              145deg,
              #09090d 0%,
              #111019 50%,
              #09090d 100%
            );
        }

        .sf-review-container {
          position: relative;
          z-index: 2;
          max-width: 1000px;
          margin: 0 auto;
        }

        .sf-review-glow {
          position: absolute;
          z-index: -1;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          filter: blur(110px);
          pointer-events: none;
          opacity: 0.17;
        }

        .sf-glow-one {
          top: 15%;
          left: -180px;
          background: #a855f7;
        }

        .sf-glow-two {
          right: -180px;
          bottom: 5%;
          background: #d6a85e;
        }

        /* Heading */

        .sf-review-heading {
          text-align: center;
          max-width: 650px;
          margin: 0 auto;
        }

        .sf-review-eyebrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          color: #d9b879;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          margin-bottom: 16px;
        }

        .sf-review-heading h2 {
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(36px, 5vw, 58px);
          font-weight: 400;
          line-height: 1.05;
          letter-spacing: -2px;
        }

        .sf-review-heading h2 span {
          color: #d8b77d;
          font-style: italic;
        }

        .sf-review-heading p {
          max-width: 430px;
          margin: 16px auto 0;
          color: #aaa5b2;
          font-size: 14px;
          line-height: 1.65;
        }

        /* Orbit stage */

        .sf-orbit-stage {
          position: relative;
          width: 100%;
          max-width: 1050px;
          height: 440px;
          margin: 14px auto 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sf-orbit-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          border: 1px solid rgba(216, 183, 125, 0.13);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .sf-ring-one {
          width: 280px;
          height: 280px;
        }

        .sf-ring-two {
          width: 370px;
          height: 370px;
          border-style: dashed;
          border-color: rgba(216, 183, 125, 0.12);
        }

        .sf-ring-three {
          width: 460px;
          height: 460px;
          border-color: rgba(255, 255, 255, 0.045);
        }

        /* Central feature */

        .sf-review-center {
          position: relative;
          z-index: 3;
          width: 200px;
          height: 200px;
          padding: 9px;
          border-radius: 50%;
          background: linear-gradient(
            140deg,
            #d9bd88,
            #795d39,
            #d9bd88
          );
          box-shadow:
            0 0 70px rgba(216, 183, 125, 0.15),
            0 0 130px rgba(168, 85, 247, 0.08);
        }

        .sf-center-inner {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 50%;
          background: radial-gradient(
            circle at 50% 25%,
            #292333,
            #121018 75%
          );
          text-align: center;
        }

        .sf-center-camera {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          color: #dfc18b;
          border: 1px solid rgba(216, 183, 125, 0.35);
          border-radius: 50%;
        }

        .sf-center-small {
          color: #d9b879;
          font-size: 8px;
          letter-spacing: 3px;
          font-weight: 700;
        }

        .sf-center-inner h3 {
          margin: 9px 0;
          font-family: Georgia, serif;
          font-size: 23px;
          font-weight: 400;
          line-height: 1.05;
        }

        .sf-center-line {
          width: 40px;
          height: 1px;
          background: #b99b68;
          margin: 5px 0 9px;
        }

        .sf-center-love {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #c9ad83;
          font-size: 9px;
        }

        /* Orbit paths */

        .sf-orbit-path {
          position: absolute;
          top: 50%;
          left: 50%;
          z-index: 5;
          width: 0;
          height: 0;
          --radius: 145px;
          --duration: 36s;
          --delay: 0s;
          animation: sfOrbit var(--duration) linear infinite;
          animation-delay: var(--delay);
          will-change: transform;
        }

        .sf-orbit-path:hover,
        .sf-orbit-path:has(.sf-review-card:hover) {
          animation-play-state: paused;
        }

        .sf-path-1 {
          --radius: 145px;
          --delay: 0s;
        }

        .sf-path-2 {
          --radius: 145px;
          --delay: -9s;
        }

        .sf-path-3 {
          --radius: 145px;
          --delay: -18s;
        }

        .sf-path-4 {
          --radius: 145px;
          --delay: -27s;
        }

        .sf-review-card {
          position: absolute;
          top: 0;
          left: 0;
          width: 225px;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          border-radius: 17px;
          background: rgba(28, 26, 36, 0.88);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow:
            0 20px 60px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          transform: translateX(var(--radius));
          animation: sfCounterOrbit var(--duration) linear infinite;
          animation-delay: var(--delay);
          transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease,
            background 0.3s ease;
        }

        .sf-review-card:hover {
          border-color: rgba(216, 183, 125, 0.6);
          background: rgba(38, 34, 48, 0.97);
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.5);
        }

        .sf-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }

        .sf-quote-icon {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d9b879;
          background: rgba(216, 183, 125, 0.12);
          border-radius: 9px;
        }

        .sf-stars {
          display: flex;
          gap: 3px;
          color: #e7bc70;
        }

        .sf-review-message {
          min-height: 56px;
          margin: 0;
          color: #e4e0e9;
          font-family: Georgia, serif;
          font-size: 13px;
          line-height: 1.5;
        }

        .sf-card-divider {
          height: 1px;
          margin: 10px 0 9px;
          background: rgba(255, 255, 255, 0.09);
        }

        .sf-review-author {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sf-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: #fff;
          background: linear-gradient(135deg, #9871a9, #4c3c63);
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-size: 11px;
          font-weight: 700;
        }

        .sf-card-gold .sf-avatar {
          background: linear-gradient(135deg, #c59c5c, #71502b);
        }

        .sf-card-rose .sf-avatar {
          background: linear-gradient(135deg, #c47f8c, #713d54);
        }

        .sf-card-blue .sf-avatar {
          background: linear-gradient(135deg, #648eaa, #334d70);
        }

        .sf-author-info {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sf-author-info strong {
          color: #fff;
          font-size: 11px;
          font-weight: 600;
        }

        .sf-author-info span {
          color: #9f98aa;
          font-size: 9px;
        }

        .sf-verified {
          display: flex;
          margin-left: auto;
          color: #d9b879;
        }

        /* Decorative floating icons */

        .sf-floating-decoration {
          position: absolute;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d9b879;
          opacity: 0.7;
          animation: sfDecorationFloat 4s ease-in-out infinite;
          pointer-events: none;
        }

        .sf-decoration-one {
          top: 16%;
          left: 18%;
        }

        .sf-decoration-two {
          right: 16%;
          top: 27%;
          color: #bb82a7;
          animation-delay: -1s;
        }

        .sf-decoration-three {
          bottom: 17%;
          left: 23%;
          animation-delay: -2s;
        }

        /* Footer */

        .sf-review-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 5px;
        }

        .sf-review-bottom span {
          color: #c2a878;
          font-size: 9px;
          letter-spacing: 3px;
          white-space: nowrap;
        }

        .sf-bottom-line {
          width: 65px;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(216, 183, 125, 0.6)
          );
        }

        .sf-bottom-line:last-child {
          transform: rotate(180deg);
        }

        .sf-review-disclaimer {
          margin: 20px 0 0;
          color: #716c7a;
          text-align: center;
          font-size: 10px;
        }

        /* Animations */

        @keyframes sfOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes sfCounterOrbit {
          from {
            transform: translateX(var(--radius)) rotate(0deg);
          }
          to {
            transform: translateX(var(--radius)) rotate(-360deg);
          }
        }

        @keyframes sfDecorationFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-13px);
          }
        }

        /* Tablet */

        @media (max-width: 900px) {
          .sf-orbit-stage {
            height: 380px;
          }

          .sf-path-1,
          .sf-path-2,
          .sf-path-3,
          .sf-path-4 {
            --radius: 120px;
          }

          .sf-ring-one {
            width: 250px;
            height: 250px;
          }

          .sf-ring-two {
            width: 340px;
            height: 340px;
          }

          .sf-ring-three {
            width: 420px;
            height: 420px;
          }

          .sf-review-card {
            width: 200px;
            padding: 12px;
          }

          .sf-review-message {
            font-size: 12px;
            min-height: 52px;
          }
        }

        /* Mobile */

        @media (max-width: 600px) {
          .sf-reviews {
            width: calc(100% - 1.5rem);
            margin: 16px auto;
            padding: 36px 12px 24px;
            border-radius: 20px;
          }

          .sf-review-heading h2 {
            font-size: clamp(34px, 9vw, 40px);
            letter-spacing: -1.5px;
          }

          .sf-review-heading p {
            max-width: 310px;
            font-size: 12px;
          }

          .sf-orbit-stage {
            height: 300px;
            margin-top: 12px;
          }

          .sf-review-center {
            width: 112px;
            height: 112px;
            padding: 5px;
          }

          .sf-center-camera {
            width: 25px;
            height: 25px;
            margin-bottom: 4px;
          }

          .sf-center-camera :global(svg) {
            width: 17px;
            height: 17px;
          }

          .sf-center-small {
            font-size: 5px;
            letter-spacing: 1.5px;
          }

          .sf-center-inner h3 {
            margin: 4px 0;
            font-size: 13px;
          }

          .sf-center-line {
            width: 20px;
            margin: 2px 0 4px;
          }

          .sf-center-love {
            font-size: 6px;
          }

          .sf-center-love :global(svg) {
            width: 8px;
            height: 8px;
          }

          .sf-path-1,
          .sf-path-2,
          .sf-path-3,
          .sf-path-4 {
            --radius: clamp(38px, 12.5vw, 49px);
            --duration: 32s;
          }

          .sf-review-card {
            width: 100px;
            padding: 7px;
            border-radius: 12px;
          }

          .sf-card-top {
            margin-bottom: 8px;
          }

          .sf-quote-icon {
            width: 22px;
            height: 22px;
            border-radius: 6px;
          }

          .sf-quote-icon :global(svg) {
            width: 12px;
            height: 12px;
          }

          .sf-stars {
            gap: 1px;
          }

          .sf-stars :global(svg) {
            width: 9px;
            height: 9px;
          }

          .sf-review-message {
            min-height: 0;
            font-size: 9px;
            line-height: 1.5;
          }

          .sf-card-divider {
            margin: 9px 0 8px;
          }

          .sf-review-author {
            gap: 6px;
          }

          .sf-avatar {
            width: 25px;
            height: 25px;
            font-size: 8px;
          }

          .sf-author-info {
            gap: 2px;
          }

          .sf-author-info strong {
            font-size: 8px;
          }

          .sf-author-info span {
            font-size: 6px;
          }

          .sf-verified :global(svg) {
            width: 10px;
            height: 10px;
          }

          .sf-ring-one {
            width: 160px;
            height: 160px;
          }

          .sf-ring-two {
            width: 250px;
            height: 250px;
          }

          .sf-ring-three {
            width: 330px;
            height: 330px;
          }

          .sf-decoration-one {
            left: 5%;
            top: 15%;
          }

          .sf-decoration-two {
            right: 5%;
            top: 22%;
          }

          .sf-decoration-three {
            left: 8%;
            bottom: 12%;
          }

          .sf-review-bottom {
            gap: 10px;
          }

          .sf-review-bottom span {
            font-size: 7px;
            letter-spacing: 2px;
          }

          .sf-bottom-line {
            width: 28px;
          }
        }

        /* Accessibility */

        @media (prefers-reduced-motion: reduce) {
          .sf-orbit-path,
          .sf-review-card,
          .sf-floating-decoration {
            animation: none !important;
          }

          .sf-path-1 {
            transform: translate(-300px, 0);
          }

          .sf-path-2 {
            transform: translate(0, -300px);
          }

          .sf-path-3 {
            transform: translate(300px, 0);
          }

          .sf-path-4 {
            transform: translate(0, 300px);
          }

          .sf-review-card {
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
