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

type DroneShowBannerProps = {
  showIntro?: boolean;
  introOnly?: boolean;
};

export function DroneShowBanner({
  showIntro,
  introOnly = false,
}: DroneShowBannerProps = {}) {
  const [introVisible, setIntroVisible] = useState(() => {
    if (showIntro === false) return false;
    if (
      typeof window !== "undefined" &&
      (window as unknown as { __studioFrameDroneIntroHandled?: boolean }).__studioFrameDroneIntroHandled
    ) {
      return false;
    }
    return true;
  });
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [showUploadMessage, setShowUploadMessage] = useState(false);

  const objectUrls = useRef<string[]>([]);

  const photos = uploadedPhotos.length > 0 ? uploadedPhotos : samplePhotos;

  useEffect(() => {
    if (showIntro === false) {
      setIntroVisible(false);
      return;
    }

    if (
      typeof window !== "undefined" &&
      (window as unknown as { __studioFrameDroneIntroHandled?: boolean }).__studioFrameDroneIntroHandled
    ) {
      setIntroVisible(false);
      return;
    }

    // Set handled flag after initial mount cycle completes (safely avoids React Strict Mode dev double-invoke)
    const flagTimer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        (window as unknown as { __studioFrameDroneIntroHandled?: boolean }).__studioFrameDroneIntroHandled = true;
      }
    }, 400);

    const timer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        (window as unknown as { __studioFrameDroneIntroHandled?: boolean }).__studioFrameDroneIntroHandled = true;
      }
      setIntroVisible(false);
    }, 8300);

    return () => {
      window.clearTimeout(flagTimer);
      window.clearTimeout(timer);
    };
  }, [showIntro]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentPhoto((previous) => (previous + 1) % photos.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [photos.length]);

  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSkipIntro = () => {
    if (typeof window !== "undefined") {
      (window as unknown as { __studioFrameDroneIntroHandled?: boolean }).__studioFrameDroneIntroHandled = true;
    }
    setIntroVisible(false);
  };

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (!imageFiles.length) return;

    const newUrls = imageFiles.map((file) => URL.createObjectURL(file));

    objectUrls.current.push(...newUrls);

    setUploadedPhotos((previous) => [...previous, ...newUrls]);
    setCurrentPhoto(0);
    setShowUploadMessage(true);

    event.target.value = "";
  };

  const introElement = introVisible ? (
    <div className="sf-drone-intro">
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

        <p>
          Where every moment becomes a timeless masterpiece.
        </p>

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

      <button
        type="button"
        className="sf-intro-skip"
        onClick={handleSkipIntro}
      >
        Skip intro <X size={15} />
      </button>
    </div>
  ) : null;

  if (introOnly) {
    return introElement;
  }

  return (
    <>
      {/* =================================================
          STUDIOFRAME WELCOME INTRO
      ================================================= */}

      {introElement}

      {/* =================================================
          HOMEPAGE DRONE SHOW
      ================================================= */}

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
    </>
  );
}

