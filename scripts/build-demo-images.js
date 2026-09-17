/* eslint-disable no-console */
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const services = ['auth', 'user', 'page', 'log', 'product', 'order', 'cart', 'payment', 'notifier', 'stock', 'ticket', 'assistant'];
const builds = [
  ['api-gateway', 'templates/back/api-gateway/Dockerfile'],
  ...services.map((name) => [`${name}-service`, `templates/back/services/${name}-service/Dockerfile`]),
  ['front', 'templates/front/Dockerfile'],
];
const builder = 'goosee-demo-limited';
function run(args) {
  const result = spawnSync('docker', args, { cwd: ROOT, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`docker ${args[0]} failed (${result.status})`);
}
function buildImages(selected = []) {
  const envPath = path.join(ROOT, 'env', '.env.dev');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(.*)$/);
      if (match && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = match[1];
    }
  }
  for (const name of selected) if (!builds.some(([known]) => known === name)) throw new Error('Unknown image: ' + name);
  const inspect = spawnSync('docker', ['buildx', 'inspect', builder], { stdio: 'ignore', windowsHide: true });
  if (inspect.status !== 0) {
    run(['buildx', 'create', '--name', builder, '--driver', 'docker-container',
      '--driver-opt', 'cpu-period=100000,cpu-quota=200000,memory=4g',
      '--buildkitd-config', path.join(ROOT, 'docker', 'buildkitd.toml')]);
  }
  for (const [name, file] of builds) {
    if (selected.length && !selected.includes(name)) continue;
    console.log(`Building ${name} (builder limited to 2 CPUs)`);
    run(['buildx', 'build', '--builder', builder, '--load', '--progress', 'plain',
      '--build-arg', `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}`,
      '-f', file, '-t', `goosee/${name}:local`, '.']);
  }
}
if (require.main === module) {
  try { buildImages(process.argv.slice(2)); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { buildImages, images: builds.map(([name]) => `goosee/${name}:local`) };
