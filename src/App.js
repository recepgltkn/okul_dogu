import React, { useEffect, useState } from 'react';
import './App.css';
import BlockRunnerModal from './components/BlockRunnerModal';
import { getAuthInstance } from './firebase';

function App(){
  const [modalOpen, setModalOpen] = useState(false);
  const [userId, setUserId] = useState('guest');

  useEffect(()=>{
    try{
      const auth = getAuthInstance();
      if(auth && auth.currentUser){ setUserId(auth.currentUser.uid); }
      else if(auth){
        // listen for changes briefly
        const unsub = auth.onAuthStateChanged && auth.onAuthStateChanged(u=>{ if(u) setUserId(u.uid); else setUserId('guest'); });
        return ()=> unsub && unsub();
      }
    }catch(e){ /* ignore, use guest */ }
  }, []);

  return (
    <div className="App" style={{ padding:24 }}>
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <h2>Okul Uygulaması</h2>
        <div>
          <button onClick={()=>setModalOpen(true)} style={{ padding:'8px 12px' }}>Blok Kodlama - Aç</button>
        </div>
      </header>

      <main style={{ marginTop:20 }}>
        <p>Hoş geldiniz. Öğrenci UID: <strong>{userId}</strong></p>
        <p>Koleksiyon: Oyun verileri Firestore'da `gameStates/{userId}` olarak saklanır.</p>
      </main>

      <BlockRunnerModal open={modalOpen} onClose={()=>setModalOpen(false)} userId={userId} />
    </div>
  );
}

export default App;
