import type {
  CwConnectorMeta,
  CwCondensedAttributes,
  CwItemLength,
  CwLangCode,
  CwScrewItem,
  CwScrewsDocument,
} from "./model";

function text(el: Element | null | undefined): string | undefined {
  const t = el?.textContent ?? "";
  const trimmed = t.trim();
  return trimmed.length ? trimmed : undefined;
}

function num(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

function int(value: string | undefined): number | undefined {
  const n = num(value);
  if (n === undefined) return undefined;
  return Number.isInteger(n) ? n : Math.trunc(n);
}

function bool01(value: string | undefined): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === "1") return true;
  if (value === "0") return false;
  return undefined;
}

function getChildText(parent: Element, tag: string): string | undefined {
  return text(parent.querySelector(`:scope > ${tag}`));
}

function toLangCode(raw: string): CwLangCode | undefined {
  const key = raw.toLowerCase();
  if (key === "al") return "de";
  if (key === "an") return "en";
  if (
    key === "de" ||
    key === "en" ||
    key === "cz" ||
    key === "ee" ||
    key === "fr" ||
    key === "it" ||
    key === "ja" ||
    key === "nw" ||
    key === "pl" ||
    key === "pt" ||
    key === "ro" ||
    key === "ru" ||
    key === "sp" ||
    key === "su" ||
    key === "zh" ||
    key === "mg" ||
    key === "nl"
  ) {
    return key;
  }
  return undefined;
}

function parseNames(record: Element): Partial<Record<CwLangCode, string>> {
  const names: Partial<Record<CwLangCode, string>> = {};
  for (const child of Array.from(record.children)) {
    const m = /^NAME_([A-Z]{2})$/.exec(child.tagName);
    if (!m) continue;
    const raw = m[1];
    if (!raw) continue;
    const lang = toLangCode(raw);
    if (!lang) continue;
    const v = text(child);
    if (v !== undefined) names[lang] = v;
  }

  // Remove entries that are identical to English.
  const en = names.en;
  if (en !== undefined) {
    for (const [k, v] of Object.entries(names)) {
      if (k !== "en" && v === en) {
        delete (names as Record<string, string>)[k];
      }
    }
  }

  return names;
}

function pickName(names: Partial<Record<CwLangCode, string>>): string | undefined {
  // Prefer English when present; fall back to anything.
  return names.en ?? names.nl ?? names.fr ?? names.it ?? Object.values(names)[0];
}

function parseItemLength(record: Element): CwItemLength {
  return {
    lengthMm: num(getChildText(record, "LENGTH")) ?? 0,
    threadLengthMm: num(getChildText(record, "THREAD_LENGTH")),
    threadLength2Mm: num(getChildText(record, "THREAD_LENGTH_2")),
    weightKg: num(getChildText(record, "WEIGHT")),
    orderNumber: getChildText(record, "ORDERNUMBER"),
  };
}

function parseCondensedAttributes(record: Element): CwCondensedAttributes | undefined {
  const out: CwCondensedAttributes = {};
  const attrRecords = Array.from(record.querySelectorAll(":scope > VbaItemsAttributes > Record"));

  for (const r of attrRecords) {
    const type = int(r.getAttribute("ATTRIBUTE_TYPE") ?? undefined) ?? 0;
    const value = pickName(parseNames(r));
    if (!value) continue;

    if (type === 1) out.name = value;
    else if (type === 2) out.material = value;
    else if (type === 5) out.norm = value;
    else if (type === 6) out.shortName = value;
  }

  return Object.keys(out).length ? out : undefined;
}

/** Merge VbaItemFolders records onto the parent item (no nested folder objects). */
function parseFlattenedFolderFields(folderRecords: Element[]): Pick<
  CwScrewItem,
  "folderPath" | "folderNames" | "folderIsReadonly"
> {
  if (!folderRecords.length) return {};

  const segments: string[] = [];
  let folderIsReadonly: boolean | undefined;

  for (const record of folderRecords) {
    const names = parseNames(record);
    const label = pickName(names) ?? getChildText(record, "NAME");
    if (label) segments.push(label);
    const ro = bool01(getChildText(record, "IS_READONLY"));
    if (ro !== undefined) folderIsReadonly = ro;
  }

  const last = folderRecords[folderRecords.length - 1]!;
  const deepestNames = parseNames(last);

  const folderPath = segments.length ? segments.join(" › ") : undefined;
  return {
    folderPath,
    folderNames: Object.keys(deepestNames).length ? deepestNames : undefined,
    folderIsReadonly,
  };
}

function parseItem(record: Element): CwScrewItem {
  const raw: Record<string, string> = {};
  for (const child of Array.from(record.children)) {
    if (
      child.tagName === "VbaItemLengths" ||
      child.tagName === "VbaItemsAttributes" ||
      child.tagName === "VbaItemFolders"
    ) {
      continue;
    }
    const v = text(child);
    if (v !== undefined) raw[child.tagName] = v;
  }

  const userFields: Partial<
    Record<`USER${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10}`, string>
  > = {};
  for (let i = 1 as const; i <= 10; i++) {
    const k = `USER${i}` as const;
    const v = getChildText(record, k);
    if (v !== undefined) userFields[k] = v;
  }

  const lengths = Array.from(
    record.querySelectorAll(":scope > VbaItemLengths > Record"),
  ).map(parseItemLength);

  const attributes = parseCondensedAttributes(record);

  const folderRecords = Array.from(record.querySelectorAll(":scope > VbaItemFolders > Record"));
  const folderFields = parseFlattenedFolderFields(folderRecords);

  return {
    ...folderFields,
    attributes,
    thicknessMm: num(getChildText(record, "THICKNESS")),
    outerDiameterMm: num(getChildText(record, "OUTER_DIAMETER")),
    innerDiameterMm: num(getChildText(record, "INNER_DIAMETER")),
    drillingDiameter1Mm: num(getChildText(record, "DRILLING_DIAMETER_1")),
    drillingDiameter2Mm: num(getChildText(record, "DRILLING_DIAMETER_2")),
    drillingDepthMm: num(getChildText(record, "DRILLING_DEPTH")),
    representationSymbol: int(getChildText(record, "REPRESENTATION_SYMBOL")),
    openingWidthMm: num(getChildText(record, "OPENGING_WIDTH")),
    onBothSides: bool01(getChildText(record, "ON_BOTH_SIDES")),
    orderNumber: getChildText(record, "ORDERNUMBER"),
    isReadonly: bool01(getChildText(record, "IS_READONLY")),
    isVisible: bool01(getChildText(record, "IS_VISIBLE")),
    weightKg: num(getChildText(record, "WEIGHT")),
    overlengthMm: num(getChildText(record, "OVERLENGTH")),
    drive: getChildText(record, "DRIVE"),
    dimensionValue1: num(getChildText(record, "DIMENSION_VALUE_1")),
    dimensionValue2: num(getChildText(record, "DIMENSION_VALUE_2")),
    dimensionValue3: num(getChildText(record, "DIMENSION_VALUE_3")),
    drillingValue1: num(getChildText(record, "DRILLING_VALUE_1")),
    drillingValue2: num(getChildText(record, "DRILLING_VALUE_2")),
    drillingValue3: num(getChildText(record, "DRILLING_VALUE_3")),
    manufacturer: getChildText(record, "MANUFACTURER"),

    userFields: Object.keys(userFields).length ? userFields : undefined,
    lengths,
    raw: Object.keys(raw).length ? raw : undefined,
  };
}

export function parseCwScrewsVbax(xmlText: string): CwScrewsDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Invalid XML: ${parseError.textContent?.trim() ?? "parse error"}`);
  }

  const root = doc.documentElement;
  if (root.tagName !== "Connector") {
    throw new Error(`Unexpected root element: ${root.tagName}`);
  }

  const meta: CwConnectorMeta = {
    modified: root.getAttribute("Modified") ?? undefined,
    version: root.getAttribute("Version") ?? undefined,
    editor: root.getAttribute("Editor") ?? undefined,
    date: root.getAttribute("Date") ?? undefined,
  };

  const itemRecords = Array.from(root.querySelectorAll("VbaItems > Record"));
  const items = itemRecords.map(parseItem);

  return { meta, items };
}

