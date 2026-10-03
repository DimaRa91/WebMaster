import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';

// Instagram post 1080×1350 (4:5): "grey cargo vs white delivery" comparison banner.
// Facts only from the brief: Vilnius 14–21 days, Rimini 18–25 days, white customs, documents.

const B = {
  bg: '#F7F4EF',
  ink: '#1B1B1F',
  grey: '#5E5F66',
  orange: '#F26A21',
  orangeDark: '#C94E10',
  red: '#E0262F',
};
const HEAD = 'Oswald, sans-serif';
const BODY = 'Manrope, sans-serif';

const Badge: React.FC<{ok: boolean}> = ({ok}) => (
  <div style={{width: 92, height: 92, borderRadius: 46, border: `6px solid ${ok ? '#fff' : B.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto'}}>
    <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={ok ? '#fff' : B.red} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
      {ok ? <path d="M4 12.5l5 5L20 6.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  </div>
);

const Card: React.FC<{ok: boolean}> = ({ok}) => {
  const fg = ok ? '#fff' : B.ink;
  return (
    <div style={{position: 'relative', width: 470, height: 860, borderRadius: 30, overflow: 'hidden', background: ok ? B.orange : '#fff', boxShadow: ok ? '0 24px 50px rgba(242,106,33,0.35)' : '0 18px 40px rgba(0,0,0,0.10)'}}>
      {/* photo in the lower part */}
      <Img
        src={staticFile(ok ? 'banners/truck.jpg' : 'banners/port.jpg')}
        style={{position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: 440, objectFit: 'cover', maskImage: 'linear-gradient(180deg, transparent 0%, #000 55%)', WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, #000 55%)', objectPosition: ok ? '62% 50%' : '30% 50%', filter: ok ? 'saturate(1.15) sepia(0.25) hue-rotate(-12deg) contrast(1.05)' : 'grayscale(1) contrast(1.1) brightness(0.95)'}}
      />
      <div style={{position: 'relative', paddingTop: 44, textAlign: 'center', color: fg}}>
        <Badge ok={ok} />
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 54, lineHeight: 1.02, marginTop: 26, textTransform: 'uppercase'}}>
          {ok ? 'Белая' : 'Серое'}
          <br />
          {ok ? 'доставка' : 'карго'}
        </div>
        <div style={{width: 230, height: 3, background: ok ? 'rgba(255,255,255,0.8)' : B.orange, margin: '20px auto 0'}} />
        {ok ? (
          <>
            <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: 34, marginTop: 22, textTransform: 'uppercase'}}>из Вильнюса</div>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 118, lineHeight: 1, marginTop: 4}}>14–21</div>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 40, textTransform: 'uppercase'}}>день до Москвы</div>
          </>
        ) : (
          <>
            <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: 34, marginTop: 22, textTransform: 'uppercase', color: B.grey}}>товар приходит</div>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 92, lineHeight: 1.04, marginTop: 4}}>БЕЗ</div>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 40, textTransform: 'uppercase'}}>документов</div>
          </>
        )}
      </div>
    </div>
  );
};

export const VsBanner: React.FC = () => (
  <AbsoluteFill style={{background: B.bg, fontFamily: BODY}}>
    {/* header */}
    <div style={{position: 'absolute', left: 0, right: 0, top: 46, textAlign: 'center'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26, fontFamily: HEAD, fontWeight: 700, fontSize: 104, lineHeight: 1, color: B.orange, letterSpacing: '0.01em'}}>
        ЕВРОПА
        <svg width={86} height={50} viewBox="0 0 86 50" fill="none" stroke={B.orange} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round"><path d="M6 25h68M54 6l20 19-20 19" /></svg>
        МОСКВА
      </div>
      <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 44, lineHeight: 1.1, color: B.ink, marginTop: 16, letterSpacing: '0.02em'}}>СРАВНИТЕ И ВЫБЕРИТЕ СПОКОЙСТВИЕ</div>
    </div>

    {/* cards */}
    <div style={{position: 'absolute', left: 50, right: 50, top: 236, display: 'flex', justifyContent: 'space-between'}}>
      <Card ok={false} />
      <Card ok />
    </div>
    {/* VS */}
    <div style={{position: 'absolute', left: 540 - 72, top: 236 + 330, width: 144, height: 144, borderRadius: 72, background: B.orange, border: `10px solid ${B.bg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: HEAD, fontWeight: 700, fontSize: 64, color: '#fff', boxShadow: '0 10px 24px rgba(0,0,0,0.18)'}}>VS</div>

    {/* left card notes over the photo */}
    <div style={{position: 'absolute', left: 50, width: 470, top: 236 + 860 - 120, padding: '0 26px', boxSizing: 'border-box'}}>
      <div style={{background: 'rgba(20,20,24,0.78)', borderRadius: 16, padding: '14px 18px', fontFamily: BODY, fontWeight: 700, fontSize: 25, lineHeight: 1.3, color: '#fff', textAlign: 'center'}}>Нельзя показать в учёте · риск задержки</div>
    </div>
    <div style={{position: 'absolute', left: 560, width: 470, top: 236 + 860 - 120, padding: '0 26px', boxSizing: 'border-box'}}>
      <div style={{background: 'rgba(20,20,24,0.78)', borderRadius: 16, padding: '14px 18px', fontFamily: BODY, fontWeight: 700, fontSize: 25, lineHeight: 1.3, color: '#fff', textAlign: 'center'}}>Из Римини — 18–25 дней · документы для бухгалтерии</div>
    </div>

    {/* bottom CTA */}
    <div style={{position: 'absolute', left: 50, right: 50, top: 1150, display: 'flex', alignItems: 'center', gap: 24}}>
      <div style={{flex: 1, fontFamily: BODY, fontWeight: 800, fontSize: 30, lineHeight: 1.3, color: B.ink}}>
        Сборные грузы от одной коробки
        <div style={{fontWeight: 500, fontSize: 26, color: B.grey}}>Белая растаможка · проверка на санкции</div>
      </div>
      <div style={{background: B.ink, borderRadius: 22, padding: '24px 30px', textAlign: 'center'}}>
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 38, lineHeight: 1, color: '#fff'}}>РАССЧИТАТЬ</div>
        <div style={{fontFamily: HEAD, fontWeight: 500, fontSize: 24, color: '#fff', marginTop: 6, letterSpacing: '0.04em'}}>СТОИМОСТЬ ДОСТАВКИ</div>
      </div>
    </div>
  </AbsoluteFill>
);
