/* ImageSlot.jsx — user-fillable image: tap to take a photo (camera) or import
   from the gallery. Persists via photoStore. */
import React from 'react';
import { T, Icon } from './theme.jsx';
import { getPhoto, setPhoto, subscribe, fileToDataUrl } from './photoStore.js';

export function ImageSlot({ id, shape = 'rounded', radius = 12, placeholder = 'Ajouter une photo', style }) {
  const [, bump] = React.useReducer((x) => x + 1, 0);
  const [over, setOver] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const cameraRef = React.useRef(null);
  const fileRef = React.useRef(null);

  React.useEffect(() => subscribe(bump), []);

  const url = getPhoto(id);
  const br = shape === 'circle' ? '50%' : shape === 'pill' ? 9999 : radius;

  const ingest = async (file) => {
    if (!file || !/^image\//.test(file.type)) return;
    try { setPhoto(id, await fileToDataUrl(file)); } catch { /* ignore */ }
  };

  const onInput = (e) => { const f = e.target.files && e.target.files[0]; if (f) ingest(f); e.target.value = ''; };

  return (
    <>
      <div
        onClick={() => setMenu(true)}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); ingest(e.dataTransfer.files && e.dataTransfer.files[0]); }}
        style={{
          position: 'relative', overflow: 'hidden', borderRadius: br, cursor: 'pointer',
          background: 'rgba(0,0,0,.04)', display: 'block', userSelect: 'none',
          outline: over ? `2px solid ${T.mintDk}` : 'none', outlineOffset: -2, ...style,
        }}
      >
        {url ? (
          <img src={url} alt="" draggable="false"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 5, textAlign: 'center',
            padding: 8, color: T.ink3,
          }}>
            <Icon name="camera" size={20} color={T.ink3} sw={2} />
            <span style={{ fontSize: 10.5, fontWeight: 700, lineHeight: 1.2, maxWidth: '90%' }}>{placeholder}</span>
          </div>
        )}
      </div>

      {/* Caméra (capture direct) + galerie */}
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={onInput} />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onInput} />

      {menu && (
        <div onClick={() => setMenu(false)} style={{
          position: 'fixed', inset: 0, zIndex: 2147483647, display: 'flex',
          alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(14,26,20,.45)',
          backdropFilter: 'blur(2px)', animation: 'fadeIn .2s .02s forwards',
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: '100%', maxWidth: 420, margin: '0 12px calc(12px + env(safe-area-inset-bottom))',
            background: '#fff', borderRadius: 22, padding: 8,
            boxShadow: '0 20px 50px rgba(0,0,0,.3)', animation: `sheetUp .35s ${T.spring} .02s forwards`,
            fontFamily: T.font,
          }}>
            <MenuBtn icon="camera" label="Prendre une photo" onClick={() => { setMenu(false); cameraRef.current && cameraRef.current.click(); }} />
            <MenuBtn icon="grid" label="Importer une photo" onClick={() => { setMenu(false); fileRef.current && fileRef.current.click(); }} />
            {url && <MenuBtn icon="x" label="Supprimer la photo" danger onClick={() => { setMenu(false); setPhoto(id, null); }} />}
            <div onClick={() => setMenu(false)} className="presslite" style={{ textAlign: 'center', padding: '14px', fontSize: 15, fontWeight: 800, color: T.ink3, cursor: 'pointer' }}>Annuler</div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuBtn({ icon, label, onClick, danger }) {
  return (
    <div onClick={onClick} className="presslite" style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '15px 16px', borderRadius: 16,
      cursor: 'pointer', color: danger ? T.coral : T.ink,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? T.coralSoft : T.mintSoft }}>
        <Icon name={icon} size={21} color={danger ? T.coral : T.mintDk} sw={2.3} />
      </div>
      <span style={{ fontSize: 15.5, fontWeight: 800 }}>{label}</span>
    </div>
  );
}
