"""Build the Town of Delafield homepage with the HELEN banner.

python tools/build.py            -> fetch the live homepage fresh, mirror its styles and images,
                                    insert the banner, write dist/
Events: tools/capture-events.mjs writes snapshot/events.html from the live page in the visible
port-9222 Chrome first (the Town fills its events list with a script we cannot run off-site).

Every navigation link and form points at the real www.townofdelafield.org. Styles, scripts and
images the page needs are copied under dist/ at the Town's own paths, so the copy looks right
and does not hot-link the Town's server. Nothing visible is added except the banner.
"""
import os, re, sys, shutil, urllib.request, urllib.parse, urllib.error, hashlib

TOWN = 'https://www.townofdelafield.org/'
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
DIST = os.path.join(REPO, 'docs')  # GitHub Pages serves main /docs
SNAP = os.path.join(REPO, 'snapshot')
UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130 Safari/537.36'}

def get(url, tries=3):
    import time
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (403, 404) or i == tries - 1:
                raise
        except Exception:
            if i == tries - 1:
                raise
        time.sleep(1.5)

def is_town(u):
    p = urllib.parse.urlparse(u)
    return p.netloc in ('www.townofdelafield.org', 'townofdelafield.org')

def local_path(u):
    p = urllib.parse.urlparse(u)
    return urllib.parse.unquote(p.path).lstrip('/')

mirrored = {}
def mirror(abs_url, depth=0):
    """Copy a Town asset to dist/<same path>; returns the page-relative path (query dropped)."""
    rel = local_path(abs_url)
    if not rel or rel.endswith('/'):
        return None
    if rel in mirrored:
        return mirrored[rel]
    dest = os.path.join(DIST, rel.replace('/', os.sep))
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    # Styles, scripts and images change rarely; keep a local cache so a re-take of the page
    # fetches only what is new (the Town's image host starts refusing after a burst).
    # FRESH=1 python tools/build.py ignores the cache.
    cache = os.path.join(SNAP, 'assets-cache', rel.replace('/', os.sep))
    if os.path.exists(cache) and not os.environ.get('FRESH'):
        data = open(cache, 'rb').read()
    else:
        try:
            try:
                data = get(abs_url.split('#')[0])
            except urllib.error.HTTPError as e1:
                # The Town's server redirects some images to its CMS host with an unencoded
                # space, which the CMS host refuses; ask the CMS host with the path encoded.
                if e1.code != 403:
                    raise
                data = get('https://cms2.revize.com/revize/townofdelafield/' + urllib.parse.quote(rel))
        except Exception as e:
            if os.path.exists(cache):
                data = open(cache, 'rb').read()
                print('  CACHED', rel, '(live fetch failed:', e, ')')
            else:
                print('  MISS', abs_url, e)
                mirrored[rel] = None
                return None
        os.makedirs(os.path.dirname(cache), exist_ok=True)
        with open(cache, 'wb') as f:
            f.write(data)
    if rel.lower().endswith('.css') and depth < 3:
        css = data.decode('utf-8', 'replace')
        def fix(m):
            q, ref = m.group(1), m.group(2).strip()
            if ref.startswith(('data:', '#')):
                return m.group(0)
            full = urllib.parse.urljoin(abs_url, ref)
            if not is_town(full):
                return m.group(0)
            loc = mirror(full, depth + 1)
            if not loc:
                return 'url(%s%s%s)' % (q, full, q)
            relref = os.path.relpath(loc, os.path.dirname(rel) or '.').replace(os.sep, '/')
            return 'url(%s%s%s)' % (q, relref, q)
        css = re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', fix, css)
        data = css.encode('utf-8')
    with open(dest, 'wb') as f:
        f.write(data)
    path = urllib.parse.quote(rel)
    mirrored[rel] = path
    return path

SKIP_SCHEMES = ('#', 'mailto:', 'tel:', 'javascript:', 'data:', 'sms:')

def main():
    # Empty dist/ but keep the folder itself (a local preview server may be sitting in it).
    os.makedirs(DIST, exist_ok=True)
    for name in os.listdir(DIST):
        p = os.path.join(DIST, name)
        shutil.rmtree(p) if os.path.isdir(p) else os.remove(p)
    html = get(TOWN).decode('utf-8', 'replace')
    os.makedirs(SNAP, exist_ok=True)
    with open(os.path.join(SNAP, 'town-homepage-raw.html'), 'w', encoding='utf-8') as f:
        f.write(html)
    print('fetched', len(html), 'chars, sha', hashlib.sha256(html.encode()).hexdigest()[:12])

    # 1. No <base>: we resolve every reference ourselves.
    html = re.sub(r'<base [^>]*>\s*', '', html, flags=re.I)

    # 2. Remove the CMS editor scripts (inline scripts that drive RZ edit buttons), the CMS
    #    helper and calendar loader, and the Town's own UserWay widget (their account key).
    def drop_script(m):
        body = m.group(0)
        if re.search(r'\bRZ(\.|list|link|action|\s*=)|typeof\(RZ\)|RZlist|RZaction', body):
            return ''
        if 'snippet_helper.js' in body or 'revize_calendar/index.v2.js' in body:
            return ''
        return body
    html = re.sub(r'<script\b[^>]*>.*?</script>', drop_script, html, flags=re.S | re.I)
    html = re.sub(r'<div id="ada-widget">.*?</div>', '', html, flags=re.S)
    html = re.sub(r'<div class="rz-btns-container">\s*</div>', '', html)
    # The Town's floating accessibility button only opens that UserWay widget; without it the
    # button would do nothing, so it goes too.
    html = html.replace('<button class="adaBtn"></button>', '')

    # 3. Search engines stay out.
    html = re.sub(r'<meta name="robots"[^>]*>', '<meta name="robots" content="noindex,nofollow">', html, flags=re.I)

    # 4. Links and forms go to the real Town site; assets are mirrored.
    def fix_attr(m):
        tag_start, attr, q, val = m.group(1), m.group(2), m.group(3), m.group(4)
        v = val.strip()
        if not v or v.startswith(SKIP_SCHEMES):
            return m.group(0)
        full = urllib.parse.urljoin(TOWN, v.replace('&amp;', '&'))
        tag = tag_start.lower()
        is_asset = (attr == 'src') or (tag == 'link' and attr == 'href')
        if is_asset and is_town(full):
            loc = mirror(full)
            if loc:
                return m.group(0).replace(q + val + q, q + loc + q)
        if not v.startswith(('http:', 'https:', '//')):
            return m.group(0).replace(q + val + q, q + full.replace('&', '&amp;') + q)
        return m.group(0)
    html = re.sub(r'<(\w+)\b[^>]*?\s(href|src|action)=(["\'])(.*?)\3', lambda m: fix_attr_wrap(m, fix_attr), html, flags=re.S)

    # Inline styles and data-style background images.
    def fix_style_url(m):
        q, ref = m.group(1), m.group(2)
        if ref.startswith(('data:', '#')):
            return m.group(0)
        full = urllib.parse.urljoin(TOWN, ref)
        if is_town(full):
            loc = mirror(full)
            if loc:
                return "url(%s%s%s)" % (q, loc, q)
            return "url(HB-MISSING)"
        return m.group(0)
    html = re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', fix_style_url, html)
    # A hero slide whose photo the Town's server will not hand out would show as a blank panel
    # behind the banner; leave that slide out.
    html, dropped = re.subn(r'<li class="tiny-item"><div [^>]*HB-MISSING[^>]*></div></li>', '', html)
    if dropped:
        print('  dropped', dropped, 'hero slide(s) with no photo')

    # 5. Events: the list the Town's calendar script builds, captured from the live page.
    ev_path = os.path.join(SNAP, 'events.html')
    if os.path.exists(ev_path):
        ev = open(ev_path, encoding='utf-8').read()
        html = html.replace('<div id="mini-events" data-template-file="template.html"></div>',
                            '<div id="mini-events" data-template-file="template.html">' + ev + '</div>')
        for img in set(re.findall(r'src="([^"]+)"', ev)):
            mirror(urllib.parse.urljoin(TOWN, img))
    else:
        print('  WARN no snapshot/events.html - run tools/capture-events.mjs first')

    # Files the Town's scripts load by name at run time (slider arrows, events arrows).
    for extra in ['_assets_/images/angle-left.png', '_assets_/images/angle-right.png',
                  '_assets_/images/arrow_back_ios.png', '_assets_/images/arrow_forward_ios.png']:
        mirror(TOWN + extra)

    # 6. The HELEN banner replaces the Welcome caption inside the hero.
    banner = open(os.path.join(REPO, 'banner', 'banner.html'), encoding='utf-8').read()
    new, n = re.subn(r'<div id="slider-caption">.*?<!--/\.Slider Caption-->', banner, html, flags=re.S)
    if n != 1:
        sys.exit('FAIL: Welcome caption not found exactly once (%d)' % n)
    html = new
    css = '<link rel="stylesheet" href="helen/banner.css">\n'
    html = html.replace('</head>', css + '</head>', 1)
    boot = ("<script>if(typeof RZRenderMini==='function'){RZRenderMini([]);}</script>\n"
            '<script src="helen/banner.js"></script>\n')
    html = html.replace('</body>', boot + '</body>', 1)

    # 7. Banner assets.
    hd = os.path.join(DIST, 'helen')
    os.makedirs(hd, exist_ok=True)
    for f in ['banner.css', 'banner.js', 'helen-maple-poster.jpg',
              'helen-maple-intro-town.mp4', 'helen-maple-intro-town.vtt']:
        shutil.copy2(os.path.join(REPO, 'banner', f), os.path.join(hd, f))

    with open(os.path.join(DIST, 'index.html'), 'w', encoding='utf-8', newline='\n') as f:
        f.write(html)
    with open(os.path.join(DIST, 'robots.txt'), 'w', newline='\n') as f:
        f.write('User-agent: *\nDisallow: /\n')
    open(os.path.join(DIST, '.nojekyll'), 'w').close()
    with open(os.path.join(DIST, 'CNAME'), 'w', newline='\n') as f:
        f.write('town.helenmaple.com\n')
    print('mirrored', sum(1 for v in mirrored.values() if v), 'files; missed', sum(1 for v in mirrored.values() if not v))
    print('wrote', os.path.join(DIST, 'index.html'))

def fix_attr_wrap(m, fn):
    return fn(m)

if __name__ == '__main__':
    main()
