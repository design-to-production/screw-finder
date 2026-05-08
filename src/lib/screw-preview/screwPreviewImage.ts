import * as THREE from "three";

export type ScrewPreviewParams = {
  lengthMm: number;
  outerDiameterMm?: number;
  innerDiameterMm?: number;
  threadLengthMm?: number;
};

const PREVIEW_W = 640;
const PREVIEW_H = 480;

/** Stable key so visually identical screws share one bitmap. */
export function screwPreviewCacheKey(p: ScrewPreviewParams): string {
  const q = (n: number | undefined, d: number) =>
    n === undefined || Number.isNaN(n) ? "_" : String(Math.round(n * 10 ** d) / 10 ** d);
  return [q(p.lengthMm, 2), q(p.outerDiameterMm, 3), q(p.innerDiameterMm, 3), q(p.threadLengthMm, 2)].join(":");
}

const dataUrlCache = new Map<string, string>();

function disposeObject3D(root: THREE.Object3D) {
  root.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach(m => m.dispose());
      else (mat as THREE.Material | undefined)?.dispose();
    }
  });
}

function buildScrewGroup(props: ScrewPreviewParams): THREE.Group {
  const L = Math.max(props.lengthMm, 1);
  const od = Math.max(props.outerDiameterMm ?? 6, 0.1);
  const id = Math.max(props.innerDiameterMm ?? od * 0.55, 0.05);
  const tl = Math.min(props.threadLengthMm ?? L * 0.7, L);

  const inv = 1.75 / L;
  const headH = Math.min(L * 0.22, od * 1.5) * inv;
  const tipH = od * 0.35 * inv;
  const midH = L * inv - headH - tipH;
  const threadH = Math.min(tl * inv, Math.max(midH * 0.92, 0.08));
  const smoothH = Math.max(midH - threadH, 0);

  const headR = (od / 2) * inv;
  const shaftR = (id / 2) * inv;

  let y = 0;
  const headY = y + headH / 2;
  y += headH;
  const threadY = y + threadH / 2;
  y += threadH;
  const smoothY = y + smoothH / 2;
  y += smoothH;
  const tipY = y + tipH / 2;

  const total = headH + threadH + smoothH + tipH;
  const offset = -total / 2;

  const group = new THREE.Group();
  group.position.y = offset;
  group.rotation.y = 0.85;

  const steel = 0xb8a894;

  const headGeom = new THREE.CylinderGeometry(headR, headR * 0.92, headH, 28);
  const headMesh = new THREE.Mesh(
    headGeom,
    new THREE.MeshStandardMaterial({ color: steel, metalness: 0.4, roughness: 0.42 }),
  );
  headMesh.position.y = headY;
  group.add(headMesh);

  const threadGeom = new THREE.CylinderGeometry(shaftR * 1.06, shaftR, threadH, 22);
  const threadMesh = new THREE.Mesh(
    threadGeom,
    new THREE.MeshStandardMaterial({ color: 0xa89882, metalness: 0.35, roughness: 0.5 }),
  );
  threadMesh.position.y = threadY;
  group.add(threadMesh);

  if (smoothH > 0.001) {
    const smoothGeom = new THREE.CylinderGeometry(shaftR, shaftR, smoothH, 20);
    const smoothMesh = new THREE.Mesh(
      smoothGeom,
      new THREE.MeshStandardMaterial({ color: steel, metalness: 0.38, roughness: 0.44 }),
    );
    smoothMesh.position.y = smoothY;
    group.add(smoothMesh);
  }

  const tipGeom = new THREE.CylinderGeometry(0, shaftR * 0.85, tipH, 16);
  const tipMesh = new THREE.Mesh(
    tipGeom,
    new THREE.MeshStandardMaterial({ color: 0x9d8f7c, metalness: 0.32, roughness: 0.48 }),
  );
  tipMesh.position.y = tipY;
  group.add(tipMesh);

  return group;
}

let renderer: THREE.WebGLRenderer | null = null;

function getOffscreenRenderer(): THREE.WebGLRenderer {
  if (!renderer) {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(PREVIEW_W, PREVIEW_H, false);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const el = renderer.domElement;
    el.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;visibility:hidden;pointer-events:none;";
    el.setAttribute("aria-hidden", "true");
    if (typeof document !== "undefined") {
      document.body.appendChild(el);
    }
  }
  return renderer;
}

function renderScrewPreviewDataUrlSync(params: ScrewPreviewParams): string {
  const renderer = getOffscreenRenderer();
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e1e1e);

  const camera = new THREE.PerspectiveCamera(42, PREVIEW_W / PREVIEW_H, 0.05, 80);
  camera.position.set(2.4, 0.35, 2.4);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const d1 = new THREE.DirectionalLight(0xffffff, 1.15);
  d1.position.set(3.5, 6, 4);
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xffffff, 0.25);
  d2.position.set(-2, -1, -3);
  scene.add(d2);

  const screw = buildScrewGroup(params);
  scene.add(screw);

  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL("image/png");

  disposeObject3D(screw);
  scene.remove(screw);

  return dataUrl;
}

/** Serialize GPU snapshots — one shared GL context, deterministic pixels for caching. */
let renderMutex = Promise.resolve();

/**
 * Returns a PNG data URL for the screw silhouette. Results are memoized in memory by {@link screwPreviewCacheKey}.
 */
export function getScrewPreviewDataUrl(params: ScrewPreviewParams): Promise<string> {
  const key = screwPreviewCacheKey(params);
  const cached = dataUrlCache.get(key);
  if (cached) return Promise.resolve(cached);

  const run = renderMutex.then(() => {
    const hit = dataUrlCache.get(key);
    if (hit) return hit;
    const url = renderScrewPreviewDataUrlSync(params);
    dataUrlCache.set(key, url);
    return url;
  });

  renderMutex = run.then(
    () => undefined,
    () => undefined,
  );

  return run;
}
