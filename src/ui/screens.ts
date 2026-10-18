import { ABILITY_INFO, ABILITY_ORDER, type Levels } from '../game/abilities';
import { ABILITY_PRICES } from '../const';

const REPO_URL = 'https://github.com/0xF1o/sorty';

function buildStamp(): { local: string; utc: string } {
  const utc = typeof __BUILD_TIME__ === 'string' ? __BUILD_TIME__ : new Date().toISOString();
  const d = new Date(utc);
  const local = Number.isNaN(d.getTime()) ? utc : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  return { local, utc };
}

export function titleHtml(): string {
  const { local, utc } = buildStamp();
  return `<div class="panel">
    <h1>SORTY</h1>
    <p class="tagline">Everything is on the floor. Put it on a shelf.</p>
    <ul class="controls">
      <li><b>WASD</b> walk &nbsp;/&nbsp; <b>Mouse</b> look</li>
      <li><b>Left click</b> pick up &nbsp;/&nbsp; <b>Right click</b> place</li>
      <li><b>R</b> rotate &nbsp;/&nbsp; <b>Q</b> highlight &nbsp;/&nbsp; <b>F</b> tidy &nbsp;/&nbsp; <b>Space</b> magnet</li>
      <li><b>Shift</b> sprint &nbsp;/&nbsp; <b>Esc</b> pause</li>
    </ul>
    <p class="sub">Every item has one category and every shelf has one card. Carry it over, put it in any free slot, get paid. Three shifts, then shop for upgrades.</p>
    <button id="start" class="primary big">Start shift 1</button>
    <p class="meta">build <span title="UTC ${utc}">${local}</span> &nbsp;/&nbsp; <a href="${REPO_URL}" target="_blank" rel="noopener noreferrer">github.com/0xF1o/sorty</a></p>
  </div>`;
}

export function pauseHtml(): string {
  return `<div class="panel">
    <h2>Paused</h2>
    <button id="resume" class="primary">Resume</button>
    <p class="sub">The clock is stopped while the mouse is free.</p>
  </div>`;
}

export function shopHtml(levels: Levels, money: number, sec: number): string {
  const rows = ABILITY_ORDER.map((id) => {
    const lvl = levels[id];
    const info = ABILITY_INFO[id];
    const maxed = lvl >= 3;
    const price = maxed ? 0 : ABILITY_PRICES[lvl] ?? 0;
    const next = info.tiers[Math.min(lvl, 2)];
    const button = maxed
      ? '<span class="owned">MAXED</span>'
      : `<button data-buy="${id}" class="buy" ${money < price ? 'disabled' : ''}>$${price}</button>`;
    return `<div class="shop-row">
      <div class="shop-name"><span>${info.name}</span><span class="lvl">Lv ${lvl}/3</span>
        <div class="hint">${next}</div></div>
      ${button}
    </div>`;
  }).join('');
  return `<div class="panel wide">
    <div class="shop-head"><h2>Upgrades</h2><div class="shop-money">$${money}</div></div>
    <div class="shop-list">${rows}</div>
    <div class="shop-foot"><span class="sub">Next shift in <span id="shop-timer">${Math.ceil(sec)}</span>s</span>
      <button id="next-shift" class="primary">Next shift</button></div>
  </div>`;
}

export function resultsHtml(money: number, best: number, placed: number, wrong: number, min: string): string {
  const acc = placed + wrong === 0 ? 100 : Math.round((placed / (placed + wrong)) * 100);
  return `<div class="panel">
    <h2>Shift over</h2>
    <div class="results">
      <div><b>$${money}</b><span>earned</span></div>
      <div><b>${placed}</b><span>sorted</span></div>
      <div><b>${acc}%</b><span>accuracy</span></div>
      <div><b>${min}</b><span>time</span></div>
    </div>
    <p class="sub">${money >= best ? 'New best run.' : `Best run: $${best}`}</p>
    <button id="restart" class="primary big">Play again</button>
  </div>`;
}
