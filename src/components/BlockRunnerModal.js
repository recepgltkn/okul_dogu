import React, { useEffect, useRef, useState } from 'react';
import { loadGameState, saveGameState, saveStudentReport } from '../firebase';

export default function BlockRunnerModal({ open, onClose, userId, isTeacher = false }){
  const iframeRef = useRef(null);
  const rootRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    function handleMessage(e){
      const data = e && e.data;
      if(!data || typeof data !== 'object') return;
      if(data.type === 'GAME_UPDATE'){
        // iframe tells us the full levels array (or partial). Persist it.
        (async ()=>{
          try{ await saveGameState(userId, { levels: data.levels, savedAt: Date.now() }); }catch(e){}
        })();
      }
      else if(data.type === 'LEVEL_COMPLETED'){
        (async ()=>{
          try{
            // Persist overall game state
            await saveGameState(userId, { levels: data.levels, lastCompletedLevel: data.levelId, lastXP: data.xp, lastPercent: data.percent, savedAt: Date.now() });
            // Update student report entry
            await saveStudentReport(userId, { xp: data.xp, percent: data.percent });
          }catch(e){ console.warn(e); }
        })();
      }
    }
    window.addEventListener('message', handleMessage);
    return ()=> window.removeEventListener('message', handleMessage);
  }, [userId]);

  useEffect(()=>{
    if(open){
      // load saved state from Firestore and send to iframe
      setLoading(true);
      (async ()=>{
        try{
          const saved = await loadGameState(userId);
          const payload = (saved && saved.levels) ? saved.levels : null;
          // post to iframe when ready
          setTimeout(()=>{
            try{
              if(iframeRef.current && iframeRef.current.contentWindow){
                iframeRef.current.contentWindow.postMessage({ type: 'LOAD_STATE', levels: payload }, '*');
              }
            }catch(e){ console.warn(e); }
            setLoading(false);
          }, 250);
        }catch(e){ setLoading(false); }
      })();
    }
  }, [open, userId]);

    // When modal opens, tell iframe to disable or enable side menu depending on role
    useEffect(()=>{
      if(open && iframeRef.current && iframeRef.current.contentWindow){
        try{
          if(isTeacher) iframeRef.current.contentWindow.postMessage({ type: 'ENABLE_MENU' }, '*');
          else iframeRef.current.contentWindow.postMessage({ type: 'DISABLE_MENU' }, '*');
        }catch(e){}
      }
      // when closing ensure menu restored
      return ()=>{
        try{ if(iframeRef.current && iframeRef.current.contentWindow) iframeRef.current.contentWindow.postMessage({ type: 'ENABLE_MENU' }, '*'); }catch(e){}
      };
    }, [open, isTeacher]);

  if(!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1200, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'stretch', justifyContent:'center' }}>
      <div style={{ background:'#fff', width:'100%', maxWidth:1200, margin:'auto', height:'100%', borderRadius:6, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div ref={rootRef} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:12, background:'#0f1724', color:'#fff' }}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <div style={{fontWeight:600}}>Blok Kodlama - Grid Runner</div>
            {loading? <span style={{marginLeft:6, opacity:0.9}}>Yükleniyor...</span> : null}
          </div>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <button onClick={()=>{ try{ iframeRef.current.contentWindow.postMessage({ type:'RUN' }, '*'); }catch(e){} }} title="Başlat" style={{padding:'6px 8px'}}>Başlat</button>
            <button onClick={()=>{ try{ iframeRef.current.contentWindow.postMessage({ type:'STEP' }, '*'); }catch(e){} }} title="Adım" style={{padding:'6px 8px'}}>Adım</button>
            <button onClick={()=>{
              try{ iframeRef.current.contentWindow.postMessage({ type:'REQUEST_SAVE' }, '*'); setSaving(true); setTimeout(()=>setSaving(false),800); }catch(e){ setSaving(false); }
            }} title="Kaydet" style={{padding:'6px 8px'}}>{saving? 'Kaydediliyor...' : 'Kaydet'}</button>
            <button onClick={()=>{ setConfirmOpen(true); }} title="Çık" style={{padding:'6px 8px'}}>Çık</button>
            <button onClick={()=>{
              try{
                if(rootRef.current){
                  const el = rootRef.current.closest('div[style]');
                  if(el){
                    if(!document.fullscreenElement) el.requestFullscreen().catch(()=>{});
                    else document.exitFullscreen().catch(()=>{});
                  }
                }
              }catch(e){}
            }} title="Tam Ekran" style={{padding:'6px 8px'}}>Tam Ekran</button>

            <button onClick={()=>{ setConfirmOpen(true); }} aria-label="Kapat" style={{background:'transparent', border:'none', color:'#fff', fontSize:18, padding:6, marginLeft:6}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18 6L6 18M6 6l12 12" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>
        <iframe ref={iframeRef} title="block-runner" src="/block-grid-runner/index.html" style={{ border:0, flex:1, width:'100%' }} />

        {confirmOpen ? (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <div style={{ background:'#fff', padding:18, borderRadius:8, width:420, boxShadow:'0 8px 30px rgba(2,6,23,0.4)' }}>
              <h3 style={{marginTop:0}}>Uygulamayı kapmak istiyor musunuz?</h3>
              <p>Bu pencere kapatılırsa iframe içindeki kaydedilmemiş veriler kaybolabilir. "Kaydet ve Çık" seçeneğini kullanırsanız veriler yedeklenir.</p>
              <p style={{color:'#b91c1c', fontWeight:600}}>Not: Veriler kaydolmayacak seçeneğini seçerseniz yapılan değişiklikler kaybolacaktır.</p>
              <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:12}}>
                <button onClick={()=>{ setConfirmOpen(false); }} style={{padding:'6px 10px'}}>İptal</button>
                <button onClick={()=>{ try{ iframeRef.current.contentWindow.postMessage({ type:'REQUEST_SAVE' }, '*'); setSaving(true); setTimeout(()=>{ setSaving(false); setConfirmOpen(false); onClose(); }, 700); }catch(e){ setConfirmOpen(false); onClose(); } }} style={{padding:'6px 10px'}}>Kaydet ve Çık</button>
                <button onClick={()=>{ setConfirmOpen(false); onClose(); }} style={{padding:'6px 10px', background:'#f3f4f6'}}>Çık (Kaydetme)</button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
