function createInput(label, id, min, max) {
  return `
    <label>${label}: <span id="${id}_value">0</span></label>
    <input type="range" id="${id}" min="${min}" max="${max}" value="0" oninput="updateColor()">
  `;
}

function updateInputs() {
  const mode = document.getElementById('mode').value;
  const container = document.getElementById('inputs');

  if (mode === 'rgb') {
    container.innerHTML =
      createInput('Vermelho', 'r', 0, 255) +
      createInput('Verde', 'g', 0, 255) +
      createInput('Azul', 'b', 0, 255);
  }
  else if (mode === 'cmyk') {
    container.innerHTML =
      createInput('Ciano', 'c', 0, 100) +
      createInput('Magenta', 'm', 0, 100) +
      createInput('Amarelo', 'y', 0, 100) +
      createInput('Preto', 'k', 0, 100);
  }
  else if (mode === 'hsl') {
    container.innerHTML =
      createInput('Matiz', 'h', 0, 360) +
      createInput('Saturação', 's', 0, 100) +
      createInput('Luminosidade', 'l', 0, 100);
  }
  else if (mode === 'hsv') {
    container.innerHTML =
      createInput('Matiz', 'h', 0, 360) +
      createInput('Saturação', 's', 0, 100) +
      createInput('Valor', 'v', 0, 100);
  }

  updateColor();
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

function cmykToRgb(c, m, y, k) {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return [
    Math.round(255 * (1 - c) * (1 - k)),
    Math.round(255 * (1 - m) * (1 - k)),
    Math.round(255 * (1 - y) * (1 - k))
  ];
}

function rgbToCmyk(r, g, b) {
  let c = 1 - (r / 255);
  let m = 1 - (g / 255);
  let y = 1 - (b / 255);

  let k = Math.min(c, m, y);

  c = (c - k) / (1 - k) || 0;
  m = (m - k) / (1 - k) || 0;
  y = (y - k) / (1 - k) || 0;

  return [
    Math.round(c * 100),
    Math.round(m * 100),
    Math.round(y * 100),
    Math.round(k * 100)
  ];
}

function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
}

function hsvToRgb(h, s, v) {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = Math.max(r, g, b), min = Math.min(r, g, b);
  let d = max - min;
  let h, s = max === 0 ? 0 : d / max, v = max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }

  return [Math.round(h), Math.round(s * 100), Math.round(v * 100)];
}

function updateColor() {
  const inputs = document.querySelectorAll('input[type=\"range\"]');
  inputs.forEach(input => {
    const span = document.getElementById(input.id + '_value');
    if (span) span.innerText = input.value;
  });

  const mode = document.getElementById('mode').value;
  let r = 0, g = 0, b = 0;

  if (mode === 'rgb') {
    r = +document.getElementById('r').value;
    g = +document.getElementById('g').value;
    b = +document.getElementById('b').value;
  }
  else if (mode === 'cmyk') {
    [r, g, b] = cmykToRgb(
      +document.getElementById('c').value,
      +document.getElementById('m').value,
      +document.getElementById('y').value,
      +document.getElementById('k').value
    );
  }
  else if (mode === 'hsl') {
    [r, g, b] = hslToRgb(
      +document.getElementById('h').value,
      +document.getElementById('s').value,
      +document.getElementById('l').value
    );
  }
  else if (mode === 'hsv') {
    [r, g, b] = hsvToRgb(
      +document.getElementById('h').value,
      +document.getElementById('s').value,
      +document.getElementById('v').value
    );
  }

  const hex = rgbToHex(r, g, b);
  document.getElementById('colorBox').style.background = hex;
  document.getElementById('hexValue').innerText = hex;

  const [c, m, y, k] = rgbToCmyk(r, g, b);
  const [hh, ss, ll] = rgbToHsl(r, g, b);
  const [h2, s2, v2] = rgbToHsv(r, g, b);

  let html = '';

  if (mode !== 'rgb') {
    html += '<div><b>RGB:</b></div>' +
      '<div>Vermelho: ' + r + '</div>' +
      '<div>Verde: ' + g + '</div>' +
      '<div>Azul: ' + b + '</div><br>';
  }

  if (mode !== 'cmyk') {
    html += '<div><b>CMYK:</b></div>' +
      '<div>Ciano: ' + c + '%</div>' +
      '<div>Magenta: ' + m + '%</div>' +
      '<div>Amarelo: ' + y + '%</div>' +
      '<div>Preto: ' + k + '%</div><br>';
  }

  if (mode !== 'hsl') {
    html += '<div><b>HSL:</b></div>' +
      '<div>Matiz: ' + hh + '</div>' +
      '<div>Saturação: ' + ss + '%</div>' +
      '<div>Luminosidade: ' + ll + '%</div><br>';
  }

  if (mode !== 'hsv') {
    html += '<div><b>HSV:</b></div>' +
      '<div>Matiz: ' + h2 + '</div>' +
      '<div>Saturação: ' + s2 + '%</div>' +
      '<div>Valor: ' + v2 + '%</div>';
  }

  document.getElementById('results').innerHTML = html;
}

updateInputs();