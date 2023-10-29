function hexToRgb(hex) {
  // Elimina el carácter '#' si está presente
  hex = hex.replace(/^#/, '');

  // Divide el color en componentes r, g y b
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Retorna el valor en el formato RGB
  return {r : r, g : g, b : b};
}
function rgbToHex(r, g, b) {
  // Asegúrate de que los valores estén en el rango de 0 a 255
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Convierte los componentes r, g y b a sus valores hexadecimales y concaténalos
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');

  // Retorna el valor en el formato hexadecimal
  return `#${hexR}${hexG}${hexB}`;
}
function rgbToHsl(r, g, b) {
  // Asegúrate de que los valores estén en el rango de 0 a 255
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  // Normaliza los valores de los componentes a un rango de 0 a 1
  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  // Calcula el valor máximo y mínimo de los componentes
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);

  // Calcula la luminosidad (lightness)
  const lightness = (max + min) / 2;

  // Inicializa las variables de saturación (saturation) y matiz (hue)
  let saturation = 0;
  let hue = 0;

  if (max !== min) {
    // Calcula la saturación
    if (lightness < 0.5) {
      saturation = (max - min) / (max + min);
    } else {
      saturation = (max - min) / (2 - max - min);
    }

    // Calcula el matiz (hue)
    if (max === normalizedR) {
      hue = (normalizedG - normalizedB) / (max - min);
    } else if (max === normalizedG) {
      hue = 2 + (normalizedB - normalizedR) / (max - min);
    } else {
      hue = 4 + (normalizedR - normalizedG) / (max - min);
    }

    // Convierte el matiz a grados entre 0 y 360
    hue *= 60;
    if (hue < 0) {
      hue += 360;
    }
  }

  // Devuelve el valor en formato HSL como un arreglo [h, s, l]
  return [hue, saturation * 100, lightness * 100];
}

function hslToHex(h, s, l) {
  // Asegúrate de que los valores estén en el rango adecuado
  h = (h % 360 + 360) % 360; // Ajusta el matiz a un valor entre 0 y 360
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  // Convierte la saturación y luminosidad a fracciones
  s /= 100;
  l /= 100;

  // Calcula la cromacidad
  const c = (1 - Math.abs(2 * l - 1)) * s;

  // Calcula el ángulo del matiz en el círculo cromático
  const hPrime = h / 60;

  // Calcula valores intermedios
  const x = c * (1 - Math.abs(hPrime % 2 - 1));
  const m = l - c / 2;

  // Calcula los componentes RGB temporales
  let rTemp, gTemp, bTemp;
  if (hPrime >= 0 && hPrime < 1) {
    rTemp = c;
    gTemp = x;
    bTemp = 0;
  } else if (hPrime >= 1 && hPrime < 2) {
    rTemp = x;
    gTemp = c;
    bTemp = 0;
  } else if (hPrime >= 2 && hPrime < 3) {
    rTemp = 0;
    gTemp = c;
    bTemp = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    rTemp = 0;
    gTemp = x;
    bTemp = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    rTemp = x;
    gTemp = 0;
    bTemp = c;
  } else {
    rTemp = c;
    gTemp = 0;
    bTemp = x;
  }

  // Convierte los componentes RGB temporales a valores entre 0 y 1
  const r = (rTemp + m) * 255;
  const g = (gTemp + m) * 255;
  const b = (bTemp + m) * 255;

  // Convierte los componentes a valores hexadecimales y concaténalos
  const hexR = Math.round(r).toString(16).padStart(2, '0');
  const hexG = Math.round(g).toString(16).padStart(2, '0');
  const hexB = Math.round(b).toString(16).padStart(2, '0');

  // Retorna el valor en formato hexadecimal
  return `#${hexR}${hexG}${hexB}`;
}
function calculateComplementaryHSL(h, s, l) {
  // Asegúrate de que los valores estén en el rango de 0 a 360 para h y 0 a 100 para s y l
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  // Calcula el color complementario ajustando el valor de h en 180 grados
  const complementaryHue = (h + 180) % 360;

  // Si el color es completamente desaturado, invierte la luminosidad
  let complementaryLuminance = l;
  if (s === 0) {
    complementaryLuminance = 100 - l;
  }

  // Devuelve el color complementario en formato [h, s, l]
  return [complementaryHue, s, complementaryLuminance];
}
function hslToRgb(h, s, l) {
  // Asegúrate de que los valores estén en el rango de 0 a 360 para h y 0 a 100 para s y l
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s));
  l = Math.max(0, Math.min(100, l));

  // Normaliza la saturación y la luminosidad a valores entre 0 y 1
  s = s / 100;
  l = l / 100;

  // Calcula los componentes RGB
  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r, g, b;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return { r, g, b };
}
function hexToHSL(hex) {
  // Eliminar el símbolo "#" si está presente en el color hexadecimal
  hex = hex.replace("#", "");

  // Convertir los valores hexadecimales a decimales
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Calcular los valores de HSL
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // Los tonos y la saturación son 0 para los grises
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  // Devolver HSL en formato [h, s, l]
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}