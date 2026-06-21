/**
 * Built-in CIEE intelligence engines — hand-authored, clinically reviewed
 * decision graphs run by the same PathwayExecutionEngine (CIEEEngineRunner)
 * as guideline-generated engines. Surfaced in the Intelligence Engines hub
 * alongside DB-saved engines.
 *
 * Note: the UTI/VUR reference engine lives in the Clinical Support "Engines"
 * tab as "Febrile UTI — Evaluation & Imaging" (single source of truth), so it
 * is intentionally not duplicated here.
 */
import { IGA_IPNA_ENGINE } from '@/lib/engines/igaIpnaEngine';
import { SSNS_ENGINE } from '@/lib/engines/ssnsEngine';

export const BUILTIN_ENGINES = [
  SSNS_ENGINE,
  IGA_IPNA_ENGINE,
];
