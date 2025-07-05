const circleCount = 1500;
const circlePropCount = 400;
const circlePropsLength = circleCount * circlePropCount;

const baseSpeed = 0.01;
const rangeSpeed = 0.01;

const baseTTL = 150;
const rangeTTL = 200;
const baseRadius = 50;
const rangeRadius = 20;

const baseHue = 205;
const rangeHue = 20;

const xOff = 0.0015;
const yOff = 0.0015;
const zOff = 0.0015;

const backgroundColor = '#233D4D';

let container;
let canvas;
let ctx;
let circleProps;
let simplex;

function setup() {
  createCanvas();
  resize();
  initCircles();
  draw();
}

function initCircles() {
  circleProps = new Float32Array(circlePropsLength);
  simplex = new SimplexNoise();

  for (let i = 0; i < circlePropsLength; i += circlePropCount) {
    initCircle(i);
  }
}

function initCircle(i) {
  let x, y, n, t, speed, vx, vy, life, ttl, radius, hue;

  x = Math.random() * canvas.a.width;
  y = Math.random() * canvas.a.height;
  n = simplex.noise3D(x * xOff, y * yOff, baseHue * zOff);
  t = Math.random() * Math.PI * 2;
  speed = baseSpeed + Math.random() * rangeSpeed;
  vx = speed * Math.cos(t);
  vy = speed * Math.sin(t);
  life = 0;
  ttl = baseTTL + Math.random() * rangeTTL;
  radius = baseRadius + Math.random() * rangeRadius;
  hue = baseHue + n * rangeHue;

  circleProps.set([x, y, vx, vy, life, ttl, radius, hue], i);
}

function updateCircles() {
  for (let i = 0; i < circlePropsLength; i += circlePropCount) {
    updateCircle(i);
  }
}

function updateCircle(i) {
  let x = circleProps[i];
  let y = circleProps[i + 1];
  let vx = circleProps[i + 2];
  let vy = circleProps[i + 3];
  let life = circleProps[i + 4];
  let ttl = circleProps[i + 5];
  let radius = circleProps[i + 6];
  let hue = circleProps[i + 7];

  drawCircle(x, y, life, ttl, radius, hue);

  life++;

  circleProps[i] = x + vx;
  circleProps[i + 1] = y + vy;
  circleProps[i + 4] = life;

  if (x < -radius || x > canvas.a.width + radius || y < -radius || y > canvas.a.height + radius || life > ttl) {
    initCircle(i);
  }
}

function drawCircle(x, y, life, ttl, radius, hue) {
  ctx.a.save();
  ctx.a.fillStyle = `hsla(${hue}, 60%, 35%, 0.3)`;
  ctx.a.beginPath();
  ctx.a.arc(x, y, radius, 0, Math.PI * 2);
  ctx.a.fill();
  ctx.a.closePath();
  ctx.a.restore();
}

function createCanvas() {
  container = document.querySelector('.content--canvas');
  canvas = {
    a: document.createElement('canvas'),
    b: document.createElement('canvas')
  };
  canvas.b.style = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  `;
  container.appendChild(canvas.b);
  ctx = {
    a: canvas.a.getContext('2d'),
    b: canvas.b.getContext('2d')
  };
}

function resize() {
  canvas.a.width = window.innerWidth;
  canvas.a.height = window.innerHeight;
  ctx.a.drawImage(canvas.b, 0, 0);
  canvas.b.width = window.innerWidth;
  canvas.b.height = window.innerHeight;
  ctx.b.drawImage(canvas.a, 0, 0);
}

function render() {
  ctx.b.save();
  ctx.b.filter = 'blur(50px)';
  ctx.b.drawImage(canvas.a, 0, 0);
  ctx.b.restore();
}

function draw() {
  ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
  ctx.b.fillStyle = backgroundColor;
  ctx.b.fillRect(0, 0, canvas.b.width, canvas.b.height);
  updateCircles();
  render();
  window.requestAnimationFrame(draw);
}

window.addEventListener('load', setup);
window.addEventListener('resize', resize);

class SimplexNoise {
  constructor(r = Math) {
    this.grad3 = [
      [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
      [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
      [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
    ];
    this.p = Array.from({ length: 256 }, () => Math.floor(r.random() * 256));
    this.perm = Array.from({ length: 512 }, (_, i) => this.p[i & 255]);
  }

  dot(g, x, y, z) {
    return g[0]*x + g[1]*y + g[2]*z;
  }

  noise3D(xin, yin, zin) {
    const F3 = 1 / 3;
    const G3 = 1 / 6;
    let n0, n1, n2, n3;
    const s = (xin + yin + zin) * F3;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const k = Math.floor(zin + s);
    const t = (i + j + k) * G3;
    const X0 = i - t;
    const Y0 = j - t;
    const Z0 = k - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    const z0 = zin - Z0;

    const [i1, j1, k1] = x0 >= y0
      ? (y0 >= z0 ? [1, 1, 0] : (x0 >= z0 ? [1, 0, 1] : [0, 0, 1]))
      : (y0 < z0 ? [0, 0, 1] : (x0 < z0 ? [0, 1, 1] : [0, 1, 0]));

    const x1 = x0 - i1 + G3;
    const y1 = y0 - j1 + G3;
    const z1 = z0 - k1 + G3;
    const x2 = x0 - 1 + 2 * G3;
    const y2 = y0 - 1 + 2 * G3;
    const z2 = z0 - 1 + 2 * G3;
    const x3 = x0 - 1 + 3 * G3;
    const y3 = y0 - 1 + 3 * G3;
    const z3 = z0 - 1 + 3 * G3;

    const ii = i & 255;
    const jj = j & 255;
    const kk = k & 255;
    const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
    const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
    const gi2 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
    const gi3 = this.perm[ii + 2 + this.perm[jj + 2 + this.perm[kk + 2]]] % 12;

    const t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
    n0 = t0 < 0 ? 0 : (t0 * t0) * (t0 * t0) * this.dot(this.grad3[gi0], x0, y0, z0);

    const t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
    n1 = t1 < 0 ? 0 : (t1 * t1) * (t1 * t1) * this.dot(this.grad3[gi1], x1, y1, z1);

    const t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
    n2 = t2 < 0 ? 0 : (t2 * t2) * (t2 * t2) * this.dot(this.grad3[gi2], x2, y2, z2);

    const t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
    n3 = t3 < 0 ? 0 : (t3 * t3) * (t3 * t3) * this.dot(this.grad3[gi3], x3, y3, z3);

    return 32 * (n0 + n1 + n2 + n3);
  }
}
