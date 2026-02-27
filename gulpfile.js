/**
 * OpNet-Trivia — Gulpfile
 *
 * Compiles AssemblyScript (.ts) to WebAssembly (.wasm) using asc.
 *
 * Commands:
 *   gulp build        — compile optimized release WASM
 *   gulp build:debug  — compile debug WASM with source maps
 *   gulp clean        — delete build/ folder
 */

import gulp from 'gulp';
import { exec } from 'child_process';
import { existsSync, mkdirSync, rmSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR  = join(__dirname, 'build');
const ENTRY      = join(__dirname, 'src/index.ts');

function ensureBuildDir() {
    if (!existsSync(BUILD_DIR)) {
        mkdirSync(BUILD_DIR, { recursive: true });
        console.log('Created build/ directory');
    }
}

function runAsc(args, done) {
    const asc = existsSync(join(__dirname, 'node_modules/.bin/asc'))
        ? join(__dirname, 'node_modules/.bin/asc')
        : 'asc';

    const cmd = `"${asc}" ${args}`;
    console.log(`\nRunning: ${cmd}\n`);

    exec(cmd, { cwd: __dirname }, (err, stdout, stderr) => {
        if (stdout) process.stdout.write(stdout);
        if (stderr) process.stderr.write(stderr);

        if (err) {
            console.error('\n❌ Compilation failed!');
            console.error('   → Run: npm install');
            done(err);
        } else {
            console.log('\n✅ Compilation successful!');
            done();
        }
    });
}

export function clean(done) {
    if (existsSync(BUILD_DIR)) {
        rmSync(BUILD_DIR, { recursive: true, force: true });
        console.log('Cleaned build/ directory');
    } else {
        console.log('Nothing to clean');
    }
    done();
}

export function build(done) {
    ensureBuildDir();

    const args = [
        `"${ENTRY}"`,
        '--outFile',  `"${join(BUILD_DIR, 'contract.wasm')}"`,
        '--textFile', `"${join(BUILD_DIR, 'contract.wat')}"`,
        '--optimize',
        '--optimizeLevel', '3',
        '--shrinkLevel',   '2',
        '--runtime',       'stub',
    ].join(' ');

    console.log('Building release contract (optimized)...');

    runAsc(args, (err) => {
        if (!err) {
            const wasmPath = join(BUILD_DIR, 'contract.wasm');
            if (existsSync(wasmPath)) {
                const size = statSync(wasmPath).size;
                console.log(`\nOutput: build/contract.wasm (${size} bytes)`);
                console.log('');
                console.log('╔══════════════════════════════════════════════════╗');
                console.log('║  ✅  WASM ready for deployment!                  ║');
                console.log('╠══════════════════════════════════════════════════╣');
                console.log('║  1. Open OP_WALLET extension in your browser     ║');
                console.log('║  2. Click "Deploy Contract"                      ║');
                console.log('║  3. Drag build/contract.wasm into the dialog     ║');
                console.log('║  4. Confirm the transaction                      ║');
                console.log('║  5. Copy the contract address from OP_WALLET     ║');
                console.log('║  6. Paste it into opnet_game.html                ║');
                console.log('╚══════════════════════════════════════════════════╝');
            }
        }
        done(err);
    });
}

export function buildDebug(done) {
    ensureBuildDir();

    const args = [
        `"${ENTRY}"`,
        '--outFile',  `"${join(BUILD_DIR, 'contract_debug.wasm')}"`,
        '--textFile', `"${join(BUILD_DIR, 'contract_debug.wat')}"`,
        '--sourceMap',
        '--debug',
        '--runtime', 'stub',
    ].join(' ');

    console.log('Building debug contract...');
    runAsc(args, done);
}

gulp.task('build',       build);
gulp.task('build:debug', buildDebug);
gulp.task('clean',       clean);
gulp.task('default',     build);
