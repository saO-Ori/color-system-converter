/**
 * 水彩アニメーションクラス
 */
export default class WatercolorAnimation {
  constructor(canvas, isBackground = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.isBackground = isBackground;
    this.currentColor = [245, 245, 245];
    this.targetColor = [245, 245, 245];
    this.blobs = [];
    this.animationId = null;

    this.resize();
    this.init();
    // アニメーションの自動開始は呼び出し元に任せる
    // this.animate(); 

    window.addEventListener('resize', () => {
      this.resize();
      this.init();
    });
  }

  resize() {
    if (this.isBackground) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    } else {
      const container = document.querySelector('.container');
      this.canvas.width = container.offsetWidth;
      this.canvas.height = container.offsetHeight;
    }
  }

  init() {
    this.blobs = [];
    const numBlobs = this.isBackground ? 15 : 10;
    for (let i = 0; i < numBlobs; i++) {
      this.blobs.push(this.createBlob(this.currentColor));
    }
  }

  createBlob(color) {
    const age = Math.random() * 10000;
    const centerBias = this.isBackground ? 1 : 0.3;
    const x = this.canvas.width / 2 + (Math.random() - 0.5) * this.canvas.width * centerBias;
    const y = this.canvas.height / 2 + (Math.random() - 0.5) * this.canvas.height * centerBias;

    return {
      x, y,
      vx: this.isBackground ? (x - this.canvas.width / 2) * 0.001 : (Math.random() - 0.5) * 0.8,
      vy: this.isBackground ? (y - this.canvas.height / 2) * 0.001 : (Math.random() - 0.5) * 0.8,
      radius: Math.random() * (this.isBackground ? 125 : 75) + (this.isBackground ? 50 : 35),
      opacity: Math.random() * 0.5 + 0.2,
      phase: Math.random() * Math.PI * 2,
      color: [...color],
      birthTime: Date.now() - age,
      shapePoints: 18 + Math.floor(Math.random() * 8)
    };
  }

  updateColor(newColor) {
    this.targetColor = [...newColor];
    for (let i = 0; i < 8; i++) {
      const blob = this.createBlob(newColor);
      blob.opacity = 0.6 + Math.random() * 0.4;
      blob.radius *= 1.2;
      blob.vx *= 0.2;
      blob.vy *= 0.2;
      this.blobs.push(blob);
    }
  }

  animate() {
    this.ctx.fillStyle = `rgba(${this.currentColor[0]}, ${this.currentColor[1]}, ${this.currentColor[2]}, 0.5)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < 3; i++) {
      this.currentColor[i] += (this.targetColor[i] - this.currentColor[i]) * 0.02;
    }

    if (this.isBackground) {
      document.body.style.backgroundColor = `rgb(${Math.floor(this.currentColor[0])}, ${Math.floor(this.currentColor[1])}, ${Math.floor(this.currentColor[2])})`;
    }

    this.blobs.forEach((blob, index) => {
      const age = Date.now() - blob.birthTime;
      blob.x += blob.vx + Math.sin(blob.phase + age * 0.0005) * 0.5;
      blob.y += blob.vy + Math.cos(blob.phase + age * 0.0005) * 0.5;

      if (blob.x < -blob.radius) blob.x = this.canvas.width + blob.radius;
      if (blob.x > this.canvas.width + blob.radius) blob.x = -blob.radius;
      if (blob.y < -blob.radius) blob.y = this.canvas.height + blob.radius;
      if (blob.y > this.canvas.height + blob.radius) blob.y = -blob.radius;

      const maxAge = 15000;
      if (age > maxAge) {
        blob.opacity = Math.max(0, blob.opacity - 0.005);
      }

      this.drawBlob(blob);

      if (blob.opacity <= 0) {
        this.blobs.splice(index, 1);
      }
    });

    if (this.blobs.length < (this.isBackground ? 15 : 10)) {
      this.blobs.push(this.createBlob(this.currentColor));
    }

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  drawBlob(blob) {
    const age = Date.now() - blob.birthTime;
    const gradient = this.ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
    const centerColor = `rgba(${Math.floor(blob.color[0])}, ${Math.floor(blob.color[1])}, ${Math.floor(blob.color[2])}, ${blob.opacity * 0.5})`;
    const edgeColor = `rgba(${Math.floor(blob.color[0])}, ${Math.floor(blob.color[1])}, ${Math.floor(blob.color[2])}, 0)`;

    gradient.addColorStop(0, centerColor);
    gradient.addColorStop(1, edgeColor);

    this.ctx.globalCompositeOperation = 'lighter';
    this.ctx.fillStyle = gradient;

    this.ctx.beginPath();
    const points = blob.shapePoints;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const phase = age * 0.0003;
      const r = blob.radius * (1 + Math.sin(angle * 3 + phase + blob.phase) * 0.15);
      const x = blob.x + Math.cos(angle) * r;
      const y = blob.y + Math.sin(angle) * r;
      if (i === 0) this.ctx.moveTo(x, y);
      else this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.globalCompositeOperation = 'source-over';
  }

  // アニメーションを開始するためのメソッド
  start() {
    if (!this.animationId) {
      this.animate();
    }
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}