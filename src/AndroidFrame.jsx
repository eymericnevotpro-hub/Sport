/* AndroidFrame.jsx — clean phone container (Android HUD removed) */

const FRAME = {
  surface: '#f4fbf8',
  frameBorder: 'rgba(116,119,117,0.5)',
};

// Phone-shaped bezel only — no status bar, no gesture-nav pill.
export function AndroidDevice({ children, width = 412, height = 892, dark = false }) {
  return (
    <div style={{
      width, height, borderRadius: 40, overflow: 'hidden',
      background: dark ? '#1d1b20' : FRAME.surface,
      border: `8px solid ${FRAME.frameBorder}`,
      boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', boxSizing: 'border-box',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}
