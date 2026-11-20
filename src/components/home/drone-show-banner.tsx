"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { Group } from "three";
import { ArrowRight, Images, Sparkles, Upload, X } from "lucide-react";

const samplePhotos = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=1400",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1400",
  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=1400",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1400",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1400",
];

/* =====================================================
   3D DRONE COMPONENTS
===================================================== */

type RotorProps = {
  position: [number, number, number];
  reverse?: boolean;
};

function Rotor({ position, reverse = false }: RotorProps) {
  const rotor = useRef<Group>(null);

  useFrame((_, delta) => {
    if (rotor.current) {
      rotor.current.rotation.z += delta * (reverse ? -48 : 48);
    }
  });

  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.17, 0.25, 24]} />
        <meshStandardMaterial color="#30394a" metalness={0.85} roughness={0.24} />
      </mesh>

      <mesh position={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.09, 0.09, 0.06, 24]} />
        <meshStandardMaterial color="#c8d4e5" metalness={0.9} roughness={0.2} />
      </mesh>

      <group ref={rotor} position={[0, 0, 0.2]}>
        <RoundedBox args={[1.05, 0.035, 0.045]} radius={0.018}>
          <meshStandardMaterial
            color="#dce5f2"
            metalness={0.45}
            roughness={0.3}
            transparent
            opacity={0.88}
          />
        </RoundedBox>

        <RoundedBox
          args={[1.05, 0.035, 0.045]}
          radius={0.018}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#dce5f2"
            metalness={0.45}
            roughness={0.3}
            transparent
            opacity={0.88}
          />
        </RoundedBox>
      </group>
    </group>
  );
}

function DroneArm({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const length = Math.hypot(dx, dy);
  const angle = -Math.atan2(dx, dy);

  return (
    <mesh
      position={[(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, 0]}
      rotation={[0, 0, angle]}
      castShadow
    >
      <cylinderGeometry args={[0.075, 0.11, length, 20]} />
      <meshStandardMaterial color="#aebbd0" metalness={0.8} roughness={0.25} />
    </mesh>
  );
}

function CinemaDroneModel() {
  const drone = useRef<Group>(null);

  useFrame((state) => {
    if (drone.current) {
      const time = state.clock.elapsedTime;
      drone.current.position.y = Math.sin(time * 1.5) * 0.1;
      drone.current.rotation.z = Math.sin(time * 0.8) * 0.025;
    }
  });

  const motors: RotorProps[] = [
    { position: [-2.05, 0.95, 0.08] },
    { position: [2.05, 0.95, 0.08], reverse: true },
    { position: [-2.05, -0.95, 0.08], reverse: true },
    { position: [2.05, -0.95, 0.08] },
  ];

  return (
    <group ref={drone}>
      <DroneArm from={[-0.48, 0.2]} to={[-2.05, 0.95]} />
      <DroneArm from={[0.48, 0.2]} to={[2.05, 0.95]} />
      <DroneArm from={[-0.48, -0.2]} to={[-2.05, -0.95]} />
      <DroneArm from={[0.48, -0.2]} to={[2.05, -0.95]} />

      <RoundedBox args={[1.65, 0.58, 0.9]} radius={0.2} smoothness={5}>
        <meshStandardMaterial
          color="#cbd4e1"
          metalness={0.78}
          roughness={0.24}
        />
      </RoundedBox>

      <RoundedBox
        args={[1.25, 0.25, 0.73]}
        radius={0.12}
        position={[0, 0.32, 0]}
      >
        <meshStandardMaterial color="#eef2f8" metalness={0.6} roughness={0.25} />
      </RoundedBox>

      <RoundedBox
        args={[0.85, 0.22, 0.035]}
        radius={0.07}
        position={[0, 0.03, 0.47]}
      >
        <meshStandardMaterial color="#263449" metalness={0.55} roughness={0.25} />
      </RoundedBox>

      {[-1, 1].map((side) => (
        <group key={side} position={[side * 0.68, 0, 0]}>
          <mesh position={[0, 0, 0.05]}>
            <sphereGeometry args={[0.1, 20, 20]} />
            <meshStandardMaterial color="#8292aa" metalness={0.8} />
          </mesh>

          <mesh position={[side * 0.03, 0.05, 0.48]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshStandardMaterial
              color={side === -1 ? "#44eaff" : "#ff526a"}
              emissive={side === -1 ? "#00bfff" : "#ff173e"}
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      ))}

      {motors.map((motor, index) => (
        <Rotor key={index} {...motor} />
      ))}

      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, -0.58, -0.08]}>
          <cylinderGeometry args={[0.045, 0.055, 0.55, 16]} />
          <meshStandardMaterial color="#7e8da5" metalness={0.85} />
        </mesh>
      ))}

      {[-0.55, 0.55].map((x) => (
        <RoundedBox
          key={x}
          args={[0.13, 0.08, 1.3]}
          radius={0.035}
          position={[x, -0.86, -0.08]}
        >
          <meshStandardMaterial color="#aebbd0" metalness={0.8} />
        </RoundedBox>
      ))}

      <mesh position={[0, -0.45, 0.48]}>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 20]} />
        <meshStandardMaterial color="#38445a" metalness={0.8} />
      </mesh>

      <RoundedBox
        args={[0.55, 0.38, 0.38]}
        radius={0.12}
        position={[0, -0.7, 0.55]}
      >
        <meshStandardMaterial color="#343e50" metalness={0.8} roughness={0.25} />
      </RoundedBox>

      <mesh position={[0, -0.7, 0.78]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.17, 0.17, 0.12, 32]} />
        <meshStandardMaterial color="#101725" metalness={0.95} roughness={0.1} />
      </mesh>

      <mesh position={[0, -0.7, 0.85]}>
        <sphereGeometry args={[0.105, 32, 32]} />
        <meshPhysicalMaterial
          color="#54cfff"
          metalness={0.4}
          roughness={0.08}
          clearcoat={1}
          emissive="#073a68"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

/* Separate scale for intro and homepage drone */

function CinemaDrone({ scale = 0.9 }: { scale?: number }) {
  return (
    <Canvas
      camera={{ position: [0, 0.3, 8], fov: 38 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true }}
      // CSS transform ignore panni layout size mattum measure pannum
      resize={{ offsetSize: true }}
    >
      <ambientLight intensity={1.4} />
      <directionalLight position={[4, 6, 7]} intensity={2.4} />
      <directionalLight
        position={[-5, 2, -4]}
        intensity={1.5}
        color="#91baff"
      />
      <pointLight position={[0, -2, 4]} intensity={1.3} color="#a7dfff" />
      <group scale={scale}>
        <CinemaDroneModel />
      </group>
    </Canvas>
  );
}

/* =====================================================
   MAIN DRONE BANNER
===================================================== */

// This flag belongs to the current browser document. It survives Next.js
// client-side navigation and React remounts, but resets on a real page reload.
type DroneIntroWindow = Window & {
  __studioFrameDroneIntroHandled?: boolean;
};

type DroneShowBannerProps = {
  introOnly?: boolean; // layout.tsx: intro overlay mattum render aagum
  showIntro?: boolean; // page.tsx: false kudutha intro varaadhu
};

export function DroneShowBanner({
  introOnly = false,
  showIntro = true,
}: DroneShowBannerProps) {
  // Initial true => server HTML-layeye intro overlay irukkum,
  // so home page munnadi theriyaadhu.
  const [introVisible, setIntroVisible] = useState(showIntro);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [showUploadMessage, setShowUploadMessage] = useState(false);

  const objectUrls = useRef<string[]>([]);
  const photos = uploadedPhotos.length > 0 ? uploadedPhotos : samplePhotos;

  const closeIntro = () => {
    (window as DroneIntroWindow).__studioFrameDroneIntroHandled = true;
    setIntroVisible(false);
  };

  // Intro timer (real reload-la mattum odum)
  useEffect(() => {
    if (!showIntro) return;

    // Already intro kaatiyaachu na (client navigation / remount) udane hide
    if ((window as DroneIntroWindow).__studioFrameDroneIntroHandled) {
      setIntroVisible(false);
      return;
    }

    const timer = window.setTimeout(closeIntro, 8300);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro]);

  // Intro odum bodhu scroll lock
  useEffect(() => {
    if (!introVisible) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [introVisible]);

  // Photo slideshow
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentPhoto((previous) => (previous + 1) % photos.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [photos.length]);

  // Uploaded image URLs cleanup
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const files = Array.from(input.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Reset the input even when no valid images were selected, so the same
    // file can be selected again without needing to choose a different file.
    input.value = "";

    if (!imageFiles.length) return;

    const newUrls = imageFiles.map((file) => URL.createObjectURL(file));

    objectUrls.current.push(...newUrls);

    setUploadedPhotos((previous) => [...previous, ...newUrls]);
    setCurrentPhoto(0);
    setShowUploadMessage(true);
  };

  return (
    <>
      {/* =================================================
          STUDIOFRAME WELCOME INTRO
      ================================================= */}

      {introVisible && (
        <div
          className="sf-drone-intro"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999999,
            background: "#050610",
            overflow: "hidden",
          }}
        >
          <div className="sf-intro-background" />
          <div className="sf-intro-stars" />
          <div className="sf-intro-grid" />
          <div className="sf-intro-light" />

          <div className="sf-welcome-heading">
            <span className="sf-welcome-eyebrow">
              ✦ AN EXPERIENCE BEYOND IMAGINATION ✦
            </span>

            <h1>
              <span className="sf-welcome-top">WELCOME TO</span>
              <span className="sf-welcome-brand">STUDIOFRAME</span>
            </h1>

            <p>Where every moment becomes a timeless masterpiece.</p>

            <div className="sf-welcome-line" />
          </div>

          {/* BIG OPENING DRONE */}

          <div className="sf-intro-drone">
            <CinemaDrone scale={1.35} />
          </div>

          <div className="sf-intro-beam" />

          <div className="sf-intro-photo">
            <img
              src={photos[currentPhoto]}
              alt="StudioFrame photography preview"
            />

            <div className="sf-photo-caption">
              <Sparkles size={16} />
              CAPTURING MOMENTS. CREATING MEMORIES.
            </div>
          </div>

          <div className="sf-intro-bottom">
            PHOTOGRAPHY • CINEMATOGRAPHY • CREATIVITY
          </div>

          <button type="button" className="sf-intro-skip" onClick={closeIntro}>
            Skip intro <X size={15} />
          </button>
        </div>
      )}

      {/* =================================================
          HOMEPAGE DRONE SHOW
      ================================================= */}

      {!introOnly && (
        <section className="sf-drone-section">
          <div className="sf-banner-glow sf-glow-one" />
          <div className="sf-banner-glow sf-glow-two" />

          <div className="sf-drone-container">
            <div className="sf-drone-content">
              <div className="sf-eyebrow">
                <Sparkles size={16} />
                THE NEXT LEVEL OF PHOTOGRAPHY
              </div>

              <h2>
                Your Memories.
                <br />
                <span>In the Sky.</span>
              </h2>

              <p>
                Turn your favourite photographs into a cinematic
                drone-show experience. Create your own show and
                share your memories with everyone.
              </p>

              <div className="sf-drone-actions">
                <label className="sf-upload-button">
                  <Upload size={18} />
                  Upload Your Photos

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleUpload}
                  />
                </label>

                <Link href="/gallery" className="sf-explore-button">
                  Explore Gallery
                  <ArrowRight size={17} />
                </Link>
              </div>

              {showUploadMessage && (
                <div className="sf-upload-message">
                  <Images size={16} />
                  {uploadedPhotos.length} photos added to your preview.
                </div>
              )}

              <div className="sf-live-status">
                <span className="sf-live-dot" />
                AUTOMATIC PHOTO EXPERIENCE
              </div>
            </div>

            <div className="sf-drone-stage">
              <div className="sf-orbit sf-orbit-one" />
              <div className="sf-orbit sf-orbit-two" />

              <div className="sf-banner-drone">
                <CinemaDrone scale={0.9} />
              </div>

              <div className="sf-banner-beam" />

              <div className="sf-banner-photo">
                <img
                  key={photos[currentPhoto]}
                  src={photos[currentPhoto]}
                  alt="Drone show photo slideshow"
                />

                <div className="sf-projection-label">
                  <span>STUDIOFRAME</span>
                  <span>
                    {String(currentPhoto + 1).padStart(2, "0")} /{" "}
                    {String(photos.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="sf-stage-caption">
                <span className="sf-live-dot" />
                LIVE MEMORY PREVIEW
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================================================
          STYLES (server HTML-laye varum, so first paint-la CSS ready)
      ================================================= */}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .sf-drone-intro,
        .sf-drone-intro * {
          box-sizing: border-box;
        }

        .sf-drone-intro {
          position: fixed;
          inset: 0;
          z-index: 999999;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #050610;
          animation: sfIntroFade 0.9s ease 7.4s forwards;
        }

        .sf-intro-background {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 50% 55%, #563a6d 0%, transparent 42%),
            radial-gradient(ellipse at 20% 20%, #173c57 0%, transparent 45%),
            radial-gradient(ellipse at 80% 80%, #332044 0%, transparent 40%),
            linear-gradient(135deg, #050610, #101326, #080914);
        }

        .sf-intro-stars {
          position: absolute;
          inset: 0;
          opacity: 0.65;
          background-image:
            radial-gradient(#ffffff 1px, transparent 1px),
            radial-gradient(#c9b5ff 1px, transparent 1px);
          background-size: 55px 55px, 95px 95px;
          background-position: 0 0, 30px 40px;
          animation: sfStarMove 18s linear infinite;
        }

        .sf-intro-grid {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image:
            linear-gradient(#a88aff33 1px, transparent 1px),
            linear-gradient(90deg, #a88aff33 1px, transparent 1px);
          background-size: 65px 65px;
          mask-image: linear-gradient(to bottom, transparent, black, transparent);
        }

        .sf-intro-light {
          position: absolute;
          left: 50%;
          top: 48%;
          width: 400px;
          height: 400px;
          border-radius: 50%;
          background: #a477ff;
          filter: blur(150px);
          opacity: 0;
          transform: translate(-50%, -50%);
          animation: sfLightReveal 2s ease 2.5s forwards;
        }

        /* WELCOME HEADING */

        .sf-welcome-heading {
          position: absolute;
          z-index: 15;
          top: 8%;
          width: 100%;
          padding: 0 20px;
          color: white;
          text-align: center;
          opacity: 0;
          animation: sfWelcomeReveal 1.3s ease 2.2s forwards;
        }

        .sf-welcome-eyebrow {
          color: #d6c0ff;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 5px;
        }

        .sf-welcome-heading h1 {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin: 18px 0 12px;
          font-family: Georgia, serif;
          font-size: clamp(27px, 5vw, 55px);
          font-weight: 400;
          letter-spacing: 5px;
        }

        .sf-welcome-top {
          color: #ffffff;
        }

        .sf-welcome-brand {
          display: block;
          color: #f4d49b;
          font-size: clamp(39px, 7vw, 86px);
          font-weight: 700;
          letter-spacing: 5px;
          text-shadow:
            0 0 12px #eacb9a88,
            0 0 35px #c69aef77;
          animation: sfGoldGlow 2.5s ease-in-out infinite alternate;
        }

        .sf-welcome-heading p {
          margin-top: 15px;
          color: #d1cbdc;
          font-size: 13px;
          letter-spacing: 1.5px;
        }

        .sf-welcome-line {
          width: 0;
          height: 1px;
          margin: 22px auto 0;
          background: linear-gradient(90deg, transparent, #f4d49b, transparent);
          animation: sfLineReveal 1.5s ease 3.3s forwards;
        }

        /* LARGE INTRO DRONE */

        
          .sf-intro-drone {
            position: absolute;
            z-index: 20;
            top: 48%;
            left: 50%;
            width: min(700px, 90vw);
            height: 250px;
            transform: translateX(-50%);
            animation: sfDroneJourney 7.5s cubic-bezier(.2,.8,.2,1) both;
          }


        .sf-intro-beam {
          position: absolute;
          z-index: 2;
          top: 49%;
          left: 50%;
          width: 0;
          height: 0;
          border-left: 160px solid transparent;
          border-right: 160px solid transparent;
          border-top: 320px solid #c4a5ff30;
          filter: blur(9px);
          transform: translateX(-50%);
          opacity: 0;
          animation: sfBeamIn 1.5s ease 2.5s forwards;
        }

        /* PHOTO PROJECTION */

        .sf-intro-photo {
          position: absolute;
          z-index: 4;
          top: 65%;
          left: 50%;
          width: min(360px, 70vw);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid #e7c99d;
          border-radius: 13px;
          opacity: 0;
          transform: translate(-50%, 30px) perspective(700px) rotateX(18deg);
          box-shadow:
            0 0 25px #c5a0ff66,
            0 0 75px #9874e944;
          animation: sfPhotoIn 1s ease 3.1s forwards;
        }

        .sf-intro-photo img,
        .sf-banner-photo img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sf-photo-caption {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          color: white;
          font-size: 9px;
          letter-spacing: 2px;
          background: linear-gradient(transparent, #000e);
        }

        .sf-intro-bottom {
          position: absolute;
          z-index: 10;
          bottom: 24px;
          color: #c6bfd6;
          font-size: 9px;
          letter-spacing: 4px;
          text-align: center;
        }

        .sf-intro-skip {
          position: absolute;
          z-index: 30;
          top: 25px;
          right: 25px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 15px;
          color: white;
          background: #ffffff18;
          border: 1px solid #ffffff55;
          border-radius: 30px;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .sf-intro-skip:hover {
          background: #ffffff35;
        }

        /* HOMEPAGE DRONE SECTION */

        .sf-drone-section {
          position: relative;
          isolation: isolate;
          overflow: hidden;
          min-height: 590px;
          padding: 90px 7%;
          color: white;
          background: linear-gradient(115deg, #090d1c, #15132c 55%, #101c2c);
        }

        .sf-banner-glow {
          position: absolute;
          z-index: -1;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }

        .sf-glow-one {
          top: -150px;
          right: 10%;
          background: #8a61d8;
        }

        .sf-glow-two {
          bottom: -200px;
          left: 15%;
          background: #2b8da9;
        }

        .sf-drone-container {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          align-items: center;
          gap: 55px;
          max-width: 1250px;
          margin: auto;
        }

        .sf-eyebrow {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #c7aaff;
          font-size: 11px;
          letter-spacing: 2px;
        }

        .sf-drone-content h2 {
          margin: 22px 0;
          color: white;
          font-size: clamp(42px, 5vw, 66px);
          line-height: 1.08;
          letter-spacing: -2px;
        }

        .sf-drone-content h2 span {
          color: #c6a9ff;
        }

        .sf-drone-content > p {
          max-width: 490px;
          color: #c4c3d2;
          font-size: 15px;
          line-height: 1.9;
        }

        .sf-drone-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 30px;
        }

        .sf-upload-button,
        .sf-explore-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 48px;
          padding: 0 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.25s ease;
        }

        .sf-upload-button {
          color: #171326;
          background: linear-gradient(110deg, #e1d0ff, #a9caff);
        }

        .sf-upload-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px #b7a1ff55;
        }

        .sf-explore-button {
          color: white;
          border: 1px solid #ffffff45;
          text-decoration: none;
        }

        .sf-explore-button:hover {
          background: #ffffff17;
          border-color: #c6a9ff;
        }

        .sf-upload-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 15px;
          color: #b8f5d0;
          font-size: 12px;
        }

        .sf-live-status {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 35px;
          color: #9999b2;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .sf-live-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: #7cf2bd;
          box-shadow: 0 0 12px #7cf2bd;
          animation: sfPulse 1.5s infinite;
        }

        .sf-drone-stage {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 430px;
        }

        .sf-orbit {
          position: absolute;
          width: 360px;
          height: 130px;
          border: 1px solid #c4aaff35;
          border-radius: 50%;
          transform: rotate(-22deg);
        }

        .sf-orbit-two {
          width: 290px;
          height: 105px;
          border-color: #91d9ff30;
          transform: rotate(25deg);
        }

        .sf-banner-drone {
          position: absolute;
          top: 0;
          z-index: 20;
          width: 100%;
          height: 280px;
          animation: sfDroneHover 3s ease-in-out infinite;
        }

        .sf-banner-beam {
          position: absolute;
          top: 175px;
          width: 0;
          height: 0;
          border-left: 130px solid transparent;
          border-right: 130px solid transparent;
          border-top: 235px solid #b7a0ff25;
          filter: blur(4px);
        }

        .sf-banner-photo {
          position: absolute;
          top: 245px;
          z-index: 2;
          width: min(350px, 80%);
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border: 1px solid #bba2ff99;
          border-radius: 12px;
          box-shadow: 0 0 40px #9874e955;
          transform: perspective(700px) rotateX(12deg);
        }

        .sf-projection-label {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          display: flex;
          justify-content: space-between;
          padding: 10px;
          color: white;
          font-size: 9px;
          letter-spacing: 2px;
          background: linear-gradient(transparent, #000c);
        }

        .sf-stage-caption {
          position: absolute;
          bottom: 0;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #b8b5ca;
          font-size: 9px;
          letter-spacing: 2px;
        }

        /* ANIMATIONS */

        @keyframes sfDroneJourney {
          0% {
            transform: translate(calc(-50% + 60vw), -100px);
            opacity: 0;
          }

          20% {
            transform: translate(-50%, 0);
            opacity: 1;
          }

          75% {
            transform: translate(-50%, 0);
            opacity: 1;
          }

          88% {
            transform: translate(calc(-50% + 55vw), -80px);
            opacity: 1;
          }

          100% {
            transform: translate(calc(-50% + 90vw), -180px);
            opacity: 0;
          }
        }

        @keyframes sfDroneHover {
          0%, 100% {
            translate: 0 0;
          }

          50% {
            translate: 0 -13px;
          }
        }

        @keyframes sfWelcomeReveal {
          from {
            opacity: 0;
            transform: translateY(-35px);
            filter: blur(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes sfGoldGlow {
          from {
            text-shadow: 0 0 10px #eacb9a55;
          }

          to {
            text-shadow: 0 0 25px #f5d9a8cc, 0 0 55px #b18aff77;
          }
        }

        @keyframes sfLineReveal {
          to {
            width: 220px;
          }
        }

        @keyframes sfLightReveal {
          to {
            opacity: 0.25;
          }
        }

        @keyframes sfBeamIn {
          to {
            opacity: 1;
          }
        }

        @keyframes sfPhotoIn {
          to {
            opacity: 1;
            transform: translate(-50%, 0) perspective(700px) rotateX(18deg);
          }
        }

        @keyframes sfStarMove {
          to {
            background-position: 110px 110px, -100px 100px;
          }
        }

        @keyframes sfIntroFade {
          to {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
          }
        }

        @keyframes sfPulse {
          50% {
            opacity: 0.4;
          }
        }

        /* TABLET */

        @media (max-width: 800px) {
          .sf-drone-section {
            padding: 65px 6%;
          }

          .sf-drone-container {
            grid-template-columns: 1fr;
            gap: 25px;
          }

          .sf-drone-content {
            text-align: center;
          }

          .sf-eyebrow,
          .sf-drone-actions,
          .sf-live-status,
          .sf-upload-message {
            justify-content: center;
          }

          .sf-drone-content > p {
            margin-left: auto;
            margin-right: auto;
          }

          .sf-drone-stage {
            min-height: 430px;
          }
        }

        /* MOBILE */

        @media (max-width: 600px) {
          .sf-welcome-heading {
            top: 11%;
          }

          .sf-welcome-eyebrow {
            font-size: 8px;
            letter-spacing: 3px;
          }

          .sf-welcome-heading h1 {
            font-size: 25px;
            letter-spacing: 2px;
          }

          .sf-welcome-brand {
            font-size: clamp(34px, 10vw, 48px);
            letter-spacing: 2px;
          }

          .sf-welcome-heading p {
            font-size: 10px;
          }

          
          .sf-intro-drone {
            top: 49%;
            left: 50%;
            width: 100vw;
            height: 210px;
          }


          .sf-intro-photo {
            top: 65%;
            width: 75vw;
          }

          .sf-intro-bottom {
            font-size: 7px;
            letter-spacing: 2px;
          }

          .sf-intro-skip {
            top: 15px;
            right: 15px;
          }

          .sf-drone-content h2 {
            font-size: 43px;
          }

          .sf-drone-actions {
            flex-direction: column;
          }

          .sf-upload-button,
          .sf-explore-button {
            width: 100%;
          }

          .sf-drone-stage {
            transform: scale(0.9);
            margin: -10px -15px;
          }
        }

        /* REDUCED MOTION */

        @media (prefers-reduced-motion: reduce) {
          .sf-intro-stars,
          .sf-welcome-brand,
          .sf-banner-drone,
          .sf-live-dot {
            animation: none !important;
          }
        }
      `,
        }}
      />
    </>
  );
}