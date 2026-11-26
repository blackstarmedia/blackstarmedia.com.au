"""Turn a transcript (words.json) into icon / zoom events. Shared by overlay.py and make_plan.py."""
import random, re

# spoken word -> (icon, label)
KEYWORDS = {
    'idea': ('bulb', 'IDEA'), 'ideas': ('bulb', 'IDEAS'), 'concept': ('bulb', 'CONCEPT'), 'creative': ('bulb', 'CREATIVE'), 'learn': ('bulb', 'LEARN'),
    'song': ('note', 'SONG'), 'songs': ('note', 'SONGS'), 'music': ('wave', 'MUSIC'), 'track': ('wave', 'TRACK'), 'audio': ('wave', 'AUDIO'), 'beat': ('wave', 'BEAT'),
    'lyrics': ('pen', 'LYRICS'), 'write': ('pen', 'WRITE'), 'script': ('pen', 'SCRIPT'), 'prompt': ('pen', 'PROMPT'),
    'video': ('video', 'VIDEO'), 'videos': ('video', 'VIDEOS'), 'film': ('video', 'FILM'), 'footage': ('video', 'FOOTAGE'), 'youtube': ('play', 'YOUTUBE'), 'visuals': ('play', 'VISUALS'),
    'money': ('coin', 'MONEY'), 'revenue': ('coin', 'REVENUE'), 'income': ('coin', 'INCOME'), 'profit': ('coin', 'PROFIT'), 'paid': ('coin', 'PAID'), 'sell': ('coin', 'SELL'),
    'marketing': ('mega', 'MARKETING'), 'promote': ('mega', 'PROMOTE'), 'ads': ('mega', 'ADS'), 'announce': ('mega', 'NEWS'), 'news': ('mega', 'NEWS'),
    'growth': ('chart', 'GROWTH'), 'grow': ('chart', 'GROW'), 'viable': ('chart', 'VIABLE'), 'views': ('chart', 'VIEWS'), 'results': ('chart', 'RESULTS'), 'subscribers': ('chart', 'SUBS'),
    'mind': ('bolt', 'MIND BLOWN'), 'wow': ('bolt', 'WOW'), 'crazy': ('bolt', 'CRAZY'), 'insane': ('bolt', 'INSANE'), 'fast': ('bolt', 'FAST'), 'instantly': ('bolt', 'INSTANT'),
    'voice': ('mic', 'VOICE'), 'sing': ('mic', 'SING'), 'songwriter': ('mic', 'SONGWRITER'), 'podcast': ('mic', 'PODCAST'), 'record': ('mic', 'RECORD'), 'hobby': ('mic', 'HOBBY'),
    'platform': ('layers', 'PLATFORM'), 'tool': ('layers', 'TOOL'), 'tools': ('layers', 'TOOLS'), 'app': ('layers', 'APP'), 'workflow': ('layers', 'WORKFLOW'), 'feature': ('layers', 'FEATURE'),
    'try': ('cursor', 'TRY IT'), 'click': ('cursor', 'CLICK'), 'subscribe': ('cursor', 'SUBSCRIBE'), 'link': ('cursor', 'LINK'), 'download': ('cursor', 'DOWNLOAD'),
    'love': ('heart', 'LOVE'),
}
STARS = {'incredible', 'amazing', 'awesome', 'fantastic', 'best', 'brilliant'}
SLOTS = (0.5, 0.82, 0.18)       # x positions of the top row; y is 0.13 of the height
ITEM_LEN, GAP, SAME_ICON = 2.0, 1.1, 4.0

def clean(w): return re.sub(r"[^a-z']", '', w.lower())

def events(words, T):
    """-> list of dicts: t0, t1, kind ('item'|'stars'), icon, label, x (fraction), tilt."""
    rnd = random.Random(7); ev = []; slot_free = [0.0] * len(SLOTS); last_icon = {}; last_t = -9.0
    for w in words:
        k = clean(w['w']); t = w['s']
        if t < 0.4 or t > T - 0.3 or t - last_t < GAP: continue
        if k in STARS:
            if max(slot_free) <= t + 0.8:
                ev.append(dict(t0=t, t1=t + 2.6, kind='stars', icon='star', label=k.upper(), x=0.5, tilt=0)); slot_free = [t + 2.9] * len(SLOTS); last_t = t
            continue
        if k not in KEYWORDS: continue
        icon, lab = KEYWORDS[k]
        if t - last_icon.get(icon, -99) < SAME_ICON: continue
        free = [i for i, f in enumerate(slot_free) if f <= t]
        if not free: continue
        i = free[0]; slot_free[i] = t + ITEM_LEN + 0.3; last_icon[icon] = t; last_t = t
        ev.append(dict(t0=t, t1=t + ITEM_LEN, kind='item', icon=icon, label=lab, x=SLOTS[i], tilt=rnd.choice((-12, -8, 8, 12))))
    return ev
