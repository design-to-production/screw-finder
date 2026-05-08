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
const PREVIEW_CACHE_VERSION = "d2pred-lg-v16";

/** Shaft diameter as a fraction of nominal outer diameter (thread crest = nominal Ø). */
const SHAFT_DIAMETER_RATIO = 0.8;

/** Cone tip: full apex angle (degrees) — half-angle from screw axis = half of this. */
const TIP_CONE_APEX_DEG = 45;

/** Head: full apex angle of the conical head (degrees); height = R_drive / tan(angle/2). */
const HEAD_CONE_APEX_DEG = 90;

/** Drive-face head diameter as a multiple of nominal outer Ø (thread major). */
const HEAD_DIAMETER_RATIO = 2;

/**
 * Axial overlap (scene units): head cone extends this far past the shank top so the meshes
 * intersect and the joint reads solid instead of a hairline gap from tip-point tangency.
 */
const HEAD_SHANK_OVERLAP_RATIO_OF_MAJOR_R = 0.08;

/** Axial pitch per revolution as a fraction of nominal outer Ø (lead = ratio × Ø); 1 = one turn per Ø. */
const THREAD_PITCH_PER_OD = 1;

/**
 * Triangular-profile helical thread: two π-offset crest/root ribbons form opposing flanks.
 * Pitch `p` = axial advance per 2π rad (one full turn).
 */
function createTriangularHelixThreadGeometry(
  threadH: number,
  pitch: number,
  radiusMajor: number,
  radiusMinor: number,
): THREE.BufferGeometry {
  const p = Math.max(pitch, 1e-9);
  const turns = threadH / p;
  const segments = Math.max(24, Math.ceil(turns * 40));
  const positions: number[] = [];
  const indices: number[] = [];

  for (let ribbon = 0; ribbon < 2; ribbon++) {
    const ribbonPhase = ribbon * Math.PI;
    const ribBase = positions.length / 3;

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const y = -threadH / 2 + t * threadH;
      const theta = (2 * Math.PI * y) / p + ribbonPhase;
      positions.push(
        radiusMajor * Math.cos(theta),
        y,
        radiusMajor * Math.sin(theta),
        radiusMinor * Math.cos(theta + Math.PI),
        y,
        radiusMinor * Math.sin(theta + Math.PI),
      );
    }

    for (let i = 0; i < segments; i++) {
      const c0 = ribBase + i * 2;
      const r0 = ribBase + i * 2 + 1;
      const c1 = ribBase + (i + 1) * 2;
      const r1 = ribBase + (i + 1) * 2 + 1;
      indices.push(c0, r0, r1, c0, r1, c1);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

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
  const tl = Math.min(props.threadLengthMm ?? L * 0.7, L);

  const inv = 1.75 / L;
  /** Crest / nominal radius — thread major Ø equals catalog outer Ø. */
  const threadMajorR = (od / 2) * inv;
  /** Smooth core Ø = 80% of nominal ⇒ radial thread depth = 10% of Ø each side. */
  const shaftR = ((SHAFT_DIAMETER_RATIO * od) / 2) * inv;

  const tipHalfAngleRad = (TIP_CONE_APEX_DEG / 2) * (Math.PI / 180);
  const tipH = shaftR / Math.tan(tipHalfAngleRad);

  const headHalfAngleRad = (HEAD_CONE_APEX_DEG / 2) * (Math.PI / 180);
  /** Wide drive radius = HEAD_DIAMETER_RATIO × nominal crest radius (200% Ø ⇒ radius = Ø). */
  const headDriveR = HEAD_DIAMETER_RATIO * threadMajorR;
  const headH = headDriveR / Math.tan(headHalfAngleRad);

  /** Shank from tip base to drive plane; head cone sits down into this span (drive face at top plane). */
  const midBody = Math.max(L * inv - tipH, 0.001);
  /** Catalog thread length runs from tip base toward head (scaled). */
  const threadSegH = Math.min(tl * inv, midBody);
  /** Remaining shank at nominal Ø between head and threaded zone. */
  const smoothOuterH = Math.max(midBody - threadSegH, 0);

  /** Tip → thread → shank; head cone moved down by full headH so drive sits on shank top plane at y = total. */
  let y = 0;
  const tipY = y + tipH / 2;
  y += tipH;
  const threadY = y + threadSegH / 2;
  y += threadSegH;
  const smoothOuterY = y + smoothOuterH / 2;
  y += smoothOuterH;
  /** Top plane of shank / underside of drive (overall length ends here). */
  const shankHeadJunctionY = y;
  const headShankOverlap = Math.max(threadMajorR * HEAD_SHANK_OVERLAP_RATIO_OF_MAJOR_R, 1e-4);
  const headGeomH = headH + headShankOverlap;
  const headY = shankHeadJunctionY + headGeomH / 2 - headShankOverlap - headH;

  const total = tipH + midBody;
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
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        })
      : new THREE.MeshStandardMaterial({
          color: threadC,
          metalness: 0.35,
          roughness: 0.5,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });
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

  /** Point at y = 0; base (shaftR) meets thread zone. */
  const tipGeom = new THREE.CylinderGeometry(shaftR, 0, tipH, 16);
  const tipMesh = new THREE.Mesh(tipGeom, tipMat);
  tipMesh.position.y = tipY;
  group.add(tipMesh);

  if (threadSegH > 0.001) {
    const threadCoreGeom = new THREE.CylinderGeometry(shaftR, shaftR, threadSegH, 24);
    const threadCoreMesh = new THREE.Mesh(threadCoreGeom, smoothMat);
    threadCoreMesh.position.y = threadY;
    group.add(threadCoreMesh);

    const pitchScene = THREAD_PITCH_PER_OD * od * inv;
    const threadGeom = createTriangularHelixThreadGeometry(threadSegH, pitchScene, threadMajorR, shaftR);
    const threadMesh = new THREE.Mesh(threadGeom, threadMat);
    threadMesh.position.y = threadY;
    group.add(threadMesh);
  }

  if (smoothOuterH > 0.001) {
    const smoothOuterGeom = new THREE.CylinderGeometry(threadMajorR, threadMajorR, smoothOuterH, 28);
    const smoothOuterMesh = new THREE.Mesh(smoothOuterGeom, smoothMat);
    smoothOuterMesh.position.y = smoothOuterY;
    group.add(smoothOuterMesh);
  }

  /** Drive face (+y) on shank top plane; apex (−y) runs down into shank with overlap. */
  const headGeom = new THREE.CylinderGeometry(headDriveR, 0, headGeomH, 28);
  const headMesh = new THREE.Mesh(headGeom, headMat);
  headMesh.position.y = headY;
  group.add(headMesh);

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
