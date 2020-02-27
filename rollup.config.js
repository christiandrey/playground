import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const projectName = process.env.PROJECT;

export default {
	input: `${projectName}/index.ts`,
	output: {
		dir: projectName,
		format: 'cjs',
	},
	plugins: [typescript(), resolve(), commonjs()],
};
