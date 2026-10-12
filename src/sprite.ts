// Deterministic pixel character per student (ported from the old public/campus.js).
// The same student ID always gives the same hair, shirt, skin and accessories.

const hash = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const HAIRS = ['short', 'spiky', 'cap', 'long'] as const;
const SHIRTS = ['#3b5dc9', '#38b764', '#b13e53', '#ef7d57', '#5d4a85', '#257179'];
const HAIR_COLORS = ['#2a2433', '#3b2a26', '#5d275d', '#747474'];
const SKINS = ['#f0b98d', '#e8a06a', '#c98a5b', '#f5d0a9'];

function avatarFor(seed: string) {
  const h = hash(seed);
  return {
    hair: HAIRS[h % HAIRS.length],
    hairColor: HAIR_COLORS[(h >> 2) % HAIR_COLORS.length],
    shirt: SHIRTS[(h >> 4) % SHIRTS.length],
    capColor: SHIRTS[(h >> 6) % SHIRTS.length],
    skin: SKINS[(h >> 8) % SKINS.length],
    glasses: h % 5 === 0,
    headset: h % 7 === 0,
  };
}

const BODY = [
  '................', '................', '................', '................', '................',
  '...SSSSSSSSSS...', '...SSESSSSESS...', '...SSESSSSESS...', '...SSSSSSSSSS...', '...SSSSMMSSSS...',
  '....SSSSSSSS....', '......SSSS......', '....TTTTTTTT....', '...TTTTDDTTTT...', '..TTTTTTTTTTTT..',
  '..TTTTTTTTTTTT..', '..SSTTTTTTTTSS..', '....PPPPPPPP....', '....PPP..PPP....', '....PPP..PPP....',
  '...BBBB..BBBB...',
];
const HAIR: Record<string, string[]> = {
  short: ['................', '....HHHHHHHH....', '...HHHHHHHHHH...', '...HHHHHHHHHH...', '...HHSHHSHHHH...'],
  spiky: ['....H..H..H.....', '....HHHHHHHH....', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '...HSHHSHHSHH...'],
  cap: ['................', '....CCCCCCCC....', '...CCCCCCCCCC...', '...CCCCCCCCCCCC.', '...HHHHHHHHHH...'],
  long: ['................', '....HHHHHHHH....', '...HHHHHHHHHH...', '..HHHHHHHHHHHH..', '..HHHHHSSSSHHH..'],
};

function toRgb(c: string) {
  let h = c.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((x) => x + x).join('');
  const n = parseInt(h, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, f: number) {
  const x = toRgb(a);
  const y = toRgb(b);
  return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(',') + ')';
}

export function paintSprite(canvas: HTMLCanvasElement, seed: string) {
  const a = avatarFor(seed || '?');
  const grid = BODY.map((r) => r.split(''));
  (HAIR[a.hair] || HAIR.short).forEach((row, y) => { grid[y] = row.split(''); });
  if (a.glasses) {
    grid[6] = '...SGGGSSGGGS...'.split('');
    grid[7] = '...SGEGSSGEGS...'.split('');
  }
  if (a.headset) {
    for (let x = 5; x <= 10; x++) grid[0][x] = 'K';
    for (let y = 1; y <= 5; y++) { grid[y][2] = 'K'; grid[y][13] = 'K'; }
  }
  const colors: Record<string, string> = {
    S: a.skin, E: '#1a1c2c', M: '#b13e53', H: a.hairColor, C: a.capColor,
    T: a.shirt, D: mix(a.shirt, '#1a1c2c', 0.35), P: '#29366f', B: '#333c57', G: '#1a1c2c', K: '#566c86',
  };
  canvas.width = 18;
  canvas.height = grid.length + 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const filled = (y: number, x: number) => Boolean(grid[y] && grid[y][x] && grid[y][x] !== '.');
  // Dark outline around every filled pixel
  ctx.fillStyle = '#1a1c2c';
  for (let yy = -1; yy <= grid.length; yy++) {
    for (let xx = -1; xx <= 16; xx++) {
      if (filled(yy, xx)) continue;
      if (filled(yy - 1, xx) || filled(yy + 1, xx) || filled(yy, xx - 1) || filled(yy, xx + 1)) ctx.fillRect(xx + 1, yy + 1, 1, 1);
    }
  }
  grid.forEach((row, ry) => {
    row.forEach((c, rx) => {
      if (c === '.') return;
      ctx.fillStyle = colors[c];
      ctx.fillRect(rx + 1, ry + 1, 1, 1);
    });
  });
}
