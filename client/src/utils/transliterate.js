// Known NBA player Hebrew names (Israeli sports journalism standard spellings)
const PLAYER_DICT = {
  // OKC Thunder
  'Shai Gilgeous-Alexander': "שיי גילג'אס-אלכסנדר",
  'Chet Holmgren':           "צ'ט הולמגרן",
  'Jalen Williams':          "ג'יילן וויליאמס",
  'Lu Dort':                 'לו דורט',
  'Isaiah Hartenstein':      'ישעיהו הרטנשטיין',
  'Alex Caruso':             'אלכס קארוסו',
  'Isaiah Joe':              "ישעיהו ג'ו",
  'Kenrich Williams':        'קנריץ׳ וויליאמס',
  'Aaron Wiggins':           'אהרון ויגינס',

  // Boston Celtics
  'Jayson Tatum':      "ג'ייסון טייטום",
  'Jaylen Brown':      "ג'יילן בראון",
  'Kristaps Porzingis': 'קריסטפס פורזינגיס',
  'Jrue Holiday':      "ג'רו הולידי",
  'Al Horford':        'אל הורפורד',
  'Derrick White':     'דריק וויט',
  'Payton Pritchard':  'פייטון פריצ׳רד',
  'Sam Hauser':        'סם האוזר',

  // Cleveland Cavaliers
  'Donovan Mitchell': 'דונובן מיטשל',
  'Darius Garland':   'דריוס גארלנד',
  'Evan Mobley':      'אוון מובלי',
  'Jarrett Allen':    "ג'ארט אלן",
  'Max Strus':        'מקס סטראוס',
  'Caris LeVert':     'קאריס לווארט',
  'Isaac Okoro':      'אייזק אוקורו',
  'Dean Wade':        'דין ויד',
  'Sam Merrill':      'סם מריל',
  'Georges Niang':    "ג'ורג' ניאנג",

  // New York Knicks
  'Jalen Brunson':       "ג'יילן ברונסון",
  'Karl-Anthony Towns':  'קארל-אנתוני טאונס',
  'OG Anunoby':          'OG אנונובי',
  'Josh Hart':           "ג'וש הארט",
  'Mikal Bridges':       "מיקאל ברידג'ס",
  'Miles McBride':       "מיילס מקברייד",
  'Precious Achiuwa':    'פרשייס אציואה',
  'Mitchell Robinson':   'מיטשל רובינסון',

  // Denver Nuggets
  'Nikola Jokic':       "ניקולה יוקיץ'",
  'Jamal Murray':       "ג'מאל מארי",
  'Michael Porter Jr.': "מייקל פורטר ג'וניור",
  'Aaron Gordon':       'אהרון גורדון',
  'Kentavious Caldwell-Pope': 'קנטביוס קולדוול-פופ',
  'Reggie Jackson':     "רג'י ג'קסון",
  'Christian Braun':    'כריסטיאן בראון',
  'Peyton Watson':      'פייטון ווטסון',
  'Julian Strawther':   "ג'וליאן סטרותר",
  'Zeke Nnaji':         'זיק נאג׳י',

  // Houston Rockets
  'Alperen Sengun':   'אלפרן סנגון',
  'Jalen Green':      "ג'יילן גרין",
  'Fred VanVleet':    'פרד ואנבליט',
  'Dillon Brooks':    "דילון ברוקס",
  'Amen Thompson':    'איימן תומפסון',
  'Jabari Smith Jr.': "ג'באר סמית' ג'וניור",
  'Tari Eason':       'טארי איסון',
  'Steven Adams':     'סטיבן אדמס',
  'Aaron Holiday':    'אהרון הולידי',

  // Minnesota Timberwolves
  'Anthony Edwards': 'אנתוני אדוורדס',
  'Rudy Gobert':     'רודי גובר',
  'Mike Conley':     'מייק קונלי',
  'Naz Reid':        'נאז ריד',
  'Jaden McDaniels': "ג'ייידן מקדניאלס",
  'Monte Morris':    'מונטה מוריס',
  'Kyle Anderson':   'קייל אנדרסון',
  'Rob Dillingham':  'רוב דילינגהאם',
  'Nickeil Alexander-Walker': "ניקייל אלכסנדר-ווקר",

  // LA Lakers
  'LeBron James':     "לברון ג'יימס",
  'Anthony Davis':    'אנתוני דייויס',
  'Austin Reaves':    'אוסטין ריבס',
  "D'Angelo Russell": "ד'אנג'לו ראסל",
  'Rui Hachimura':    'רואי האצ׳ימורה',
  'Gabe Vincent':     'גייב וינסנט',
  'Dorian Finney-Smith': 'דוריאן פיני-סמית׳',
  'Christian Wood':   'כריסטיאן ווד',
  'Cam Ham':          'קאם האם',

  // Golden State Warriors
  'Stephen Curry':  'סטפן קארי',
  'Draymond Green': 'דריימונד גרין',
  'Klay Thompson':  'קליי תומפסון',
  'Andrew Wiggins': 'אנדרו ויגינס',
  'Jonathan Kuminga': "ג'ונתן קומינגה",
  'Moses Moody':    'משה מודי',
  'Brandin Podziemski': 'ברנדין פודזיאמסקי',
  'Kevon Looney':   'קיבון לוני',

  // Phoenix Suns
  'Kevin Durant':   'קווין דיורנט',
  'Devin Booker':   'דווין בוקר',
  'Bradley Beal':   'ברדלי ביל',
  'Jusuf Nurkic':   "יוסוף נורקיץ'",
  'Grayson Allen':  'גריסון אלן',
  'Eric Gordon':    'אריק גורדון',
  'Drew Eubanks':   'דרו יובנקס',
  'Bol Bol':        'בול בול',

  // LA Clippers
  'James Harden':  "ג'יימס הארדן",
  'Kawhi Leonard': 'קוויי לאונרד',
  'Paul George':   'פול ג׳ורג׳',
  'Ivica Zubac':   'איביצה זובאץ',
  'Norman Powell': 'נורמן פאוול',
  'Russell Westbrook': 'ראסל ווסטברוק',
  'P.J. Tucker':   "P.J. טאקר",
  'Terance Mann':  'טרנס מאן',

  // Detroit Pistons
  'Cade Cunningham': 'קייד קאנינגהאם',
  'Jaden Ivey':      "ג'יידן אייבי",
  'Bojan Bogdanovic': 'בויאן בוגדנוביץ׳',
  'Isaiah Stewart':  "ישעיהו סטיוארט",
  'Ausar Thompson':  'אוסאר תומפסון',
  'Marcus Sasser':   'מרקוס סאסר',
  'Simone Fontecchio': 'סימונה פונטקיו',
  'James Wiseman':   "ג'יימס ווייסמן",

  // Orlando Magic
  'Paolo Banchero':     "פאולו בנצ'רו",
  'Franz Wagner':       'פרנץ ואגנר',
  'Wendell Carter Jr.': "וונדל קארטר ג'וניור",
  'Cole Anthony':       'קול אנתוני',
  'Markelle Fultz':     'מרקל פולץ',
  'Jalen Suggs':        "ג'יילן סאגס",
  'Joe Ingles':         "ג'ו אינגלס",
  'Moritz Wagner':      'מוריץ ואגנר',
  'Gary Harris':        'גרי האריס',

  // Philadelphia 76ers
  'Joel Embiid':     "ג'ואל אמביד",
  'Tyrese Maxey':    'טיריס מקסי',
  'Kelly Oubre Jr.': "קלי אורה ג'וניור",
  'Tobias Harris':   'טוביאס האריס',
  'De\'Anthony Melton': "דה'אנתוני מלטון",
  'Patrick Beverley': 'פטריק ביברלי',
  'Nicolas Batum':   'ניקולא בטום',
  'Mo Bamba':        'מו במבה',
  'Kyle Lowry':      'קייל לאורי',

  // Miami Heat
  'Bam Adebayo':     'באם אדבאיו',
  'Tyler Herro':     'טיילר הירו',
  'Jimmy Butler':    "ג'ימי באטלר",
  'Terry Rozier':    'טרי רוזיאר',
  'Duncan Robinson': 'דאנקן רובינסון',
  'Nikola Jovic':    "ניקולה יוביץ'",
  'Haywood Highsmith': 'הייווד הייסמית׳',
  'Caleb Martin':    'קייל מרטין',
  'Thomas Bryant':   "תומאס בריאנט",

  // San Antonio Spurs
  'Victor Wembanyama': 'ויקטור וומבנימה',
  'Keldon Johnson':    "קלדון ג'ונסון",
  'Devin Vassell':     'דווין וסל',
  'Jeremy Sochan':     "ג'רמי סושאן",
  'Chris Paul':        'כריס פול',
  'Stephon Castle':    'סטפון קאסל',
  'Zach Collins':      'זאק קולינס',
  'Julian Champagnie': "ג'וליאן שמפניה",
  'Tre Jones':         "טרה ג'ונס",

  // Atlanta Hawks
  'Trae Young':         'טריי יאנג',
  'Dejounte Murray':    "דז'ואנטה מארי",
  'Clint Capela':       'קלינט קפלה',
  "De'Andre Hunter":    "דה'אנדרה האנטר",
  'Bogdan Bogdanovic':  "בוגדן בוגדנוביץ'",
  'Saddiq Bey':         'סאדיק ביי',
  'Onyeka Okongwu':     'אוניקה אוקונגוו',
  'Larry Nance Jr.':    "לארי ננס ג'וניור",
  'Patty Mills':        'פאטי מילס',

  // Toronto Raptors
  'Scottie Barnes':  'סקוטי בארנס',
  'RJ Barrett':      'RJ בארט',
  'Jakob Poeltl':    "יאקוב פאלטל",
  'Gary Trent Jr.':  "גרי טרנט ג'וניור",
  'Immanuel Quickley': 'עמנואל קוויקלי',
  'Gradey Dick':     'גריידי דיק',
  'Bruce Brown':     'ברוס בראון',
  'Pascal Siakam':   'פסקל סיאקם',
  'OG Anunoby':      'OG אנונובי',
  'Precious Achiuwa': 'פרשייס אציואה',

  // Portland Trail Blazers
  'Scoot Henderson':  'סקוט הנדרסון',
  'Anfernee Simons':  'אנפרני סיימונס',
  'Jerami Grant':     "ג'רמי גראנט",
  'Deandre Ayton':    "דיאנדרי אייטון",
  'Toumani Camara':   'טומאני קמארה',
  'Matisse Thybulle': 'מאטיס ת׳יבול',
  'Jabari Walker':    "ג'באר ווקר",
  'Shaedon Sharpe':   "שיידון שארפ",
  'Robert Williams III': "רוברט וויליאמס השלישי",

  // Charlotte Hornets
  'LaMelo Ball':      "לה'מלו בול",
  'Brandon Miller':   'ברנדון מילר',
  'Miles Bridges':    "מיילס ברידג'ס",
  'Mark Williams':    'מארק וויליאמס',
  'Nick Richards':    'ניק ריצ׳רדס',
  'Grant Williams':   'גראנט וויליאמס',
  'Tre Mann':         'טרה מאן',
  'Seth Curry':       'סת קארי',
};

// Improved phonetic fallback for unknown players
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
  i: 'י', j: "ג'", k: 'ק', l: 'ל',
  m: 'מ', n: 'נ', o: 'ו', p: 'פ',
  q: 'ק', r: 'ר', s: 'ס', t: 'ט',
  u: 'ו', v: 'ב', w: 'ו', x: 'קס',
  y: 'י', z: 'ז',
};

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
    // Skip silent trailing 'e'
    if (ch === 'e' && i === lower.length - 1) { i++; continue; }
    result += CHARS[ch] ?? ch;
    i++;
  }
  return result;
}

export function transliterateToHebrew(fullName) {
  if (PLAYER_DICT[fullName]) return PLAYER_DICT[fullName];
  return fullName
    .split(/[\s-]/)
    .map((w) => (w ? transliterateWord(w) : ''))
    .join(' ')
    .trim();
}
