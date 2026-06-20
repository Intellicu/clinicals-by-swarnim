/**
 * Built-in CIEE intelligence engines — hand-authored, clinically reviewed
 * decision graphs run by the same PathwayExecutionEngine (CIEEEngineRunner)
 * as guideline-generated engines. Surfaced in the Intelligence Engines hub
 * alongside DB-saved engines.
 */
import { UTI_VUR_ENGINE } from '@/lib/engines/utiVurEngine';

export const BUILTIN_ENGINES = [
  UTI_VUR_ENGINE,
];
