// Known NBA player Hebrew names (Israeli sports journalism spellings)
const PLAYER_DICT = {
  // OKC Thunder
  'Shai Gilgeous-Alexander': "שיי גילג'אס-אלכסנדר",
  'Chet Holmgren':           "צ'ט הולמגרן",
  'Jalen Williams':          "ג'יילן וויליאמס",
  'Lu Dort':                 'לו דורט',
  'Isaiah Hartenstein':      'ישעיהו הרטנשטיין',
  'Alex Caruso':             'אלכס קארוסו',
  'Isaiah Joe':              "ישעיהו ג'ו",
  'Aaron Wiggins':           'אהרון ויגינס',
  'Kenrich Williams':        "קנריץ' וויליאמס",

  // Boston Celtics
  'Jayson Tatum':       "ג'ייסון טייטום",
  'Jaylen Brown':       "ג'יילן בראון",
  'Kristaps Porzingis': 'קריסטפס פורזינגיס',
  'Jrue Holiday':       "ג'רו הולידי",
  'Al Horford':         'אל הורפורד',
  'Derrick White':      'דריק וויט',
  'Payton Pritchard':   "פייטון פריצ'רד",
  'Sam Hauser':         'סם האוזר',
  'Luke Kornet':        'לוק קורנט',

  // Cleveland Cavaliers
  'Donovan Mitchell': 'דונובן מיטשל',
  'Darius Garland':   'דריוס גארלנד',
  'Evan Mobley':      'אוון מובלי',
  'Jarrett Allen':    "ג'ארט אלן",
  'Max Strus':        'מקס סטראוס',
  'Caris LeVert':     'קאריס לוורט',
  'Isaac Okoro':      'אייזק אוקורו',
  'Dean Wade':        'דין ויד',
  'Georges Niang':    "ג'ורג' ניאנג",
  'Craig Porter':     "קרייג פורטר",

  // New York Knicks
  'Jalen Brunson':      "ג'יילן ברונסון",
  'Karl-Anthony Towns': 'קארל-אנתוני טאונס',
  'OG Anunoby':         "OG אנונובי",
  'Josh Hart':          "ג'וש הארט",
  'Mikal Bridges':      "מיקאל ברידג'ס",
  'Miles McBride':      "מיילס מקברייד",
  'Precious Achiuwa':   'פרשייס אציואה',
  'Mitchell Robinson':  'מיטשל רובינסון',
  'Donte DiVincenzo':   "דונטה דיבינצ'נזו",

  // Denver Nuggets
  'Nikola Jokic':         "ניקולה יוקיץ'",
  'Jamal Murray':         "ג'מאל מארי",
  'Michael Porter Jr.':   "מייקל פורטר ג'וניור",
  'Michael Porter':       "מייקל פורטר",
  'Aaron Gordon':         'אהרון גורדון',
  'Kentavious Caldwell-Pope': 'קנטביוס קולדוול-פופ',
  'Reggie Jackson':       "רג'י ג'קסון",
  'Christian Braun':      'כריסטיאן בראון',
  'Peyton Watson':        'פייטון ווטסון',
  'Julian Strawther':     "ג'וליאן סטרות'ר",
  'Zeke Nnaji':           "זיק נאג'י",

  // Houston Rockets
  'Alperen Sengun':    'אלפרן סנגון',
  'Jalen Green':       "ג'יילן גרין",
  'Fred VanVleet':     'פרד ואנבליט',
  'Dillon Brooks':     'דילון ברוקס',
  'Amen Thompson':     'איימן תומפסון',
  'Jabari Smith Jr.':  "ג'אבארי סמית' ג'וניור",
  'Jabari Smith':      "ג'אבארי סמית'",
  'Tari Eason':        'טארי איסון',
  'Steven Adams':      'סטיבן אדמס',
  'Aaron Holiday':     'אהרון הולידי',
  'Cam Whitmore':      'קאם ווייטמור',

  // Minnesota Timberwolves
  'Anthony Edwards':        'אנתוני אדוורדס',
  'Rudy Gobert':            'רודי גובר',
  'Mike Conley':            'מייק קונלי',
  'Naz Reid':               'נאז ריד',
  'Jaden McDaniels':        "ג'יידן מקדניאלס",
  'Monte Morris':           'מונטה מוריס',
  'Kyle Anderson':          'קייל אנדרסון',
  'Rob Dillingham':         'רוב דילינגהאם',
  'Nickeil Alexander-Walker': "ניקייל אלכסנדר-ווקר",

  // LA Lakers
  'LeBron James':      "לברון ג'יימס",
  'Anthony Davis':     'אנתוני דייויס',
  'Austin Reaves':     'אוסטין ריבס',
  "D'Angelo Russell":  "ד'אנג'לו ראסל",
  'Rui Hachimura':     'ריוי האצ\'ימורה',
  'Gabe Vincent':      'גייב וינסנט',
  'Dorian Finney-Smith': "דוריאן פיני-סמית'",
  'Christian Wood':    'כריסטיאן ווד',
  'Bronny James':      "ברוני ג'יימס",

  // Golden State Warriors
  'Stephen Curry':      'סטפן קארי',
  'Draymond Green':     'דריימונד גרין',
  'Klay Thompson':      'קליי תומפסון',
  'Andrew Wiggins':     'אנדרו ויגינס',
  'Jonathan Kuminga':   "ג'ונתן קומינגה",
  'Moses Moody':        'משה מודי',
  'Brandin Podziemski': 'ברנדין פודזיאמסקי',
  'Kevon Looney':       'קיבון לוני',
  'Gary Payton II':     'גרי פייטון II',

  // Phoenix Suns
  'Kevin Durant':  'קווין דיורנט',
  'Devin Booker':  'דווין בוקר',
  'Bradley Beal':  'ברדלי ביל',
  'Jusuf Nurkic':  "יוסוף נורקיץ'",
  'Grayson Allen': 'גריסון אלן',
  'Eric Gordon':   'אריק גורדון',
  'Drew Eubanks':  'דרו יובנקס',
  'Bol Bol':       'בול בול',

  // LA Clippers
  'James Harden':     "ג'יימס הארדן",
  'Kawhi Leonard':    'קוויי לאונרד',
  'Paul George':      "פול ג'ורג'",
  'Ivica Zubac':      "איביצה זובאץ'",
  'Norman Powell':    'נורמן פאוול',
  'Russell Westbrook':'ראסל ווסטברוק',
  'Terance Mann':     'טרנס מאן',
  'James Harden':     "ג'יימס הארדן",

  // Detroit Pistons
  'Cade Cunningham':   'קייד קאנינגהאם',
  'Jaden Ivey':        "ג'יידן אייבי",
  'Bojan Bogdanovic':  "בויאן בוגדנוביץ'",
  'Isaiah Stewart':    'ישעיהו סטיוארט',
  'Ausar Thompson':    'אוסאר תומפסון',
  'Marcus Sasser':     'מרקוס סאסר',
  'Simone Fontecchio': 'סימונה פונטקיו',
  'James Wiseman':     "ג'יימס ווייסמן",
  'Killian Hayes':     'קיליאן הייז',

  // Orlando Magic
  'Paolo Banchero':     "פאולו בנצ'רו",
  'Franz Wagner':       'פרנץ ואגנר',
  'Wendell Carter Jr.': "וונדל קארטר ג'וניור",
  'Wendell Carter':     'וונדל קארטר',
  'Cole Anthony':       'קול אנתוני',
  'Markelle Fultz':     'מרקל פולץ',
  'Jalen Suggs':        "ג'יילן סאגס",
  'Moritz Wagner':      'מוריץ ואגנר',
  'Gary Harris':        'גרי האריס',

  // Philadelphia 76ers
  'Joel Embiid':        "ג'ואל אמביד",
  'Tyrese Maxey':       'טיריס מקסי',
  'Kelly Oubre Jr.':    "קלי אורה ג'וניור",
  'Kelly Oubre':        'קלי אורה',
  'Tobias Harris':      'טוביאס האריס',
  'Kyle Lowry':         'קייל לאורי',
  'Nicolas Batum':      'ניקולא בטום',
  'Mo Bamba':           'מו במבה',
  'Patrick Beverley':   'פטריק ביברלי',
  'De\'Anthony Melton': "דה'אנתוני מלטון",

  // Miami Heat
  'Bam Adebayo':      'באם אדבאיו',
  'Tyler Herro':      'טיילר הירו',
  'Jimmy Butler':     "ג'ימי באטלר",
  'Terry Rozier':     'טרי רוזיאר',
  'Duncan Robinson':  'דאנקן רובינסון',
  'Nikola Jovic':     "ניקולה יוביץ'",
  'Caleb Martin':     'קייב מרטין',
  'Thomas Bryant':    "תומאס בריאנט",
  'Haywood Highsmith': "הייווד הייסמית'",

  // San Antonio Spurs
  'Victor Wembanyama': 'ויקטור וומבניאמה',
  'Keldon Johnson':    "קלדון ג'ונסון",
  'Devin Vassell':     'דווין וסל',
  'Jeremy Sochan':     "ג'רמי סושאן",
  'Chris Paul':        'כריס פול',
  'Stephon Castle':    "סטפון קאסל",
  'Zach Collins':      'זאק קולינס',
  'Tre Jones':         "טרה ג'ונס",
  'Charles Bassey':    'צ\'ארלס בייסי',

  // Atlanta Hawks
  'Trae Young':        'טריי יאנג',
  'Dejounte Murray':   "דז'ואנטה מארי",
  'Clint Capela':      'קלינט קפלה',
  "De'Andre Hunter":   "דה'אנדרה האנטר",
  'Bogdan Bogdanovic': "בוגדן בוגדנוביץ'",
  'Onyeka Okongwu':    'אוניקה אוקונגוו',
  'Saddiq Bey':        'סאדיק ביי',
  'Larry Nance Jr.':   "לארי ננס ג'וניור",
  'Patty Mills':       'פאטי מילס',
  'Dyson Daniels':     'דייסון דניאלס',

  // Toronto Raptors
  'Scottie Barnes':   'סקוטי בארנס',
  'RJ Barrett':       "RJ בארט",
  'Jakob Poeltl':     'יאקוב פאלטל',
  'Gary Trent Jr.':   "גרי טרנט ג'וניור",
  'Gary Trent':       'גרי טרנט',
  'Immanuel Quickley':'עמנואל קוויקלי',
  'Gradey Dick':      'גריידי דיק',
  'Bruce Brown':      'ברוס בראון',
  'Pascal Siakam':    'פסקל סיאקם',
  'Chris Boucher':    "כריס בושה",

  // Portland Trail Blazers
  'Scoot Henderson':   'סקוט הנדרסון',
  'Anfernee Simons':   'אנפרני סיימונס',
  'Jerami Grant':      "ג'רמי גראנט",
  'Deandre Ayton':     "דיאנדרי אייטון",
  'Toumani Camara':    'טומאני קמארה',
  'Matisse Thybulle':  "מאטיס ת'יבול",
  'Jabari Walker':     "ג'אבארי ווקר",
  'Shaedon Sharpe':    'שיידון שארפ',
  'Robert Williams':   'רוברט וויליאמס',

  // Charlotte Hornets
  'LaMelo Ball':    "לה'מלו בול",
  'Brandon Miller': 'ברנדון מילר',
  'Miles Bridges':  "מיילס ברידג'ס",
  'Mark Williams':  'מארק וויליאמס',
  'Nick Richards':  "ניק ריצ'רדס",
  'Grant Williams': 'גראנט וויליאמס',
  'Tre Mann':       'טרה מאן',
  'Seth Curry':     'סת קארי',

  // Indiana Pacers
  'Tyrese Haliburton':  'טיריס הליברטון',
  'Myles Turner':       'מיילס טרנר',
  'Bennedict Mathurin': "בנדיקט מת'ורין",
  'Andrew Nembhard':    'אנדרו נמבהארד',
  'Obi Toppin':         'אובי טופין',
  'TJ McConnell':       'TJ מקונל',
  'T.J. McConnell':     'TJ מקונל',
  'James Johnson':      "ג'יימס ג'ונסון",
  'Isaiah Jackson':     "ישעיהו ג'קסון",

  // Milwaukee Bucks
  'Giannis Antetokounmpo': 'יאניס אנטטוקונמפו',
  'Damian Lillard':         'דמיאן ליארד',
  'Khris Middleton':        'כריס מידלטון',
  'Brook Lopez':            'ברוק לופז',
  'Bobby Portis':           "בובי פורטיס",
  'Pat Connaughton':        "פט קונוטון",
  'Malik Beasley':          'מאליק ביסלי',
  'MarJon Beauchamp':       "מארג'ון בושאמפ",
  'Taurean Prince':         "טוריאן פרינס",

  // Dallas Mavericks
  'Kyrie Irving':     'קיירי אירווינג',
  'Luka Doncic':      "לוקה דונצ'יץ'",
  'PJ Washington':    "PJ ווושינגטון",
  'Dereck Lively II': 'דרק ליבלי',
  'Daniel Gafford':   'דניאל גאפורד',
  'Quentin Grimes':   'קווינטין גריימס',
  'Spencer Dinwiddie': 'ספנסר דינווידי',
  'Maxi Kleber':      'מקסי קלבר',
  'Josh Green':       "ג'וש גרין",

  // Memphis Grizzlies
  'Ja Morant':           "ג'ה מוראנט",
  'Jaren Jackson Jr.':   "ג'ארן ג'קסון ג'וניור",
  'Jaren Jackson':       "ג'ארן ג'קסון",
  'Desmond Bane':        'דזמונד ביין',
  'Marcus Smart':        'מרקוס סמארט',
  'GG Jackson':          "GG ג'קסון",
  'Vince Williams Jr.':  "וינס וויליאמס ג'וניור",
  'Ziaire Williams':     'זיאיר וויליאמס',
  'Santi Aldama':        'סנטי אלדאמה',

  // New Orleans Pelicans
  'Brandon Ingram':      'ברנדון אינגרם',
  'Zion Williamson':     'זיון ווליאמסון',
  'CJ McCollum':         "CJ מקולום",
  'Herb Jones':          "הרב ג'ונס",
  'Jonas Valanciunas':   "יונאס ולנצ'יונאס",
  'Trey Murphy III':     'טריי מרפי',
  'Trey Murphy':         'טריי מרפי',
  'Naji Marshall':       "נאג'י מארשל",
  'Jose Alvarado':       "חוזה אלברדו",

  // Sacramento Kings
  'Domantas Sabonis':  'דומנטס סבוניס',
  "De'Aaron Fox":      "דה'ארון פוקס",
  'Kevin Huerter':     'קווין יורטר',
  'Harrison Barnes':   'האריסון בארנס',
  'Malik Monk':        'מאליק מונק',
  'Keegan Murray':     'קיגן מארי',
  'Davion Mitchell':   'דביון מיטשל',
  'Alex Len':          'אלכס לן',

  // Chicago Bulls
  'Zach LaVine':       'זאק לאוין',
  'Nikola Vucevic':    "ניקולה ווצ'ביץ'",
  'Coby White':        'קובי ווייט',
  'Patrick Williams':  'פטריק וויליאמס',
  'DeMar DeRozan':     'דמאר דרוזן',
  'Ayo Dosunmu':       'אייו דוסונמו',
  'Torrey Craig':      "טורי קרייג",
  'Andre Drummond':    'אנדרה דראמונד',

  // Utah Jazz
  'Lauri Markkanen':  'לאורי מארקנן',
  'Walker Kessler':   'ווקר קסלר',
  'Collin Sexton':    'קולין סקסטון',
  'John Collins':     "ג'ון קולינס",
  'Keyonte George':   "קיאונטה ג'ורג'",
  'Jordan Clarkson':  "ג'ורדן קלארקסון",
  'Kris Dunn':        'קריס דאן',
  'Taylor Hendricks': 'טיילור הנדריקס',
};

/* ── Normalization: strip diacritics + lowercase ─────────────
 * Handles ESPN returning "Nikola Jokić" vs dict key "Nikola Jokic"
 * ─────────────────────────────────────────────────────────── */
function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // remove accent marks
    .replace(/[čćž]/gi, (c) => ({ č:'c', ć:'c', ž:'z', Č:'c', Ć:'c', Ž:'z' }[c] || c))
    .replace(/[šŠ]/g, 's')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim();
}

// Pre-build normalized lookup at module load
const DICT_NORM = {};
for (const [en, he] of Object.entries(PLAYER_DICT)) {
  DICT_NORM[normalize(en)] = he;
}

/* ── Phonetic fallback for unknown players ─────────────────── */
const DIGRAPHS = {
  ay: 'יי', ee: 'י',  ea: 'י',  oo: 'ו',
  ou: 'או', oa: 'ו',  oi: 'וי', au: 'או',
  sh: 'ש',  ch: "צ'", th: 'ת',  ph: 'פ',
  ck: 'ק',  gh: '',   qu: 'קו', ng: 'נג',
  kn: 'נ',  wr: 'ר',  wh: 'ו',  ie: 'י',
};
const CHARS = {
  a: 'א', b: 'ב', c: 'ק', d: 'ד',
  e: 'א', f: 'פ', g: 'ג', h: 'ה',
  i: 'י', j: "ג'",k: 'ק', l: 'ל',
  m: 'מ', n: 'נ', o: 'ו', p: 'פ',
  q: 'ק', r: 'ר', s: 'ס', t: 'ט',
  u: 'ו', v: 'ו', w: 'ו', x: 'קס',
  y: 'י', z: 'ז',
};

function transliterateWord(word) {
  const lower = normalize(word);
  let result = '';
  let i = 0;
  while (i < lower.length) {
    const two = lower.slice(i, i + 2);
    if (DIGRAPHS[two] !== undefined) { result += DIGRAPHS[two]; i += 2; continue; }
    const ch = lower[i];
    if (ch === 'e' && i === lower.length - 1) { i++; continue; } // silent trailing e
    result += CHARS[ch] ?? '';
    i++;
  }
  return result;
}

/* ── Main export ──────────────────────────────────────────── */
export function transliterateToHebrew(fullName) {
  if (!fullName) return '';

  // 1. Exact match (after normalization)
  const norm = normalize(fullName);
  if (DICT_NORM[norm]) return DICT_NORM[norm];

  // 2. Try without suffix like "Jr." / "II" / "III"
  const stripped = norm.replace(/\s+(jr\.?|sr\.?|ii|iii|iv)$/i, '').trim();
  if (stripped !== norm && DICT_NORM[stripped]) return DICT_NORM[stripped];

  // 3. Fallback: transliterate word by word
  return fullName
    .split(/\s+/)
    .map(transliterateWord)
    .join(' ')
    .trim();
}
