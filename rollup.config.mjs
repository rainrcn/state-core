import nodeResolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import replace from "@rollup/plugin-replace";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";

const defaultNodeResolveConfig = {};
const nodeResolvePlugin = nodeResolve(defaultNodeResolveConfig);

const commonPlugins = [
  nodeResolvePlugin,
  babel.default({
    presets: ["@babel/preset-env"],
    babelHelpers: "bundled",
  }),
  commonjs(),
];

const developmentPlugins = [
  ...commonPlugins,
  replace({
    "process.env.NODE_ENV": JSON.stringify("development"),
  }),
];

const productionPlugins = [
  ...commonPlugins,
  replace({
    "process.env.NODE_ENV": JSON.stringify("production"),
  }),
  terser({ mangle: false }),
];

export default [
  {
    input: "src/index.js",
    output: {
      file: "lib/cjs/statecore.js",
      format: "cjs",
      exports: "default",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/index.js",
    output: {
      file: "lib/es/statecore.js",
      format: "es",
    },
    plugins: commonPlugins,
  },
  {
    input: "src/index.js",
    output: {
      file: "lib/umd/statecore.js",
      format: "umd",
      name: "state",
    },
    plugins: developmentPlugins,
  },
  {
    input: "src/index.js",
    output: {
      file: "lib/umd/statecore.min.js",
      format: "umd",
      name: "state",
    },
    plugins: productionPlugins,
  },
];
