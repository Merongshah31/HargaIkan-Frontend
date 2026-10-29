/**
 * Animated 2D fish for the homepage hero, rendered with Three.js.
 *
 * The scene is deliberately flat: an orthographic camera, line-art geometry and no lighting, so
 * it reads as a crisp editorial illustration rather than a 3D render. `three` is imported
 * dynamically, which keeps it in its own lazy chunk and off every other page.
 *
 * The component degrades gracefully. It paints a static SVG (`FishSilhouette`) immediately, swaps
 * in the canvas only after the first successful render, and keeps the SVG when WebGL, the module
 * or the browser context is unavailable. Nothing here displays a price, so a failed scene can
 * never hide or invent data.
 */

import { useEffect, useRef, useState } from "react";
import type * as ThreeNS from "three";
import { FishSilhouette } from "./FishSilhouette";

type Three = typeof ThreeNS;

/** Vertical world units the camera shows; the fish is fitted inside it on every resize. */
const VIEW_HEIGHT = 150;
/** Bounding box of the drawn fish, used to fit it to narrow and wide stages. */
const FISH_SPAN = 142;
const FISH_HEIGHT = 76;
const MAX_PIXEL_RATIO = 2;

const OUTLINE = 0xe0f2fe;
const OUTLINE_SOFT = 0x7dd3fc;
const DETAIL = 0x38bdf8;
const FILL = 0x0ea5e9;
const FIN_FILL = 0x38bdf8;
const EYE_RING = 0xbae6fd;
const EYE_CORE = 0xe0f2fe;
const PUPIL = 0x061526;

interface SceneHandle {
  stop: () => void;
}

/** Cheap probe so we never construct a renderer (and never log a WebGL error) without support. */
function supportsWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return Boolean(probe.getContext("webgl2") ?? probe.getContext("webgl"));
  } catch {
    return false;
  }
}

function reducedMotion(): boolean {
  return (
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Release every geometry, texture and material below `root`. */
function disposeObject(root: ThreeNS.Object3D): void {
  root.traverse((node) => {
    const mesh = node as ThreeNS.Object3D & {
      geometry?: ThreeNS.BufferGeometry;
      material?: ThreeNS.Material | ThreeNS.Material[];
    };
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : [];
    for (const material of materials) {
      (material as ThreeNS.Material & { map?: ThreeNS.Texture | null }).map?.dispose();
      material.dispose();
    }
  });
}

function buildFish(three: Three): {
  fish: ThreeNS.Group;
  tail: ThreeNS.Group;
  pectoral: ThreeNS.Object3D;
  dorsalGroup: ThreeNS.Group;
} {
  const fish = new three.Group();

  const line = (color: number, opacity = 0.9) =>
    new three.LineBasicMaterial({ color, transparent: true, opacity });
  const outlineMaterial = line(OUTLINE, 0.95);
  const softOutlineMaterial = line(OUTLINE_SOFT, 0.55);
  const detailMaterial = line(DETAIL, 0.52);
  const ribMaterial = line(OUTLINE_SOFT, 0.36);

  const fillMaterial = new three.MeshBasicMaterial({
    color: FILL,
    transparent: true,
    opacity: 0.22,
    side: three.DoubleSide,
  });
  const finFillMaterial = new three.MeshBasicMaterial({
    color: FIN_FILL,
    transparent: true,
    opacity: 0.16,
    side: three.DoubleSide,
  });

  const outlineOf = (shape: ThreeNS.Shape, segments = 108, mat = outlineMaterial) =>
    new three.LineLoop(
      new three.BufferGeometry().setFromPoints(
        shape.getPoints(segments).map((point) => new three.Vector3(point.x, point.y, 0)),
      ),
      mat,
    );

  const fillOf = (shape: ThreeNS.Shape, mat = fillMaterial) =>
    new three.Mesh(new three.ShapeGeometry(shape, 28), mat);

  const curve = (points: [number, number][], material: ThreeNS.LineBasicMaterial, segs = 36) => {
    const path = new three.CatmullRomCurve3(
      points.map(([x, y]) => new three.Vector3(x, y, 0)),
    );
    return new three.Line(
      new three.BufferGeometry().setFromPoints(path.getPoints(segs)),
      material,
    );
  };

  // Hydrodynamic fuselage: sleek nose at +x, tapered peduncle at -x.
  const bodyShape = new three.Shape();
  bodyShape.moveTo(66, 0);
  bodyShape.bezierCurveTo(56, 15, 30, 23, -2, 20.5);
  bodyShape.bezierCurveTo(-19, 18.5, -28, 9.5, -32, 0);
  bodyShape.bezierCurveTo(-28, -9.5, -19, -18.5, -2, -20.5);
  bodyShape.bezierCurveTo(30, -23, 56, -15, 66, 0);

  // Inner parametric contour shell for CAD depth
  const innerBodyShape = new three.Shape();
  innerBodyShape.moveTo(59, 0);
  innerBodyShape.bezierCurveTo(50, 11.5, 27, 17.5, -1, 15.5);
  innerBodyShape.bezierCurveTo(-15, 14, -23, 7, -26, 0);
  innerBodyShape.bezierCurveTo(-23, -7, -15, -14, -1, -15.5);
  innerBodyShape.bezierCurveTo(27, -17.5, 50, -11.5, 59, 0);

  // Swept forked caudal fin, pivoted at peduncle root (-32, 0).
  const tail = new three.Group();
  tail.position.set(-32, 0, 0);
  const tailShape = new three.Shape();
  tailShape.moveTo(2, 0);
  tailShape.bezierCurveTo(-8, 8, -20, 18, -36, 26);
  tailShape.bezierCurveTo(-28, 13, -23, 4, -21, 0);
  tailShape.bezierCurveTo(-23, -4, -28, -13, -36, -26);
  tailShape.bezierCurveTo(-20, -18, -8, -8, 2, 0);
  tail.add(
    fillOf(tailShape, finFillMaterial),
    outlineOf(tailShape, 84, softOutlineMaterial),
    curve([[0, 1.5], [-16, 11], [-31, 21]], ribMaterial, 16),
    curve([[-2, 0.8], [-14, 6], [-24, 11]], ribMaterial, 16),
    curve([[-2, -0.8], [-14, -6], [-24, -11]], ribMaterial, 16),
    curve([[0, -1.5], [-16, -11], [-31, -21]], ribMaterial, 16),
  );

  // Dorsal hydrofoil fin with internal rays
  const dorsalGroup = new three.Group();
  const dorsal = new three.Shape();
  dorsal.moveTo(24, 16);
  dorsal.bezierCurveTo(14, 29, -2, 34, -14, 30);
  dorsal.bezierCurveTo(-12, 23, -10, 18, -9, 15.5);
  dorsal.lineTo(24, 16);
  dorsalGroup.add(
    fillOf(dorsal, finFillMaterial),
    outlineOf(dorsal, 48, softOutlineMaterial),
    curve([[16, 17], [9, 24], [2, 29]], ribMaterial, 12),
    curve([[7, 17], [1, 24], [-5, 29]], ribMaterial, 12),
    curve([[-2, 16], [-6, 22], [-10, 27]], ribMaterial, 12),
  );

  // Ventral fin under the belly with delicate rays
  const ventral = new three.Shape();
  ventral.moveTo(-4, -19.5);
  ventral.bezierCurveTo(-9, -28, -18, -31, -25, -28);
  ventral.bezierCurveTo(-21, -23, -16, -19, -13, -17);
  ventral.lineTo(-4, -19.5);

  // Pectoral hydrofoil behind the gill, pivoted so it can feather smoothly.
  const pectoral = new three.Group();
  pectoral.position.set(30, -3.5, 0.2);
  const pectoralShape = new three.Shape();
  pectoralShape.moveTo(2, 0);
  pectoralShape.bezierCurveTo(-4, -9, -14, -15, -23, -13.5);
  pectoralShape.bezierCurveTo(-16, -8, -9, -2.5, -6, 2.5);
  pectoralShape.lineTo(2, 0);
  pectoral.add(
    fillOf(pectoralShape, finFillMaterial),
    outlineOf(pectoralShape, 48, outlineMaterial),
    curve([[0, -1], [-9, -7], [-18, -11]], ribMaterial, 12),
    curve([[-2, 0], [-9, -4], [-15, -7]], ribMaterial, 12),
  );

  // Assemble layers back-to-front
  fish.add(
    tail,
    dorsalGroup,
    fillOf(ventral, finFillMaterial),
    outlineOf(ventral, 40, softOutlineMaterial),
    fillOf(bodyShape),
    outlineOf(innerBodyShape, 96, ribMaterial),
    outlineOf(bodyShape, 120, outlineMaterial),
    pectoral,
  );

  // Longitudinal harmonic lateral & contour lines
  fish.add(curve([[61, 0], [16, 0.5], [-30, 0]], detailMaterial));
  fish.add(curve([[53, 8.5], [16, 14.5], [-25, 8.5]], ribMaterial));
  fish.add(curve([[51, -8.5], [15, -14.5], [-25, -8.5]], ribMaterial));

  // Precision anatomical cross-section ribs
  const ribs: [number, number][] = [
    [28, 16.5],
    [14, 19.5],
    [0, 20],
    [-13, 17],
    [-23, 11],
  ];
  for (const [x, half] of ribs) {
    fish.add(curve([[x, half], [x - 4.5, 0], [x, -half]], ribMaterial, 24));
  }

  // Gill operculum arc
  fish.add(curve([[41, 13], [34, 0], [41, -13]], outlineMaterial, 28));
  fish.add(curve([[44, 10], [38.5, 0], [44, -10]], ribMaterial, 24));

  // Specular rim highlight along dorsal ridge
  fish.add(
    curve(
      [[56, 10.5], [28, 18.5], [-4, 18], [-22, 11]],
      new three.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 }),
    ),
  );

  // Precision optical eye assembly
  const eyeSocket = new three.Mesh(
    new three.CircleGeometry(3.6, 32),
    new three.MeshBasicMaterial({ color: PUPIL, transparent: true, opacity: 0.75 }),
  );
  eyeSocket.position.set(48, 5.5, 0.4);

  const eyeRing = new three.LineLoop(
    new three.BufferGeometry().setFromPoints(
      new three.Path().absarc(0, 0, 3.6, 0, Math.PI * 2, false).getPoints(36).map((p) => new three.Vector3(p.x, p.y, 0)),
    ),
    new three.LineBasicMaterial({ color: EYE_RING, transparent: true, opacity: 0.9 }),
  );
  eyeRing.position.set(48, 5.5, 0.5);

  const eyeIris = new three.Mesh(
    new three.CircleGeometry(2.1, 28),
    new three.MeshBasicMaterial({ color: EYE_CORE }),
  );
  eyeIris.position.set(48, 5.5, 0.55);

  const pupil = new three.Mesh(
    new three.CircleGeometry(1.05, 24),
    new three.MeshBasicMaterial({ color: PUPIL }),
  );
  pupil.position.set(48.4, 5.5, 0.6);

  const eyeGlint = new three.Mesh(
    new three.CircleGeometry(0.48, 16),
    new three.MeshBasicMaterial({ color: 0xffffff }),
  );
  eyeGlint.position.set(47.6, 6.2, 0.65);

  const mouth = curve([[62, -2.5], [57, -4.8], [51, -4.6]], softOutlineMaterial, 16);
  fish.add(eyeSocket, eyeRing, eyeIris, pupil, eyeGlint, mouth);

  return { fish, tail, pectoral, dorsalGroup };
}

interface Bubble {
  mesh: ThreeNS.Mesh;
  ring: ThreeNS.LineLoop;
  x: number;
  offset: number;
  speed: number;
}

function buildBubbles(three: Three): { group: ThreeNS.Group; items: Bubble[] } {
  const group = new three.Group();
  const items: Bubble[] = [];
  const seeds = [
    [58, 0.05, 8.5, 1.35],
    [66, 0.32, 11, 0.95],
    [48, 0.58, 7.5, 1.65],
    [72, 0.78, 12.5, 0.75],
    [36, 0.21, 9.5, 1.15],
    [-42, 0.44, 8.0, 0.85],
    [-54, 0.88, 10.5, 1.05],
  ] as const;

  for (const [x, offset, speed, size] of seeds) {
    const mesh = new three.Mesh(
      new three.CircleGeometry(size, 20),
      new three.MeshBasicMaterial({ color: OUTLINE_SOFT, transparent: true, opacity: 0.28 }),
    );
    const ringPts = new three.Path()
      .absarc(0, 0, size * 1.45, 0, Math.PI * 2, false)
      .getPoints(24)
      .map((p) => new three.Vector3(p.x, p.y, 0));
    const ring = new three.LineLoop(
      new three.BufferGeometry().setFromPoints(ringPts),
      new three.LineBasicMaterial({ color: OUTLINE, transparent: true, opacity: 0.35 }),
    );
    group.add(mesh, ring);
    items.push({ mesh, ring, x, offset, speed });
  }
  return { group, items };
}

function createFishScene(three: Three, host: HTMLElement, onReady: () => void): SceneHandle {
  const renderer = new three.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
  renderer.setClearAlpha(0);

  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);

  const scene = new three.Scene();
  const camera = new three.OrthographicCamera(-1, 1, 1, -1, 0.1, 200);
  camera.position.z = 50;

  const world = new three.Group();
  scene.add(world);

  // No full-stage backdrop: the hero already supplies the gradient. A canvas-sized quad would
  // show its edges against the page once composited, so the fish sits on transparent pixels.
  const { fish, tail, pectoral, dorsalGroup } = buildFish(three);
  world.add(fish);

  const bubbles = buildBubbles(three);
  bubbles.group.position.z = -1;
  world.add(bubbles.group);

  const still = reducedMotion();
  let frame = 0;
  let running = false;
  let onScreen = true;
  let documentVisible = !document.hidden;

  // Interactive pointer parallax target & smoothed state
  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;

  const onPointerMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    pointerTargetX = Math.max(-1, Math.min(1, nx));
    pointerTargetY = Math.max(-1, Math.min(1, ny));
  };

  const draw = (elapsed: number) => {
    pointerCurrentX += (pointerTargetX - pointerCurrentX) * 0.06;
    pointerCurrentY += (pointerTargetY - pointerCurrentY) * 0.06;

    fish.position.x = pointerCurrentX * 3.2;
    fish.position.y = Math.sin(elapsed * 0.95) * 2.4 - pointerCurrentY * 2.6;
    fish.rotation.z = Math.sin(elapsed * 0.6) * 0.038 - pointerCurrentY * 0.025;
    tail.rotation.z = Math.sin(elapsed * 2.05) * 0.24;
    pectoral.rotation.z = Math.sin(elapsed * 1.5 + 0.6) * 0.15;
    dorsalGroup.rotation.z = Math.sin(elapsed * 1.2 + 0.3) * 0.025;

    for (const bubble of bubbles.items) {
      const progress = (elapsed * 0.08 * bubble.speed + bubble.offset) % 1;
      const bx = bubble.x + Math.sin(elapsed * 0.9 + bubble.offset * 8) * 2.6 - pointerCurrentX * 1.8;
      const by = -36 + progress * 102;
      const alpha = Math.sin(progress * Math.PI);
      const scale = 0.75 + progress * 0.55;

      bubble.mesh.position.set(bx, by, 0);
      bubble.ring.position.set(bx, by, 0);
      (bubble.mesh.material as ThreeNS.MeshBasicMaterial).opacity = 0.26 * alpha;
      (bubble.ring.material as ThreeNS.LineBasicMaterial).opacity = 0.38 * alpha;
      bubble.mesh.scale.setScalar(scale);
      bubble.ring.scale.setScalar(scale);
    }

    renderer.render(scene, camera);
  };

  const resize = () => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    // `false`: leave the canvas style alone so CSS keeps it at 100% of the stage.
    renderer.setSize(width, height, false);

    const halfHeight = VIEW_HEIGHT / 2;
    const halfWidth = halfHeight * (width / height);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();

    // Leaves room for the floating labels that sit over the stage corners.
    const fit = Math.min(
      (halfWidth * 2 * 0.88) / FISH_SPAN,
      (halfHeight * 2 * 0.9) / FISH_HEIGHT,
    );
    world.scale.setScalar(Math.max(fit, 0.35));

    if (still) draw(0);
  };

  resize();
  window.addEventListener("resize", resize);

  let resizeObserver: ResizeObserver | undefined;
  if (typeof ResizeObserver !== "undefined") {
    // Keeps the drawing buffer in step with the CSS box, including the reduced-motion still.
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
  }

  const releaseLayout = () => {
    resizeObserver?.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
  };

  if (still) {
    draw(0);
    onReady();
    return {
      stop: () => {
        releaseLayout();
        disposeObject(scene);
        renderer.dispose();
        canvas.remove();
      },
    };
  }

  window.addEventListener("pointermove", onPointerMove, { passive: true });

  // rAF timestamps keep the animation resume-safe: hidden time is skipped instead of jumping.
  let previous = 0;
  let elapsed = 0;

  const tick = (time: number) => {
    if (!running) return;
    frame = window.requestAnimationFrame(tick);
    const delta = previous ? Math.min((time - previous) / 1000, 0.1) : 0;
    previous = time;
    if (!onScreen || !documentVisible) return;
    elapsed += delta;
    draw(elapsed);
  };

  const onDocumentVisibility = () => {
    documentVisible = !document.hidden;
  };
  document.addEventListener("visibilitychange", onDocumentVisibility);

  let observer: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    observer = new IntersectionObserver(
      (entries) => {
        onScreen = entries.some((entry) => entry.isIntersecting);
      },
      { threshold: 0.01 },
    );
    observer.observe(host);
  }

  running = true;
  draw(0);
  onReady();
  frame = window.requestAnimationFrame(tick);

  return {
    stop: () => {
      running = false;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      releaseLayout();
      document.removeEventListener("visibilitychange", onDocumentVisibility);
      disposeObject(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

export function HomeFishScene() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !supportsWebGL()) return;

    let disposed = false;
    let handle: SceneHandle | null = null;

    void (async () => {
      try {
        const three = await import("three");
        if (disposed) return;
        handle = createFishScene(three, host, () => {
          if (!disposed) setReady(true);
        });
      } catch {
        // The static illustration stays in place when the scene cannot start.
      }
    })();

    return () => {
      disposed = true;
      handle?.stop();
    };
  }, []);

  return (
    <div className="home-fish-stage" ref={hostRef} data-testid="home-fish-stage">
      {!ready && <FishSilhouette className="home-fish-static" />}
    </div>
  );
}
