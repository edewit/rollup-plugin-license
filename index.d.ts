import { Plugin } from "rollup";

declare const run: (options?: LicenseOptions) => Plugin;
export default run;

export interface LicenseOptions {
  root?: string;
  writeTo?: (analysisString: string) => void;
  onAnalysis?: (analysisObject: AnalysisObject) => void;
}

export interface AnalysisObject {
  modules: Module[];
}

export interface Module {
  id: string;
  files: string[];
  truncated: boolean;
}
