export interface CapsuleDef {
  label: string;
  position: [number, number, number];
}

/** Floating technology capsules around the tree (world units). Kept three-free so the DOM layer can import it cheaply. */
export const CAPSULES: CapsuleDef[] = [
  { label: 'Snowflake', position: [-4.6, 1.9, 0.6] },
  { label: 'SQL', position: [4.3, 2.6, -0.6] },
  { label: 'Talend', position: [-5.2, -0.7, -0.4] },
  { label: 'Airflow', position: [4.9, 0.1, 0.9] },
  { label: 'dbt', position: [-2.9, 3.7, -1.6] },
  { label: 'AWS S3', position: [3.3, -1.8, 1.6] },
];
