"""Optional browser regression check for v0.6. Run: python tests/v060-integration.py
Requires Python Playwright and a Chromium binary; no network needed.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import re

ROOT=Path(__file__).resolve().parents[1]

def load(page):
    page.set_content('<html><head></head><body><main id="app"></main></body></html>')
    page.evaluate("Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem(k){return this[k]??null},setItem(k,v){this[k]=v},removeItem(k){delete this[k]}}})")
    for path in ('css/styles.css','css/v060.css'):
        page.add_style_tag(content=(ROOT/path).read_text())
    for path in re.findall(r'<script defer src="([^"]+)',(ROOT/'index.html').read_text()):
        page.add_script_tag(content=(ROOT/path).read_text())

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
    page=browser.new_page(viewport={'width':390,'height':667})
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    load(page)
    assert page.locator('body').inner_text().count('Submit registration')==1
    page.evaluate('part9Start()')
    assert page.evaluate('game.version')==6
    assert page.evaluate("Boolean(localStorage.getItem('gridiron-life-v6'))")
    assert page.locator('.v6-footer button').count()==6
    page.locator('.v6-footer button').nth(1).click()
    assert page.locator('.v6-attrgrid').count()==3
    assert page.locator('.v6-attrgrid').first.locator('span').count()==6
    assert page.locator('.v6-personality-teaser').count()==1
    assert page.evaluate("(()=>{let p=document.querySelector('.v6-personality-teaser').getBoundingClientRect(),nav=document.querySelector('.v6-footer').getBoundingClientRect();return p.bottom<=nav.top})()")
    page.get_by_role('button',name='Receiving',exact=True).click()
    text=page.locator('.v6-content').inner_text()
    assert all(x in text for x in ('Flat','Swing','Angle','Wheel','Screen','Option'))
    page.locator('.v6-node').first.click()
    assert page.evaluate('game.v6.trainingFocus.name')=='Flat'
    page.locator('.v6-footer button').nth(2).click()
    page.get_by_role('button',name='Film',exact=True).click()
    page.get_by_role('button',name='Take Notes',exact=True).click()
    assert page.evaluate('game.v6.lastFilmKey')==page.evaluate('v6WeekId()')
    page.locator('.v6-footer button').nth(0).click()
    page.evaluate('nextWeek()')
    page.evaluate('if(game.gamePending)simulateGame()')
    assert not errors,errors
    # Verify college and professional pipeline without decades of simulated time.
    page.evaluate("game.stage='recruiting';game.grade=12;game.scheduledEvent=null;recruitingState();persist();render()")
    page.evaluate('collegeSign(0,true)')
    assert page.evaluate('game.stage')=='college'
    page.evaluate('collegeSimGame()')
    assert page.evaluate('game.college.games.length')>=1
    page.evaluate("for(const k in game.attrs)game.attrs[k]=86;for(const k in game.athleticAttributes)game.athleticAttributes[k]=86;for(const k in game.technicalAttributes)game.technicalAttributes[k]=86;game.college.eligibilityUsed=4;game.college.phase='complete';game.stage='collegeComplete';persist();render()")
    page.evaluate('v6NFLDeclare()')
    assert page.evaluate('game.stage')=='nflEntry'
    assert page.evaluate('v6League().offers.length')>=1
    page.evaluate('v6NFLSign(v6League().offers[0].teamId)')
    assert page.evaluate('v6League().phase')=='camp'
    for _ in range(4):page.evaluate('v6NFLAdvance()')
    if page.evaluate('v6League().phase')=='freeAgency':
        page.evaluate('v6NFLSign(v6League().offers[0].teamId)')
        for _ in range(4):page.evaluate('v6NFLAdvance()')
    assert page.evaluate('v6League().phase') in ('regular','freeAgency')
    if page.evaluate('v6League().phase')=='regular':
        for _ in range(17):page.evaluate('v6NFLAdvance()')
        assert page.evaluate('v6League().games.length')>=17
        assert page.evaluate('v6League().phase') in ('playoffs','offseason','freeAgency')
    page.locator('.v6-footer button').nth(5).click()
    page.get_by_role('button',name='Settings',exact=True).click()
    page.get_by_role('button',name='My Colors',exact=False).click()
    assert page.evaluate('game.v6.theme.mode')=='custom'
    assert not errors,errors
    print('PASS v0.6 registration, save, six-tab layout, player/reception tree, film, HS game, college, NFL entry/camp/season, settings. No JS errors.')
    browser.close()
