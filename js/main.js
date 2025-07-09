import WatercolorAnimation from './animation.js';
import { hexToRgb, rgbStringToRgb, hslStringToRgb, rgbToHex, rgbToHsl } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM要素の取得 ---
  const colorFormat = document.getElementById('colorFormat');
  const colorInput = document.getElementById('colorInput');
  const applyBtn = document.getElementById('applyBtn');
  const copyIcons = document.querySelectorAll('.icon-copy');

  // --- アニメーションの初期化 ---
  const backgroundCanvas = document.getElementById('backgroundCanvas');
  const containerCanvas = document.getElementById('containerCanvas');

  // 背景アニメーションは即時開始
  const bgAnimation = new WatercolorAnimation(backgroundCanvas, true);
  bgAnimation.start();

  // コンテナアニメーションは後で初期化するため、変数を準備
  let containerAnimation = null;

  // --- UI更新関数 ---
  function updatePlaceholder() {
    const placeholders = {
      hex: '336699',
      rgb: '255,128,0',
      hsl: '180,50,60',
    };
    colorInput.placeholder = placeholders[colorFormat.value] || '';
  }

  function parseInputToRGB(input, format) {
    if (!input) return null;
    switch (format) {
      case 'hex': return hexToRgb(input.trim());
      case 'rgb': return rgbStringToRgb(input.trim());
      case 'hsl': return hslStringToRgb(input.trim());
      default: return null;
    }
  }

  // --- メイン処理 ---
  function applyColor() {
    const format = colorFormat.value;
    const inputVal = colorInput.value;
    const rgb = parseInputToRGB(inputVal, format);

    if (rgb) {
      const newColor = [rgb.r, rgb.g, rgb.b];

      // 背景アニメーションの色を更新
      bgAnimation.updateColor(newColor);

      // コンテナアニメーションを初回クリック時に初期化＆開始
      if (!containerAnimation) {
        containerAnimation = new WatercolorAnimation(containerCanvas, false);
        containerAnimation.start();
      }
      containerAnimation.updateColor(newColor);

      // 出力値を表示
      document.getElementById('outputHex').textContent = rgbToHex(rgb.r, rgb.g, rgb.b);
      document.getElementById('outputRGB').textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      document.getElementById('outputHSL').textContent = rgbToHsl(rgb.r, rgb.g, rgb.b);

      // 出力ブロックの表示を切り替え
      document.getElementById('lineHex').style.display = format === 'hex' ? 'none' : 'block';
      document.getElementById('lineRGB').style.display = format === 'rgb' ? 'none' : 'block';
      document.getElementById('lineHSL').style.display = format === 'hsl' ? 'none' : 'block';
    } else {
      alert('入力形式が正しくありません。選択した形式に合わせて入力してください。');
    }
  }

  // --- イベントリスナーの設定 ---
  applyBtn.addEventListener('click', applyColor);

  colorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      applyBtn.click();
    }
  });

  colorFormat.addEventListener('change', () => {
    updatePlaceholder();
    colorInput.value = '';
  });

  // クリップボードへのコピー機能
  copyIcons.forEach(icon => {
    icon.addEventListener('click', async (e) => {
      const outputSpan = e.target.previousElementSibling;
      const textToCopy = outputSpan.textContent;

      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);

        // アイコンを一時的に変更
        e.target.classList.remove('bi-copy');
        e.target.classList.add('bi-check-square-fill');

        setTimeout(() => {
          e.target.classList.remove('bi-check-square-fill');
          e.target.classList.add('bi-copy');
        }, 1500); // 1.5秒後に元に戻す

      } catch (err) {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('コピーに失敗しました。');
      }
    });
  });

  // --- 初期化処理 ---
  updatePlaceholder();
});