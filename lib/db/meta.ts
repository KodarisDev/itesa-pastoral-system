import { readJson, writeJson, withFileLock } from "./base";
import type { MetaAnioEscolar } from "@/types";

const FILE = "meta.json";

const DEFAULT_META: MetaAnioEscolar = {
  anioActual: String(new Date().getFullYear()),
  fechaUltimaCargaRoster: null,
  totalEstudiantes: 0,
};

export const getMeta = () => readJson<MetaAnioEscolar>(FILE, DEFAULT_META);

export function saveMeta(meta: MetaAnioEscolar) {
  return withFileLock(FILE, () => writeJson(FILE, meta));
}
