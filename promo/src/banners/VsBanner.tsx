import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

// Instagram posts 1080×1350 (4:5): two-card comparison banners.
// Facts only from the brief (terms, warehouses, services) — no invented competitor numbers.

const B = {
  bg: '#F7F4EF',
  ink: '#1B1B1F',
  grey: '#5E5F66',
  orange: '#F26A21',
  red: '#E0262F',
};
const HEAD = 'Oswald, sans-serif';
const BODY = 'Manrope, sans-serif';

type Look = 'gray' | 'warm' | 'natural';
type CardSpec = {
  mark: 'ok' | 'no';
  accent: boolean; // orange card
  title: [string, string];
  kicker: string;
  big: string;
  bigSize?: number;
  unit: string;
  photo: string;
  pos: string;
  look: Look;
  note: string;
};
export type BannerSpec = {from: string; to: string; sub: string; left: CardSpec; right: CardSpec; footer: [string, string]};

const FILTERS: Record<Look, string> = {
  gray: 'grayscale(1) contrast(1.1) brightness(0.95)',
  warm: 'saturate(1.15) sepia(0.25) hue-rotate(-12deg) contrast(1.05)',
  natural: 'saturate(1.05) contrast(1.05)',
};

const Badge: React.FC<{mark: 'ok' | 'no'; color: string}> = ({mark, color}) => (
  <div style={{width: 92, height: 92, borderRadius: 46, border: `6px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
    <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      {mark === 'ok' ? <path d="M4 12.5l5 5L20 6.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  </div>
);

const Card: React.FC<{c: CardSpec}> = ({c}) => {
  const fg = c.accent ? '#fff' : B.ink;
  const badge = c.accent ? '#fff' : c.mark === 'ok' ? B.orange : B.red;
  return (
    <div style={{position: 'relative', width: 470, height: 860, borderRadius: 30, overflow: 'hidden', background: c.accent ? B.orange : '#fff', boxShadow: c.accent ? '0 24px 50px rgba(242,106,33,0.35)' : '0 18px 40px rgba(0,0,0,0.10)'}}>
      <Img
        src={staticFile(c.photo)}
        style={{position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 440, objectFit: 'cover', objectPosition: c.pos, filter: FILTERS[c.look], maskImage: 'linear-gradient(180deg, transparent 0%, #000 55%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 55%)'}}
      />
      <div style={{position: 'relative', paddingTop: 44, textAlign: 'center', color: fg}}>
        <Badge mark={c.mark} color={badge} />
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 54, lineHeight: 1.02, marginTop: 26, textTransform: 'uppercase'}}>
          {c.title[0]}
          <br />
          {c.title[1]}
        </div>
        <div style={{width: 230, height: 3, background: c.accent ? 'rgba(255,255,255,0.8)' : B.orange, margin: '20px auto 0'}} />
        <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: 34, marginTop: 22, textTransform: 'uppercase', color: c.accent ? '#fff' : B.grey}}>{c.kicker}</div>
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: c.bigSize ?? 118, lineHeight: 1, marginTop: 4}}>{c.big}</div>
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 40, textTransform: 'uppercase'}}>{c.unit}</div>
      </div>
      <div style={{position: 'absolute', left: 26, right: 26, bottom: 30, background: 'rgba(20,20,24,0.78)', borderRadius: 16, padding: '14px 18px', fontFamily: BODY, fontWeight: 700, fontSize: 25, lineHeight: 1.3, color: '#fff', textAlign: 'center'}}>{c.note}</div>
    </div>
  );
};

export const Banner: React.FC<{s: BannerSpec}> = ({s}) => (
  <AbsoluteFill style={{background: B.bg, fontFamily: BODY}}>
    <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, fontFamily: HEAD, fontWeight: 700, fontSize: 104, lineHeight: 1, color: B.orange, letterSpacing: '0.01em'}}>
        {s.from}
        <svg width={86} height={50} viewBox="0 0 86 50" fill="none" stroke={B.orange} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"><path d="M6 25h68M54 6l20 19-20 19" /></svg>
        {s.to}
      </div>
      <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: B.ink, marginTop: 16, letterSpacing: '0.02em'}}>{s.sub}</div>
    </div>

    <div style={{position: 'absolute', left: 50, right: 50, top: 236, display: 'flex', justifyContent: 'space-between'}}>
      <Card c={s.left} />
      <Card c={s.right} />
    </div>
    <div style={{position: 'absolute', left: 540 - 72, top: 236 + 330, width: 144, height: 144, borderRadius: 72, background: B.orange, border: `10px solid ${B.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 64, color: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.18)'}}>VS</div>

    <div style={{position: 'absolute', left: 50, right: 50, top: 1150, display: 'flex', alignItems: 'center', gap: 24}}>
      <div style={{flex: 1, fontFamily: BODY, fontWeight: 800, fontSize: 30, lineHeight: 1.3, color: B.ink}}>
        {s.footer[0]}
        <div style={{fontWeight: 500, fontSize: 26, color: B.grey}}>{s.footer[1]}</div>
      </div>
      <div style={{background: B.ink, borderRadius: 22, padding: '24px 30px', textAlign: 'center'}}>
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 38, lineHeight: 1, color: '#fff'}}>РАССЧИТАТЬ</div>
        <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: 24, color: '#fff', marginTop: 6, letterSpacing: '0.04em'}}>СТОИМОСТЬ ДОСТАВКИ</div>
      </div>
    </div>
  </AbsoluteFill>
);

export const BANNERS: Record<string, BannerSpec> = {
  // 1. grey cargo vs white delivery
  Vs: {
    from: 'ЕВРОПА',
    to: 'МОСКВА',
    sub: 'СРАВНИТЕ И ВЫБЕРИТЕ СПОКОЙСТВИЕ',
    left: {mark: 'no', accent: false, title: ['Серое', 'карго'], kicker: 'товар приходит', big: 'БЕЗ', bigSize: 92, unit: 'документов', photo: 'banners/port.jpg', pos: '30% 50%', look: 'gray', note: 'Нельзя показать в учёте · риск задержки'},
    right: {mark: 'ok', accent: true, title: ['Белая', 'доставка'], kicker: 'из Вильнюса', big: '14–21', unit: 'день до Москвы', photo: 'banners/truck.jpg', pos: '62% 50%', look: 'warm', note: 'Из Римини — 18–25 дней · документы для бухгалтерии'},
    footer: ['Сборные грузы от одной коробки', 'Белая растаможка · проверка на санкции'],
  },
  // 2. China: auto vs rail
  China: {
    from: 'КИТАЙ',
    to: 'МОСКВА',
    sub: 'ГУАНЧЖОУ: ВЫБЕРИТЕ СВОЙ ВАРИАНТ',
    left: {mark: 'ok', accent: false, title: ['Железная', 'дорога'], kicker: 'в пути', big: '35–45', unit: 'дней до Москвы', photo: 'banners/moscow.jpg', pos: '45% 50%', look: 'natural', note: 'Гуанчжоу → Москва по железной дороге'},
    right: {mark: 'ok', accent: true, title: ['Авто', 'доставка'], kicker: 'в пути', big: '25–30', unit: 'дней до Москвы', photo: 'banners/truck.jpg', pos: '62% 50%', look: 'warm', note: 'Быстрее по земле · срочно — организуем авиа'},
    footer: ['Отправки каждую неделю', 'Белая растаможка · «Честный знак» закажем'],
  },
  // 3. Rimini vs Vilnius
  Warehouses: {
    from: 'ЕВРОПА',
    to: 'МОСКВА',
    sub: 'ДВА СКЛАДА КОНСОЛИДАЦИИ',
    left: {mark: 'ok', accent: false, title: ['Склад', 'Римини'], kicker: 'Италия', big: '18–25', unit: 'дней до Москвы', photo: 'banners/truck.jpg', pos: '35% 50%', look: 'natural', note: 'Мебель Пезаро, плитка Сассуоло, обувь Марке'},
    right: {mark: 'ok', accent: true, title: ['Склад', 'Вильнюс'], kicker: 'Германия, Польша, ЕС', big: '14–21', unit: 'день до Москвы', photo: 'banners/moscow.jpg', pos: '50% 50%', look: 'natural', note: 'Груз копится на складе и едет одной партией'},
    footer: ['Сами заберём груз с фабрики', 'Упаковка · обрешётка · страхование'],
  },
  // 4. full truck vs consolidated cargo
  Groupage: {
    from: 'ЕВРОПА',
    to: 'МОСКВА',
    sub: 'ЗА ЧТО ВЫ ПЛАТИТЕ, КОГДА ВЕЗЁТЕ НЕМНОГО',
    left: {mark: 'no', accent: false, title: ['Отдельная', 'машина'], kicker: 'вы платите', big: 'ЗА ВСЮ', bigSize: 92, unit: 'машину', photo: 'banners/port.jpg', pos: '70% 50%', look: 'gray', note: 'Даже если везёте несколько паллет'},
    right: {mark: 'ok', accent: true, title: ['Сборный', 'груз'], kicker: 'вы платите', big: 'ЗА СВОЁ', bigSize: 92, unit: 'место', photo: 'banners/truck.jpg', pos: '62% 50%', look: 'warm', note: 'Любой объём — от одной коробки'},
    footer: ['Отправки каждую неделю', 'Европа и Китай → Москва'],
  },
};

export const VsBanner: React.FC<{id: string}> = ({id}) => <Banner s={BANNERS[id]} />;
