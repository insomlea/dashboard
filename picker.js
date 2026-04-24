// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEATHERBIRD PICKER
// Depends on config.js being loaded first.
// Depends on these globals from index.html:
//   toYMD, weatherCodeToTags, seasonTags, getFallbackBird, birdOffset
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── Score a single bird against a list of target tags ──
function scoreBird(bird, targetTags, pureEventTags = []) {
  let score = 0;
  const filename = (bird.filename || '').toLowerCase().replace(/[_.]/g, ' ');

  let allBirdTags = [];
  if (bird.tags && typeof bird.tags === 'object') {
    for (const val of Object.values(bird.tags)) {
      if (Array.isArray(val)) {
        allBirdTags.push(...val.map(t => String(t).toLowerCase()));
      } else if (typeof val === 'string' && val.trim()) {
        allBirdTags.push(val.trim().toLowerCase());
      }
    }
  }
  for (const field of ['holiday','season','weather','object','objects']) {
    const v = bird[field];
    if (!v) continue;
    if (Array.isArray(v)) allBirdTags.push(...v.map(t => String(t).toLowerCase()));
    else if (typeof v === 'string' && v.trim()) allBirdTags.push(v.trim().toLowerCase());
  }
  if (bird.description) {
    allBirdTags.push(...bird.description.toLowerCase().split(/\s+/));
  }

  const birdFilename = (bird.filename || '').toLowerCase();

  const birdIsSports = SPORTS_TAGS.some(s => allBirdTags.includes(s) || filename.includes(s) || birdFilename.includes(s));
  const targetHasSports = SPORTS_TAGS.some(s => targetTags.map(t => t.toLowerCase()).includes(s));
  if (birdIsSports && !targetHasSports) return -1;

  const lowerTargetTags = targetTags.map(t => t.toLowerCase());

  for (const group of HOLIDAY_EXCLUSIVE_GROUPS) {
    const birdHasExclusiveTag = group.tags.some(t =>
      allBirdTags.includes(t) ||
      filename.includes(t.replace(/_/g, ' ')) ||
      birdFilename.includes(t.replace(/_/g, ''))
    );
    if (birdHasExclusiveTag) {
      const contextHasRequiredTag = group.requires.some(r => lowerTargetTags.includes(r));
      if (!contextHasRequiredTag) {
        console.log(`🚫 Excluding "${bird.filename}" — exclusive to [${group.requires}] but context is [${lowerTargetTags.slice(0,5).join(',')}...]`);
        return -1;
      }
    }
  }

  for (const group of SEASON_EXCLUSIVE_GROUPS) {
    const birdHasSeasonTag = group.tags.some(t =>
      allBirdTags.includes(t) ||
      filename.includes(t.replace(/_/g, ' ')) ||
      birdFilename.includes(t.replace(/_/g, ''))
    );
    if (birdHasSeasonTag) {
      const contextHasSeason = group.requires.some(r => lowerTargetTags.includes(r));
      if (!contextHasSeason) {
        const birdMatchesHoliday = pureEventTags.length > 0 &&
          pureEventTags.some(pt => allBirdTags.includes(pt.toLowerCase()));
        if (birdMatchesHoliday) continue;
        console.log(`🌦️ Excluding "${bird.filename}" — seasonal [${group.season}] but current season tags are [${lowerTargetTags.slice(0,5).join(',')}...]`);
        return -1;
      }
    }
  }

  for (const [season, keywords] of Object.entries(FILENAME_SEASON_KEYWORDS)) {
    if (keywords.some(k => birdFilename.includes(k))) {
      const required = SEASON_REQUIRE_MAP[season];
      if (!required.some(r => lowerTargetTags.includes(r))) {
        const birdMatchesHoliday = pureEventTags.length > 0 &&
          pureEventTags.some(pt => allBirdTags.includes(pt.toLowerCase()));
        if (birdMatchesHoliday) continue;
        console.log(`🌦️ Filename-exclusion: "${bird.filename}" looks like ${season} but season tags are [${lowerTargetTags.slice(0,5).join(',')}...]`);
        return -1;
      }
    }
  }

  for (const [holiday, keywords] of Object.entries(FILENAME_HOLIDAY_KEYWORDS)) {
    if (keywords.some(k => birdFilename.includes(k))) {
      if (!lowerTargetTags.includes(holiday) && !lowerTargetTags.some(t => keywords.includes(t))) {
        console.log(`🗓️ Filename-holiday exclusion: "${bird.filename}" is specific to [${holiday}] but it's not that holiday`);
        return -1;
      }
    }
  }

  for (const tag of targetTags) {
    const t = tag.toLowerCase().replace(/_/g, ' ');
    const tUnderscore = tag.toLowerCase();
    if (allBirdTags.includes(tUnderscore) || allBirdTags.includes(t)) score += 10;
    if (filename.includes(t)) score += 5;
  }
  return score;
}

// ── Calendar event summary → bird tags ──
function tagsFromFunEvent(summary) {
  if (!summary) return [];
  const s = summary.toLowerCase();
  const tags = [];

  const sortedKeys = Object.keys(FUN_EVENT_TAG_MAP).sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (s.includes(key)) {
      tags.push(...FUN_EVENT_TAG_MAP[key]);
    }
  }

  const words = s.replace(/[^a-z\s]/g, ' ').split(/\s+/);
  for (const w of words) {
    if (w.length >= 4 && !STOPWORDS.has(w) && !tags.includes(w)) {
      tags.push(w);
    }
  }

  return [...new Set(tags)];
}

// ── Main picker ──
async function pickWeatherbird(weatherCode, tempF, holidayEvents, calendarEvents) {
  let index = {};
  try {
    const res = await fetch(WEATHERBIRD_INDEX_URL);
    if (res.ok) {
      index = await res.json();
    } else {
      console.warn('⚠️ Weatherbird index fetch failed:', res.status, res.statusText);
      return { url: getFallbackBird(), reason: null };
    }
  } catch(e) {
    console.warn('Could not load weatherbird index', e);
    return { url: getFallbackBird(), reason: null };
  }

  const birds = Object.values(index);
  if (!birds.length) return { url: getFallbackBird(), reason: null };

  // Hardcoded date overrides
  const todayForOverride = new Date();
  const overrideKey = `${String(todayForOverride.getMonth()+1).padStart(2,'0')}/${String(todayForOverride.getDate()).padStart(2,'0')}/${todayForOverride.getFullYear()}`;
  if (DATE_OVERRIDES[overrideKey]) {
    const todayForName = new Date();
    let overrideHolidayName = null;
    for (const sd of STATIC_DATES) {
      const start = new Date(todayForName.getFullYear(), sd.month - 1, sd.day - (sd.leadDays || 0));
      const end   = new Date(todayForName.getFullYear(), sd.month - 1, sd.day + (sd.spanDays || 1));
      if (todayForName >= start && todayForName < end) {
        overrideHolidayName = sd.name || null;
        break;
      }
    }
    return { url: WEATHERBIRD_BASE_URL + DATE_OVERRIDES[overrideKey], reason: 'Special pick for today 🐘', holidayName: overrideHolidayName };
  }

  const today = new Date();
  const month = today.getMonth() + 1;
  const todayYmd = toYMD(today);

  let targetTags = [];
  let matchSource = 'season';
  let holidayName = null;

  function tagsForHoliday(name) {
    const n = name.toLowerCase();
    for (const [key, tags] of Object.entries(HOLIDAY_TAG_MAP)) {
      if (n.includes(key)) return tags;
    }
    return n.split(/\s+/).filter(w => w.length > 3);
  }

  // 1. Check today's holidays from the US holidays calendar
  const todayHolidays = (holidayEvents || []).filter(e => e.start?.date === todayYmd);
  if (todayHolidays.length) {
    holidayName = todayHolidays[0].summary || '';
    targetTags = tagsForHoliday(holidayName);
    matchSource = 'holiday';
    console.log('🐦 Holiday today:', holidayName, '→', targetTags);
  }

  // Also check STATIC_DATES (birthdays, etc.)
  let staticHolidayName = null;
  for (const sd of STATIC_DATES) {
    const start = new Date(today.getFullYear(), sd.month - 1, sd.day - (sd.leadDays || 0));
    const end   = new Date(today.getFullYear(), sd.month - 1, sd.day + (sd.spanDays || 1));
    if (today >= start && today < end) {
      targetTags = [...new Set([...sd.tags, ...targetTags])];
      matchSource = 'holiday';
      staticHolidayName = sd.name || null;
      if (!holidayName) holidayName = staticHolidayName;
      break;
    }
  }

  // 2. Extract tags from today's fun calendar events
  const todayEvents = (calendarEvents || []).filter(e => e.start?.date === todayYmd);
  let funEventName = null;
  if (todayEvents.length) {
    const funTags = [];
    for (const e of todayEvents) {
      const t = tagsFromFunEvent(e.summary);
      if (t.length) {
        funTags.push(...t);
        if (!funEventName) funEventName = e.summary;
      }
    }
    if (funTags.length) {
      targetTags = [...new Set([...funTags, ...targetTags])];
      if (matchSource !== 'holiday') matchSource = 'calendar';
      console.log('🐦 Fun calendar events today:', todayEvents.map(e => e.summary), '→', funTags);
    }
  }

  const pureEventTags = [...targetTags];

  // 3. Add weather tags
  const wTags = weatherCodeToTags(weatherCode, tempF);
  targetTags = [...new Set([...targetTags, ...wTags])];

  // 4. Always add season as fallback
  const sTags = seasonTags(month);
  targetTags = [...new Set([...targetTags, ...sTags])];

  console.log(`🐦 Weatherbird picking for: [${matchSource}]`, targetTags);

  function getBirdTags(b) {
    const bTags = [];
    if (b.tags && typeof b.tags === 'object') {
      for (const v of Object.values(b.tags)) {
        if (Array.isArray(v)) bTags.push(...v.map(t => String(t).toLowerCase()));
        else if (typeof v === 'string') bTags.push(v.toLowerCase());
      }
    }
    for (const field of ['holiday','season','weather','object','objects']) {
      const v = b[field];
      if (!v) continue;
      if (Array.isArray(v)) bTags.push(...v.map(t => String(t).toLowerCase()));
      else if (typeof v === 'string') bTags.push(v.toLowerCase());
    }
    return bTags;
  }

  function birdMatchesTags(b, tags, includeDescription = false) {
    const bTags = getBirdTags(b);
    if (includeDescription && b.description) {
      bTags.push(...b.description.toLowerCase().split(/\s+/));
    }
    const fname = (b.filename || '').toLowerCase();
    return tags.some(pt => {
      const p = pt.toLowerCase();
      return bTags.includes(p) ||
             bTags.includes(p.replace(/_/g, ' ')) ||
             fname.includes(p) ||
             fname.includes(p.replace(/_/g, ''));
    });
  }

  function candidatesFor(tags, includeDescription = false) {
    const scored = birds
      .map(b => ({ bird: b, score: scoreBird(b, tags, pureEventTags) }))
      .filter(s => s.score > 0 && birdMatchesTags(s.bird, tags, includeDescription));
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PRIORITY WATERFALL  1→2→3→4→5
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  let top = [];
  let winReason = '';

  // ── Tier 1: Holiday ──
  const holidayTags = matchSource === 'holiday' ? pureEventTags : [];
  if (holidayTags.length) {
    const specificTag = holidayName
      ? holidayName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      : null;
    if (specificTag) {
      const hardTagged = birds.filter(b => getBirdTags(b).includes(specificTag));
      if (hardTagged.length) {
        top = hardTagged.map(b => ({ bird: b, score: 100 }));
        winReason = `Showing for ${holidayName}`;
        console.log(`🐦 Tier 1 (explicit tag "${specificTag}"): ${hardTagged.length} birds`);
      }
    }
    if (!top.length) {
      top = candidatesFor(holidayTags, true);
      if (top.length) {
        winReason = holidayName ? `Showing for ${holidayName}` : `Showing for holiday`;
        console.log(`🐦 Tier 1 (holiday broad match): ${top.length} birds`);
      }
    }
  }

  // ── Tier 2: Calendar events ──
  if (!top.length) {
    const calTags = matchSource === 'calendar' ? pureEventTags :
                    pureEventTags.filter(t => !holidayTags.includes(t));
    if (calTags.length) {
      top = candidatesFor(calTags);
      if (top.length) {
        winReason = funEventName ? `Showing for "${funEventName}"` : `Showing for calendar event`;
        console.log(`🐦 Tier 2 (calendar): ${top.length} birds for [${calTags.join(',')}]`);
      }
    }
  }

  // ── Tier 3: Weather ──
  if (!top.length && wTags.length) {
    top = candidatesFor(wTags);
    if (top.length) {
      const weatherTag = wTags.find(t => t.match(/^(snow|rain|sunny|sunshine|storm|fog|cold|hot|warm|freezing|cloudy|overcast|drizzle|thunderstorm)$/));
      winReason = weatherTag ? `Picked for ${weatherTag} weather` : `Picked for today's weather`;
      console.log(`🐦 Tier 3 (weather): ${top.length} birds`);
    }
  }

  // ── Tier 4: Season ──
  if (!top.length && sTags.length) {
    top = candidatesFor(sTags);
    if (top.length) {
      const seasonTag = sTags.find(t => t.match(/^(winter|spring|summer|fall|autumn)$/));
      winReason = seasonTag ? `Picked for ${seasonTag}` : `Picked for the season`;
      console.log(`🐦 Tier 4 (season): ${top.length} birds`);
    }
  }

  // ── Tier 5: Default — any positively-scoring bird ──
  if (!top.length) {
    const allScored = birds
      .map(b => ({ bird: b, score: scoreBird(b, targetTags, pureEventTags) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
    const topScore = allScored[0]?.score || 0;
    top = allScored.filter(s => s.score >= topScore * 0.5);
    winReason = '';
    console.log(`🐦 Tier 5 (default): ${top.length} birds`);
  }

  if (!top.length) return { url: getFallbackBird(), reason: null };

  const today2 = new Date();
  const daySeed = today2.getFullYear() * 10000 + (today2.getMonth()+1) * 100 + today2.getDate();
  const winner = top[(daySeed + birdOffset) % top.length];

  console.log('🐦 Winner:', winner?.bird?.filename, 'score:', winner?.score);
  if (!winner) return { url: getFallbackBird(), reason: null };

  return { url: WEATHERBIRD_BASE_URL + winner.bird.filename, reason: winReason, holidayName: matchSource === 'holiday' ? holidayName : null };
}
