import * as THREE from "three";

export type ScrewPreviewParams = {
  lengthMm: number;
  outerDiameterMm?: number;
  innerDiameterMm?: number;
  threadLengthMm?: number;
};

const PREVIEW_W = 640;
const PREVIEW_H = 480;

/** White scene backdrop for PNG previews and landing R3F canvas. */
export const D2P_PREVIEW_BACKGROUND_HEX = 0xffffff;

/** Bump when preview look (colors / bg) changes — invalidates in-memory PNG cache. */
const PREVIEW_CACHE_VERSION = "d2pred-lg-v5";

/** D2P brand reds for preview screws (slight variation per part). */
const PREVIEW_SCREW_HEAD = 0xdc4b3a;
const PREVIEW_SCREW_THREAD = 0xc94136;
const PREVIEW_SCREW_SMOOTH = 0xd2483d;
const PREVIEW_SCREW_TIP = 0xb8392b;

/** Stable key so visually identical screws share one bitmap. */
export function screwPreviewCacheKey(p: ScrewPreviewParams): string {
  const q = (n: number | undefined, d: number) =>
    n === undefined || Number.isNaN(n) ? "_" : String(Math.round(n * 10 ** d) / 10 ** d);
  return [PREVIEW_CACHE_VERSION, q(p.lengthMm, 2), q(p.outerDiameterMm, 3), q(p.innerDiameterMm, 3), q(p.threadLengthMm, 2)].join(
    ":",
  );
}

const dataUrlCache = new Map<string, string>();

export type ScrewPreviewMaterialVariant = "catalogDark" | "landingLight";

/** Shared screw mesh tree for PNG previews and WebGL (e.g. R3F landing hero). */
export function buildScrewGroup(
  props: ScrewPreviewParams,
  variant: ScrewPreviewMaterialVariant = "catalogDark",
): THREE.Group {
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
  const threadC = 0xa89882;
  const tipC = 0x9d8f7c;

  const headMat =
    variant === "landingLight"
      ? new THREE.MeshStandardMaterial({
          color: PREVIEW_SCREW_HEAD,
          metalness: 0.22,
          roughness: 0.48,
        })
      : new THREE.MeshStandardMaterial({ color: steel, metalness: 0.4, roughness: 0.42 });
  const threadMat =
    variant === "landingLight"
      ? new THREE.MeshStandardMaterial({
          color: PREVIEW_SCREW_THREAD,
          metalness: 0.2,
          roughness: 0.52,
        })
      : new THREE.MeshStandardMaterial({ color: threadC, metalness: 0.35, roughness: 0.5 });
  const smoothMat =
    variant === "landingLight"
      ? new THREE.MeshStandardMaterial({
          color: PREVIEW_SCREW_SMOOTH,
          metalness: 0.21,
          roughness: 0.49,
        })
      : new THREE.MeshStandardMaterial({ color: steel, metalness: 0.38, roughness: 0.44 });
  const tipMat =
    variant === "landingLight"
      ? new THREE.MeshStandardMaterial({
          color: PREVIEW_SCREW_TIP,
          metalness: 0.18,
          roughness: 0.54,
        })
      : new THREE.MeshStandardMaterial({ color: tipC, metalness: 0.32, roughness: 0.48 });

  const headGeom = new THREE.CylinderGeometry(headR, headR * 0.92, headH, 28);
  const headMesh = new THREE.Mesh(headGeom, headMat);
  headMesh.position.y = headY;
  group.add(headMesh);

  const threadGeom = new THREE.CylinderGeometry(shaftR * 1.06, shaftR, threadH, 22);
  const threadMesh = new THREE.Mesh(threadGeom, threadMat);
  threadMesh.position.y = threadY;
  group.add(threadMesh);

  if (smoothH > 0.001) {
    const smoothGeom = new THREE.CylinderGeometry(shaftR, shaftR, smoothH, 20);
    const smoothMesh = new THREE.Mesh(smoothGeom, smoothMat);
    smoothMesh.position.y = smoothY;
    group.add(smoothMesh);
  }

  const tipGeom = new THREE.CylinderGeometry(0, shaftR * 0.85, tipH, 16);
  const tipMesh = new THREE.Mesh(tipGeom, tipMat);
  tipMesh.position.y = tipY;
  group.add(tipMesh);

  return group;
}

/** Dispose geometries/materials under a preview group built by {@link buildScrewGroup}. */
export function disposeScrewGroup(root: THREE.Object3D): void {
  root.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) mat.forEach(m => m.dispose());
      else (mat as THREE.Material | undefined)?.dispose();
    }
  });
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
  scene.background = new THREE.Color(D2P_PREVIEW_BACKGROUND_HEX);

  const camera = new THREE.PerspectiveCamera(42, PREVIEW_W / PREVIEW_H, 0.05, 80);
  camera.position.set(2.4, 0.35, 2.4);
  camera.lookAt(0, 0, 0);

  /* Soft lighting so brand-red screw reads on white without clipping highlights. */
  scene.add(new THREE.AmbientLight(0xffffff, 1.24));
  const d1 = new THREE.DirectionalLight(0xffffff, 2.1);
  d1.position.set(3.8, 6.5, 4.2);
  scene.add(d1);
  const d2 = new THREE.DirectionalLight(0xfff0ee, 0.76);
  d2.position.set(-3.2, -1.2, -3.8);
  scene.add(d2);

  const screw = buildScrewGroup(params, "landingLight");
  scene.add(screw);

  renderer.render(scene, camera);
  const dataUrl = renderer.domElement.toDataURL("image/png");

  disposeScrewGroup(screw);
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
