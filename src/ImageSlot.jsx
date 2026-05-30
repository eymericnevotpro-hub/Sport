/* ImageSlot.jsx — user-fillable image placeholder (click to browse, drag to drop).
   Visual parity with the prototype's <image-slot>; persists via photoStore. */
import React from 'react';
import { T, Icon } from './theme.jsx';
import { getPhoto, setPhoto, subscribe, fileToDataUrl } from './photoStore.js';

export function ImageSlot({ id, shape = 'rounded', radius = 12, placeholder = 'Ajouter une photo', style }) {
  const [, bump] = React.useReducer((x) => x + 1, 0);
  const [over, setOver] = React.useState(false);
  const inputRef = React.useRef(null);

  React.useEffect(() => subscribe(bump), []);

  const url = getPhoto(id);
  const br = shape === 'circle' ? '50%' : shape === 'pill' ? 9999 : radius;

  const ingest = async (file) => {
    if (!file || !/^image\//.test(file.type)) return;
    try { setPhoto(id, await fileToDataUrl(file)); } catch { /* ignore */ }
  };

  return (
    <div
      onClick={() => inputRef.current && inputRef.current.click()}
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
      <input ref={inputRef} type="file" accept="image/*" hidden
        onChange={(e) => { const f = e.target.files && e.target.files[0]; if (f) ingest(f); e.target.value = ''; }} />
    </div>
  );
}
