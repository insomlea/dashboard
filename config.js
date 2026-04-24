// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEATHERBIRD CONFIG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const WEATHERBIRD_INDEX_URL = 'https://raw.githubusercontent.com/insomlea/dashboard/main/weatherbird-index.json';
const WEATHERBIRD_BASE_URL  = 'https://raw.githubusercontent.com/insomlea/dashboard/main/weatherbirds/';

const FALLBACK_BIRDS = [
  'business_casual_shirt_tie.png',
  'clapping_dancing_bowtie_celebration.png',
  'confused_shrug_business_casual.png',
  'worry.png',
  'tying_tie.png',
  'thinking.png',
  'thinking_pointer.png',
  'thinking_pose_business_attire.png',
  'thinking_standing.png'
];

// Hardcoded date overrides — specific bird for a specific date
const DATE_OVERRIDES = {
  '04/22/2026': 'elephant_friend_zoo_visit.png', // Earth Day elephant
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SIGNIFICANT DATES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Helper: nth weekday of a month. weekday: 0=Sun, 1=Mon … 6=Sat. nth: 1-based.
function nthWeekdayOfMonth(year, month1, weekday, nth) {
  const d = new Date(year, month1 - 1, 1);
  let count = 0;
  while (true) {
    if (d.getDay() === weekday) { count++; if (count === nth) return new Date(d); }
    d.setDate(d.getDate() + 1);
  }
}

const FIXED_DATES = [
  { month:1,  day:1,  name:"New Year's Day",    tags:['new_years_day','celebration','confetti','party'], leadDays:3 },
  { month:2,  day:2,  name:"Groundhog Day",      tags:['groundhog','winter','shadow','prediction'], leadDays:0 },
  { month:2,  day:6,  name:"Sharona's Birthday", tags:['cat','cats','kitten','feline','birthday','celebration'], leadDays:0 },
  { month:2,  day:14, name:"Valentine's Day",    tags:['valentines_day','love','heart','romance','flowers'], leadDays:7 },
  { month:3,  day:14, name:"Pi Day",             tags:['pi_day','math','science','pie','numbers'], leadDays:0 },
  { month:3,  day:17, name:"St. Patrick's Day",  tags:['st_patricks_day','irish','shamrock','green','luck'], leadDays:7 },
  { month:3,  day:20, name:"Spring Equinox",     tags:['spring','flowers','sunshine','renewal'], leadDays:0 },
  { month:4,  day:1,  name:"April Fools' Day",   tags:['april_fools','joke','silly','surprised'], leadDays:0 },
  { month:4,  day:15, name:"Tax Day",            tags:['tax_day','taxes','stressed','paperwork','money'], leadDays:0 },
  { month:4,  day:20, name:"4/20",               tags:['420','marijuana','cannabis','weed','smoke','chill','relaxed','stoned'], leadDays:0 },
  { month:4,  day:22, name:"Earth Day",          tags:['earth_day','nature','environment','trees'], leadDays:0 },
  { month:5,  day:5,  name:"Cinco de Mayo",      tags:['cinco_de_mayo','mexico','fiesta','celebration'], leadDays:0 },
  { month:6,  day:1,  name:"Pride Month",        tags:['pride','rainbow','lgbtq','celebration'], leadDays:0, spanDays:30 },
  { month:6,  day:19, name:"Juneteenth",         tags:['juneteenth','freedom','celebration','history'], leadDays:0 },
  { month:6,  day:21, name:"Summer Solstice",    tags:['summer','sunshine','beach','hot'], leadDays:0 },
  { month:7,  day:4,  name:"Independence Day",   tags:['fourth_of_july','fireworks','patriotic','flag','celebration'], leadDays:5 },
  { month:8,  day:25, name:"Back to School",     tags:['back_to_school','school','books','backpack','nervous'], leadDays:7, spanDays:7 },
  { month:9,  day:4,  name:"Lea's Birthday",     tags:['birthday','cake','celebration','party'], leadDays:0 },
  { month:9,  day:11, name:"9/11 Remembrance",   tags:['nine_eleven','remembrance','patriotic','somber'], leadDays:0 },
  { month:9,  day:22, name:"Fall Equinox",       tags:['fall','autumn','leaves','harvest'], leadDays:0 },
  { month:10, day:31, name:"Halloween",          tags:['halloween','spooky','pumpkin','costumes','ghost','witch','skeleton'], leadDays:7 },
  { month:11, day:11, name:"Veterans Day",       tags:['veterans_day','military','soldier','patriotic','flag'], leadDays:0 },
  { month:12, day:24, name:"Christmas Eve",      tags:['christmas_eve','santa','gifts','night'], leadDays:0 },
  { month:12, day:25, name:"Christmas Day",      tags:['christmas_day','tree','santa','gifts','snow','holiday'], leadDays:14 },
  { month:12, day:26, name:"Kwanzaa",            tags:['kwanzaa','celebration','candles','african_heritage'], leadDays:0, spanDays:7 },
  { month:12, day:31, name:"New Year's Eve",     tags:['new_years_eve','celebration','countdown','party'], leadDays:3 },
];

function getFloatingDates(year) {
  const d = (date) => ({ month: date.getMonth() + 1, day: date.getDate() });

  function nthDay(month1, weekday, nth) { return nthWeekdayOfMonth(year, month1, weekday, nth); }
  function lastMonday(month1) {
    const last = new Date(year, month1, 0);
    while (last.getDay() !== 1) last.setDate(last.getDate() - 1);
    return new Date(last);
  }

  const mothersDay    = nthDay(5,  0, 2);
  const fathersDay    = nthDay(6,  0, 3);
  const memorialDay   = lastMonday(5);
  const laborDay      = nthDay(9,  1, 1);
  const thanksgiving  = nthDay(11, 4, 4);
  const mlkDay        = nthDay(1,  1, 3);
  const presidentsDay = nthDay(2,  1, 3);
  const columbusDay   = nthDay(10, 1, 2);
  const dstSpring     = nthDay(3,  0, 2);
  const dstFall       = nthDay(11, 0, 1);
  const recordStoreDay = nthDay(4,  6, 3);
  const kentuckyDerby = nthDay(5,  6, 1);
  const superBowl     = nthDay(2,  0, 2);
  const arborDay = (() => {
    const last = new Date(year, 4, 0);
    while (last.getDay() !== 5) last.setDate(last.getDate() - 1);
    return new Date(last);
  })();
  const indy500 = new Date(memorialDay);
  indy500.setDate(indy500.getDate() - 1);

  return [
    { ...d(recordStoreDay), name:"Record Store Day",          tags:['record_store_day','music','vinyl','records','shopping'],         leadDays:0  },
    { ...d(arborDay),      name:"Arbor Day",               tags:['arbor_day','trees','nature','planting','environment'],            leadDays:0  },
    { ...d(mothersDay),    name:"Mother's Day",             tags:['mothers_day','flowers','family','love'],                          leadDays:7  },
    { ...d(fathersDay),    name:"Father's Day",             tags:['fathers_day','family','bbq','outdoors'],                          leadDays:7  },
    { ...d(memorialDay),   name:"Memorial Day",             tags:['memorial_day','patriotic','military','soldier','flag'],            leadDays:3  },
    { ...d(laborDay),      name:"Labor Day",                tags:['labor_day','work','end_of_summer'],                               leadDays:1  },
    { ...d(thanksgiving),  name:"Thanksgiving",             tags:['thanksgiving','turkey','harvest','family','feast'],                leadDays:14, spanDays:2 },
    { ...d(mlkDay),        name:"Martin Luther King Day",   tags:['mlk','civil_rights','peace','dove'],                              leadDays:0  },
    { ...d(presidentsDay), name:"Presidents' Day",          tags:['presidents_day','patriotic','washington'],                        leadDays:0  },
    { ...d(columbusDay),   name:"Indigenous Peoples' Day",  tags:['indigenous_peoples_day','native_american','history'],             leadDays:0  },
    { ...d(dstSpring),     name:"Daylight Saving Time",     tags:['daylight_saving','spring_forward','clocks','time_change'],        leadDays:0  },
    { ...d(dstFall),       name:"Daylight Saving Time",     tags:['daylight_saving','fall_back','clocks','time_change'],             leadDays:0  },
    { ...d(kentuckyDerby), name:"Kentucky Derby",           tags:['kentucky_derby','horse_racing','derby','hat','roses'],            leadDays:3  },
    { ...d(indy500),       name:"Indy 500",                 tags:['indy_500','racing','indianapolis','cars','speed'],                leadDays:3  },
    { ...d(superBowl),     name:"Super Bowl",               tags:['super_bowl','football','nfl','touchdown','party'],                leadDays:7  },
  ];
}

const STATIC_DATES = [...FIXED_DATES, ...getFloatingDates(new Date().getFullYear())];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BIRD EXCLUSION RULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SPORTS_TAGS = ['baseball','football','basketball','soccer','hockey','golf','racing','sports','tennis','volleyball','olympics','marathon','cardinals','fredbird','referee','march_madness','boxing','cycling','swimming','wrestling','cheerleading','skateboard','surfing','skiing','snowboard','indy','derby','nascar','nfl','nba','mlb','nhl'];

const SEASON_EXCLUSIVE_GROUPS = [
  { tags: ['snow_shovel','snowman','sled','sledding','ice_skate','ice_skating','snowball','ski','skiing','snowboard','snowboarding','blizzard','avalanche'], season: 'winter', requires: ['winter','snow','cold','freezing','blizzard'] },
  { tags: ['summer_heat','heat_wave','sweating','swimming','beach','surfing','sunburn','popsicle','ice_cream','lemonade','water_balloon','water_bucket','sprinkler','pool','bikini'], season: 'summer', requires: ['summer','hot','warm','beach','sunshine'] },
  { tags: ['spring_flowers','cherry_blossom','gardening','planting','april_showers','easter'], season: 'spring', requires: ['spring','flowers','renewal','rain'] },
  { tags: ['fall_leaves','autumn_leaves','raking','hay_ride','apple_picking','harvest'], season: 'fall', requires: ['fall','autumn','leaves','harvest'] },
];

const HOLIDAY_EXCLUSIVE_GROUPS = [
  { tags: ['wedding','wedding_dress','bride','groom','bridal','veil','bouquet','wedding_flowers'], requires: ['wedding'] },
  { tags: ['halloween','spooky','ghost','witch','skeleton','pumpkin','costumes','jack_o_lantern','haunted'], requires: ['halloween'] },
  { tags: ['christmas','christmas_day','christmas_eve','santa','reindeer','elf','north_pole','christmas_tree','ornament','nativity'], requires: ['christmas','christmas_day','christmas_eve'] },
  { tags: ['easter','easter_egg','bunny'], requires: ['easter'] },
  { tags: ['valentines_day','cupid'], requires: ['valentines_day','love','heart','romance'] },
  { tags: ['st_patricks_day','shamrock','leprechaun'], requires: ['st_patricks_day','irish'] },
  { tags: ['thanksgiving','turkey'], requires: ['thanksgiving'] },
  { tags: ['hanukkah','menorah','dreidel'], requires: ['hanukkah'] },
  { tags: ['fourth_of_july','fireworks'], requires: ['fourth_of_july','fireworks','new_years_eve','celebration'] },
  { tags: ['new_years_eve','new_years_day','countdown','confetti'], requires: ['new_years_eve','new_years_day','celebration','party'] },
  { tags: ['chinese_new_year','lunar_new_year','lion_dance','dragon_dance','lantern_festival','red_envelope','dumpling','fireworks_cny'], requires: ['chinese_new_year','lunar_new_year'] },
  { tags: ['diwali','diya','rangoli','deepavali'], requires: ['diwali','deepavali'] },
  { tags: ['mardi_gras','fat_tuesday','carnival','masquerade','bead','float_parade'], requires: ['mardi_gras','fat_tuesday','carnival'] },
  { tags: ['cinco_de_mayo','margarita','sombrero','pinata','mariachi'], requires: ['cinco_de_mayo'] },
  { tags: ['day_of_the_dead','dia_de_los_muertos','sugar_skull','ofrenda','calavera'], requires: ['day_of_the_dead','dia_de_los_muertos'] },
  { tags: ['passover','seder','matzo','afikoman'], requires: ['passover'] },
  { tags: ['ramadan','eid','iftar','crescent_moon_star'], requires: ['ramadan','eid'] },
  { tags: ['parade'], requires: ['st_patricks_day','mardi_gras','parade','chinese_new_year','fourth_of_july'] },
  { tags: ['graduation','diploma','cap_gown'], requires: ['graduation','school'] },
];

// Filename season guard — birds whose filename contains these keywords are season-restricted
const FILENAME_SEASON_KEYWORDS = {
  winter: ['winter', 'snow_shovel', 'snowman', 'snowball', 'blizzard', 'ice_skate', 'sled'],
  summer: ['summer', 'summer_heat', 'sweating', 'water_bucket', 'heat_wave', 'beach_day', 'sunburn'],
  spring: ['spring', 'spring_flowers', 'spring_rain', 'spring_jacket', 'spring_cleaning', 'april_shower'],
  fall:   ['autumn', 'fall', 'autumn_leaves', 'fall_leaves', 'raking_leaves', 'autumn_jacket', 'fall_jacket'],
};
const SEASON_REQUIRE_MAP = {
  winter: ['winter', 'snow', 'cold', 'freezing'],
  summer: ['summer', 'hot', 'warm', 'beach'],
  spring: ['spring', 'flowers', 'renewal'],
  fall:   ['fall', 'autumn', 'leaves'],
};

// Filename holiday guard — birds whose filename contains these keywords only show on that holiday
const FILENAME_HOLIDAY_KEYWORDS = {
  chinese_new_year:        ['chinese_new_year', 'lunar_new_year', 'lion_dance', 'dragon_dance'],
  halloween:               ['halloween'],
  christmas:               ['christmas'],
  easter:                  ['easter'],
  valentines_day:          ['valentines_day', 'valentine'],
  st_patricks_day:         ['st_patricks', 'st_patrick'],
  thanksgiving:            ['thanksgiving'],
  hanukkah:                ['hanukkah'],
  fourth_of_july:          ['fourth_of_july'],
  new_years:               ['new_years'],
  diwali:                  ['diwali'],
  mardi_gras:              ['mardi_gras'],
  cinco_de_mayo:           ['cinco_de_mayo'],
  day_of_the_dead:         ['day_of_the_dead', 'dia_de_los_muertos', 'sugar_skull'],
  passover:                ['passover', 'seder'],
  ramadan:                 ['ramadan', 'eid'],
  memorial_day:            ['memorial_day'],
  veterans_day:            ['veterans_day'],
  juneteenth:              ['juneteenth'],
  mlk_day:                 ['mlk_day'],
  labor_day:               ['labor_day'],
  indigenous_peoples_day:  ['indigenous_peoples_day'],
  nine_eleven:             ['september_11', 'nine_eleven'],
  pride:                   ['pride_rainbow', 'pride_flag', 'pride_month'],
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EVENT TAG MAPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const STOPWORDS = new Set(['with','this','that','from','have','will','been','were','they','their','there','what','when','where','into','more','also','some','than','then','just','over','after','before','about','like','only','such','each','much','most','many','even','well','very','here','upon','both','through','first','last','next','week','year','month','today','event','local','national','annual','new','the','and','for','are','but','not','you','all','any','can','her','was','our','one','had','his','him','how','its','who','did','get','has','him','let','may','now','own','see','set','put','say','she','him','use','way','day','old','too','use','via']);

const FUN_EVENT_TAG_MAP = {
  // Animals
  'elephant': ['elephant', 'zoo', 'animal'],
  'giraffe':  ['giraffe',  'zoo', 'animal'],
  'panda':    ['panda',    'zoo', 'animal'],
  'penguin':  ['penguin',  'zoo', 'animal', 'cold'],
  'lion':     ['lion',     'zoo', 'animal'],
  'tiger':    ['tiger',    'zoo', 'animal'],
  'bear':     ['bear',     'animal', 'forest'],
  'dolphin':  ['dolphin',  'ocean', 'animal'],
  'whale':    ['whale',    'ocean', 'animal'],
  'gorilla':  ['gorilla',  'zoo', 'animal'],
  'monkey':   ['monkey',   'zoo', 'animal'],
  'flamingo': ['flamingo', 'zoo', 'pink', 'animal'],
  'hippo':    ['hippo',    'zoo', 'animal'],
  'rhino':    ['rhino',    'zoo', 'animal'],
  'cheetah':  ['cheetah',  'zoo', 'animal'],
  'zebra':    ['zebra',    'zoo', 'animal'],
  'zoo':      ['zoo',      'animal', 'outdoors'],
  // Music & arts
  'concert':  ['concert',  'music', 'entertainment'],
  'festival': ['festival', 'celebration', 'outdoors', 'music'],
  'parade':   ['parade',   'celebration', 'street', 'colorful'],
  'opera':    ['opera',    'theater', 'music', 'arts'],
  'symphony': ['symphony', 'orchestra', 'music', 'arts'],
  'ballet':   ['ballet',   'dance', 'arts', 'theater'],
  'museum':   ['museum',   'art', 'history', 'indoors'],
  'gallery':  ['gallery',  'art', 'photography'],
  'theater':  ['theater',  'entertainment', 'arts'],
  'theatre':  ['theatre',  'entertainment', 'arts'],
  'movie':    ['movie',    'film', 'entertainment'],
  'film':     ['film',     'movie', 'entertainment'],
  // Food & drink
  'food':     ['food',     'restaurant', 'dining'],
  'dinner':   ['dinner',   'restaurant', 'dining'],
  'lunch':    ['lunch',    'restaurant', 'dining'],
  'brunch':   ['brunch',   'breakfast', 'dining'],
  'pizza':    ['pizza',    'food', 'dining'],
  'bbq':      ['bbq',      'summer', 'outdoors', 'food'],
  'barbecue': ['bbq',      'summer', 'outdoors', 'food'],
  'brewery':  ['brewery',  'beer', 'drink'],
  'winery':   ['winery',   'wine', 'drink'],
  'market':   ['market',   'shopping', 'food', 'outdoors'],
  // Sports
  'marathon': ['marathon', 'running', 'sports', 'race'],
  'race':     ['race',     'sports', 'running'],
  'baseball': ['baseball', 'sports', 'game'],
  'soccer':   ['soccer',   'sports', 'game'],
  'football': ['football', 'sports', 'game'],
  'basketball':['basketball','sports','game'],
  'hockey':   ['hockey',   'sports', 'ice', 'game'],
  'tennis':   ['tennis',   'sports', 'game'],
  'golf':     ['golf',     'sports', 'outdoors'],
  'swim':     ['swimming', 'sports', 'water'],
  'cycling':  ['cycling',  'sports', 'outdoors', 'bike'],
  'triathlon':['triathlon','sports','running','swimming'],
  // Nature & outdoors
  'hike':     ['hiking',   'nature', 'outdoors', 'trail'],
  'hiking':   ['hiking',   'nature', 'outdoors'],
  'park':     ['park',     'outdoors', 'nature'],
  'garden':   ['garden',   'nature', 'flowers', 'spring'],
  'beach':    ['beach',    'summer', 'ocean', 'outdoors'],
  'nature':   ['nature',   'outdoors', 'trees'],
  'forest':   ['forest',   'nature', 'trees', 'outdoors'],
  'trail':    ['trail',    'hiking', 'nature', 'outdoors'],
  'flower':   ['flowers',  'spring', 'nature', 'garden'],
  'cherry blossom': ['cherry_blossom', 'spring', 'flowers', 'japan'],
  'blossom':  ['blossom',  'spring', 'flowers'],
  'snow':     ['snow',     'winter', 'cold'],
  // Community & civic
  'election': ['election_day', 'voting', 'democracy'],
  'vote':     ['voting',   'election', 'democracy'],
  'inaugur':  ['inauguration','government','ceremony'],
  'protest':  ['protest',  'march', 'civic'],
  'cleanup':  ['cleanup',  'volunteer', 'outdoors', 'community'],
  'volunteer':['volunteer','community','helping'],
  'fair':     ['fair',     'carnival', 'celebration', 'outdoors'],
  'carnival': ['carnival', 'celebration', 'colorful'],
  'circus':   ['circus',   'entertainment', 'colorful', 'performance'],
  'fireworks':['fireworks','celebration','night'],
  'rocket':   ['rocket',   'space', 'launch'],
  'launch':   ['launch',   'technology', 'space'],
  'space':    ['space',    'science', 'stars'],
  // Seasons / weather events
  'eclipse':  ['eclipse',  'astronomy', 'sky', 'science'],
  'solstice': ['solstice', 'season'],
  'equinox':  ['equinox',  'spring', 'season'],
  'aurora':   ['aurora',   'night', 'winter', 'sky'],
  'meteor':   ['meteor',   'astronomy', 'night', 'sky'],
};

// Holiday name → rich tags (used to map Google Calendar holiday names to weatherbird tags)
const HOLIDAY_TAG_MAP = {
  'new year\'s eve':      ['new_years_eve','celebration','countdown','party'],
  'new year\'s day':      ['new_years_day','celebration','confetti','party'],
  'new year':              ['new_years_day','celebration','confetti','party'],
  'martin luther king':    ['mlk','civil_rights','peace','dove'],
  'groundhog':             ['groundhog','winter','shadow','prediction'],
  'valentine':             ['valentines_day','love','heart','romance','flowers'],
  'presidents':            ['presidents_day','patriotic','washington'],
  "washington's birthday": ['presidents_day','patriotic','washington'],
  'st. patrick':           ['st_patricks_day','irish','shamrock','green','luck'],
  'patrick':               ['st_patricks_day','irish','shamrock','green','luck'],
  'pi day':                ['pi_day','math','science','pie','numbers'],
  'april fools':           ['april_fools','joke','silly','surprised'],
  'earth day':             ['earth_day','nature','environment','green','trees'],
  'arbor day':             ['arbor_day','trees','nature','planting'],
  'tax day':               ['tax_day','taxes','stressed','paperwork','money'],
  'easter':                ['easter','spring','eggs','rabbit','church'],
  'cinco de mayo':         ['cinco_de_mayo','mexico','fiesta','celebration'],
  'mother':                ['mothers_day','flowers','family','love'],
  'memorial':              ['memorial_day','patriotic','military','soldier','flag'],
  'father':                ['fathers_day','family','bbq','outdoors'],
  'juneteenth':            ['juneteenth','freedom','celebration','history'],
  'independence':          ['fourth_of_july','fireworks','patriotic','flag','celebration'],
  'july 4':                ['fourth_of_july','fireworks','patriotic','flag','celebration'],
  'labor day':             ['labor_day','work','end_of_summer'],
  'indigenous':            ['indigenous_peoples_day','native_american','history'],
  'columbus':              ['indigenous_peoples_day','native_american','history'],
  'halloween':             ['halloween','spooky','pumpkin','costumes','ghost','witch','skeleton'],
  'election':              ['election_day','voting','democracy','government'],
  'veterans':              ['veterans_day','military','soldier','patriotic','flag'],
  'thanksgiving':          ['thanksgiving','turkey','harvest','family','feast'],
  'hanukkah':              ['hanukkah','menorah','jewish','celebration'],
  'chanukah':              ['hanukkah','menorah','jewish','celebration'],
  'christmas eve':         ['christmas_eve','santa','gifts','night','candles'],
  'christmas day':         ['christmas_day','tree','santa','gifts','snow','holiday'],
  'christmas':             ['christmas_day','tree','santa','gifts','snow','holiday'],
  'kwanzaa':               ['kwanzaa','celebration','candles','african_heritage'],
  'mardi gras':            ['mardi_gras','carnival','celebration','colorful'],
  'super bowl':            ['super_bowl','football','party','sports'],
  'black friday':          ['black_friday','shopping','deals','bags'],
  'diwali':                ['diwali','lights','celebration','candles'],
  'passover':              ['passover','jewish','celebration','spring'],
  'rosh hashana':          ['rosh_hashana','jewish','new_year','celebration'],
  'yom kippur':            ['yom_kippur','jewish','somber','fasting'],
  'eid':                   ['eid','muslim','celebration','feast'],
  'pride':                 ['pride','rainbow','lgbtq','celebration'],
};
