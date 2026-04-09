// Phonetic English → Hebrew transliteration for NBA player names.
// Not perfect, but covers most common English/European phonemes.

const DIGRAPHS = {
  sh: 'ש', ch: "צ'", th: 'ת', ph: 'פ',
  ck: 'ק', gh: '',   qu: 'קו', ng: 'נג',
  kn: 'נ', wr: 'ר',  wh: 'ו',
};

const CHARS = {
  a: 'א', b: 'ב', c: 'ק', d: 'ד',
  e: 'א', f: 'פ', g: 'ג', h: 'ה',
  i: 'י', j: "ג'", k: 'ק', l: 'ל',
  m: 'מ', n: 'נ', o: 'ו', p: 'פ',
  q: 'ק', r: 'ר', s: 'ס', t: 'ט',
  u: 'ו', v: 'ב', w: 'ו', x: 'קס',
  y: 'י', z: 'ז',
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

function transliterateWord(word) {
  const lower = word.toLowerCase();
  let result = '';
  let i = 0;

  while (i < lower.length) {
    const two = lower.slice(i, i + 2);
    if (DIGRAPHS[two] !== undefined) {
      result += DIGRAPHS[two];
      i += 2;
      continue;
    }

    const ch = lower[i];
    if (VOWELS.has(ch)) {
      // Skip silent trailing 'e'
      if (ch === 'e' && i === lower.length - 1) { i++; continue; }
      result += CHARS[ch] || '';
    } else {
      result += CHARS[ch] || ch;
    }
    i++;
  }

  return result;
}

export function transliterateToHebrew(fullName) {
  return fullName
    .split(' ')
    .map((w) => (w ? transliterateWord(w) : ''))
    .join(' ')
    .trim();
}
