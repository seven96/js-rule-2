import commonjs from "rollup-plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import nodeResolve, { DEFAULTS } from "@rollup/plugin-node-resolve";
import sourcemaps from "rollup-plugin-sourcemaps";
import { terser } from "rollup-plugin-terser";
import babel from "@rollup/plugin-babel";
import json from "@rollup/plugin-json";
import filesize from "rollup-plugin-filesize";
import dts from "rollup-plugin-dts";
import pkg from "./package.json" assert { type: "json" };

// eslint-disable-next-line no-undef
const BUILD_TARGET_ENV = process.env.TARGET;
const isDev = BUILD_TARGET_ENV === "dev";
const buildOutputDir = isDev ? "./playground/" : "./dist/";

/**
 * sourceMap is true by default, but we want to disable it for production builds
 */
const sourcemap = !isDev;

/**
 * We want to use the same extensions as the node-resolve plugin
 */
const extensions = [...DEFAULTS.extensions, ".ts", ".tsx"];

const bundleConfig = {
  input: "lib/index.ts",
  output: [
    {
      sourcemap: sourcemap,
      file: buildOutputDir + pkg.exports.default,
      format: "umd",
      name: "RuleEngine",
      exports: "named",
    },
    { sourcemap: sourcemap, format: "esm", file: buildOutputDir + pkg.exports.import },
    {
      sourcemap: sourcemap,
      format: "cjs",
      file: buildOutputDir + pkg.exports.require,
      exports: "named",
    },
  ],
  plugins: [
    commonjs(),
    typescript(),
    nodeResolve({ extensions, moduleDirectories: ["node_modules"] }),
    json(),
    sourcemaps(),
    filesize(),
    terser(),
    babel({ exclude: "node_modules/**", extensions, babelHelpers: "runtime" }),
  ],
  external: [...Object.keys(pkg.peerDependencies || {}), /@babel\/runtime/],
  watch: {
    include: "lib/**",
  },
};

const dtsConfig = {
  input: "lib/index.ts",
  output: [{ file: "./dist/index.d.ts", format: "es" }],
  plugins: [dts()],
};

const configs = [bundleConfig];
if (!isDev) {
  configs.push(dtsConfig);
}
export default configs;
