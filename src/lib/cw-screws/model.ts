export type CwLangCode =
  | "de"
  | "en"
  | "cz"
  | "ee"
  | "fr"
  | "it"
  | "ja"
  | "nw"
  | "pl"
  | "pt"
  | "ro"
  | "ru"
  | "sp"
  | "su"
  | "zh"
  | "mg"
  | "nl";

export interface CwConnectorMeta {
  modified?: string;
  version?: string;
  editor?: string;
  date?: string;
}

export interface CwItemLength {
  lengthMm: number;
  threadLengthMm?: number;
  threadLength2Mm?: number;
  weightKg?: number;
  orderNumber?: string;
}

export interface CwCondensedAttributes {
  name?: string;
  material?: string;
  norm?: string;
  shortName?: string;
}

export interface CwScrewItem {
  attributes?: CwCondensedAttributes;

  /** Category path from flattened VbaItemFolders (deepest-first segments joined). */
  folderPath?: string;
  folderNames?: Partial<Record<CwLangCode, string>>;
  folderIsReadonly?: boolean;

  // Common geometry / properties (names normalized; values are kept numeric where possible)
  thicknessMm?: number;
  outerDiameterMm?: number;
  innerDiameterMm?: number;
  drillingDiameter1Mm?: number;
  drillingDiameter2Mm?: number;
  drillingDepthMm?: number;
  representationSymbol?: number;
  openingWidthMm?: number;
  onBothSides?: boolean;
  isReadonly?: boolean;
  isVisible?: boolean;
  weightKg?: number;
  overlengthMm?: number;
  drive?: string;
  dimensionValue1?: number;
  dimensionValue2?: number;
  dimensionValue3?: number;
  drillingValue1?: number;
  drillingValue2?: number;
  drillingValue3?: number;
  manufacturer?: string;
  orderNumber?: string;

  userFields?: Partial<Record<`USER${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`, string>>;

  lengths: CwItemLength[];

  // Preserve any unrecognized fields for forward-compat.
  raw?: Record<string, string>;
}

export interface CwScrewsDocument {
  meta: CwConnectorMeta;
  items: CwScrewItem[];
}
