/** Types for `src/data/new_data_model.json` (Design-to-Production screw catalog). */

export interface D2pScrewGeometry {
  overall_length_mm: number;
  nominal_diameter_mm: number;
  head_shape: string;
  head_diameter_mm: number;
  core_diameter_mm: number | null;
  drive_type: string;
  drive_size: string;
  thread_type: string;
  thread_length_mm: number;
}

export interface D2pMaterialFinish {
  base_material_key: string;
  manufacturer_coating_name: string;
  sliding_coated: boolean;
}

export interface D2pLogistics {
  ean?: string;
}

export interface D2pScrewRecord {
  screw_key: string;
  manufacturer_key: string;
  article_number: string;
  internal_designation: string;
  commercial_designation: string;
  product_family: string;
  standard: string;
  eta_number: string;
  ce_marked: boolean;
  declaration_of_performance_number: string;
  geometry: D2pScrewGeometry;
  material_finish: D2pMaterialFinish;
  logistics?: D2pLogistics;
}

export interface D2pCatalogFile {
  screws: D2pScrewRecord[];
}
