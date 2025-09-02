import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from "framer-motion";

// ---- Dayjs Fix - ---
import dayjsLib from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjsLib.extend(utc);
dayjsLib.extend(timezone);
const dayjs = (v) => dayjsLib(v); // wrapper supaya aman
// -------------------

// -----------------------------------------------------
// Supabase init
// -----------------------------------------------------
const SUPABASE_URL = 'https://egphlpbsnpugakrhlgcr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVncGhscGJzbnB1Z2FrcmhsZ2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4MTU1MzQsImV4cCI6MjA3MTM5MTUzNH0.fzh71kvO0TkpoCl1QJyNEgy6oIqIbiMXZ6oXZTMWaR4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------------------------------------
// App Root
// -----------------------------------------------------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Kalau ada error di komponen anak, ubah state supaya tampil fallback
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Buat log error ke console (bisa juga kirim ke server kalau perlu)
  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20 }}>
          <h3>Terjadi Kesalahan</h3>
          <p style={{ color: "red" }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <small>Silakan reload halaman atau hubungi admin.</small>
        </div>
      );
    }

    // Kalau tidak ada error, tampilkan anak-anaknya seperti biasa
    return this.props.children;
  }
}


export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState("home");
  const [booting, setBooting] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session || null);
      if (data?.session?.user) await loadProfile(data.session.user.id);
      setBooting(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) loadProfile(s.user.id);
      else setProfile(null);
    });
    
    fetchTasks();
    fetchMessages();
    fetchSubmissions();
    fetchNotifications();
    return () => sub?.subscription.unsubscribe();
    
  }, []);


const fetchTasks = async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (data) setTasks(data);
  };

  const fetchMessages = async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase.from("submissions").select("*").order("submitted_at", { ascending: false });
    if (data) setSubmissions(data);
  };

  const fetchNotifications = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    if (data) setNotifications(data);
  };

  // ============================
  // Realtime listener
  // ============================
  useEffect(() => {
    const channel = supabase.channel("custom-all-channel")
      // Tasks realtime
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, (payload) => {
        console.log("Task event:", payload);
        fetchTasks();
      })
      // Messages realtime
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, (payload) => {
        console.log("Message event:", payload);
        fetchMessages();
      })
      // Submissions realtime
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, (payload) => {
        console.log("Submission event:", payload);
        fetchSubmissions();
      })
      // Notifications realtime
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (payload) => {
        console.log("Notification event:", payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  async function loadProfile(uid) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    if (!error) setProfile(data);
  }

  if (booting) return <Splash />;

  return (
    <ErrorBoundary>
      <div className="et-root">
        <TopBar
          profile={profile}
          onLogout={async () => {
            await supabase.auth.signOut();
            setProfile(null);
            setSession(null);
            setSelectedTaskId(null);
          }}
        />

        <div className="et-page">
          {!session || !profile ? (
            <Auth
              onSigned={async () => {
                const { data } = await supabase.auth.getSession();
                if (data?.session?.user)
                  await loadProfile(data.session.user.id);
              }}
            />
          ) : (
            <>
              {tab === "home" && <Home profile={profile} dayjs={dayjs} />}
              {tab === "tasks" && !selectedTaskId && (
                <TasksPage 
                  profile={profile} 
                  dayjs={dayjs}
                  onTaskSelect={setSelectedTaskId}
                />
              )}
              {tab === "tasks" && selectedTaskId && (
                <TaskDetailPage
                  taskId={selectedTaskId}
                  profile={profile}
                  dayjs={dayjs}
                  onBack={() => setSelectedTaskId(null)}
                />
              )}
              {tab === "notifications" && (
                <NotificationsPage profile={profile} dayjs={dayjs} />
              )}
              {tab === "admin" && <AdminOrProfile profile={profile} />}
            </>
          )}
        </div>

        {!selectedTaskId && <BottomNav tab={tab} setTab={setTab} role={profile?.role} />}
        <ToastStack />
        <GlobalStyles />
      </div>
    </ErrorBoundary>
  );
}

// -----------------------------------------------------
// Styles & Animations (mobile-first)
// -----------------------------------------------------
function GlobalStyles(){
  return (
    <style>{`
      :root{--bg:#0b1020;--card:#11162a;--muted:#9aa4c7;--text:#e8ecff;--brand:#6c8bff;--brand-2:#7ef7d1;--danger:#ff6b6b}
      *{box-sizing:border-box}
      html,body,#root{height:100%}
      body{margin:0;background:radial-gradient(1200px 600px at 50% -20%,#17203f 0%,#0b1020 60%);color:var(--text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased}
      .et-root{min-height:100vh;display:flex;flex-direction:column}
      .et-page{flex:1;display:flex;flex-direction:column;padding:12px;gap:12px;max-width:980px;margin:0 auto;width:100%}
      .card{background:linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02));backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.06);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.25)}
      .row{display:flex;gap:10px;align-items:center}
      .col{display:flex;flex-direction:column;gap:10px}
      .btn{border:none;border-radius:12px;padding:10px 14px;background:linear-gradient(135deg,var(--brand),#4a6bff);color:#fff;cursor:pointer;transition:transform .15s ease, box-shadow .15s ease;box-shadow:0 6px 18px rgba(108,139,255,.25)}
      .btn:hover{transform:translateY(-1px)}
      .btn.ghost{background:transparent;border:1px solid rgba(255,255,255,.16);color:#dbe2ff}
      .chip{padding:6px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.12);font-size:12px}
      input,select,textarea{width:100%;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.02);color:var(--text);outline:none}
      textarea{min-height:100px}
      .muted{color:var(--muted)}
      .title{font-weight:700;font-size:18px}
      .small{font-size:12px}

      /* TopBar */
      .top{position:sticky;top:0;z-index:10;padding:12px;display:flex;justify-content:space-between;align-items:center;background:linear-gradient(180deg,rgba(11,16,32,.9),rgba(11,16,32,.4));backdrop-filter:blur(12px);border-bottom:1px solid rgba(255,255,255,.06)}
      .logo{display:flex;gap:10px;align-items:center}
      .logo-badge{width:30px;height:30px;border-radius:8px;background:conic-gradient(from 180deg at 50% 50%,var(--brand),var(--brand-2));box-shadow:0 6px 16px rgba(110,150,255,.35)}

      /* Bottom nav */
      .bnav{position:sticky;bottom:0;z-index:10;display:flex;gap:8px;padding:10px;background:linear-gradient(180deg,rgba(11,16,32,.1),rgba(11,16,32,.8));backdrop-filter:blur(10px);border-top:1px solid rgba(255,255,255,.08)}
      .bnav button{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;padding:8px;border-radius:12px}
      .bnav .active{background:rgba(255,255,255,.06)}

      /* List */
      .list{display:flex;flex-direction:column}
      .item{padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.08);transition:background .2s ease, transform .2s ease}
      .item:hover{background:rgba(255,255,255,.04);transform:translateY(-1px)}

      /* Grid responsive */
      .grid{display:grid;grid-template-columns:1fr;gap:12px}
      @media(min-width:800px){.grid-2{grid-template-columns:2fr 1fr}}

      /* Animations */
 /* Animasi untuk splash screen dan komponen lainnya */
      
      
      @keyframes pop{0%{transform:scale(.96);opacity:.0}100%{transform:scale(1);opacity:1}}
      .pop{animation:pop .18s ease-out}
      @keyframes slideUp{0%{transform:translateY(10px);opacity:.0}100%{transform:translateY(0);opacity:1}}
      .slideUp{animation:slideUp .2s ease-out}

      /* Media preview */
      .thumbs{display:flex;gap:8px;overflow:auto}
      .thumb{border-radius:12px;border:1px solid rgba(255,255,255,.08);min-width:110px;min-height:70px;max-height:120px;object-fit:cover}

      /* Toast */
      .toast-wrap{position:fixed;right:12px;left:12px;bottom:70px;display:flex;flex-direction:column;gap:10px;z-index:40}
      .toast{padding:12px;border-radius:14px;background:rgba(24,32,60,.95);border:1px solid rgba(255,255,255,.1);box-shadow:0 12px 26px rgba(0,0,0,.35)}
      @media(min-width:680px){.toast-wrap{left:auto;width:360px}}

      .badge{padding:4px 8px;border-radius:999px;font-size:11px;border:1px solid rgba(255,255,255,.12)}
      .badge.red{background:rgba(255,107,107,.12);border-color:rgba(255,107,107,.25)}
    `}</style>
  );
}

// -----------------------------------------------------
// Top & Bottom bars
// -----------------------------------------------------
function TopBar({ profile, onLogout }){
  return (
    <div className="top">
      <div className="logo">
        <div className="logo-badge"/>
        <div>
          <div style={{fontWeight:800}}>EduTask</div>
          <div className="small muted">Manajemen tugas realtime</div>
        </div>
      </div>
      {profile && (
        <div className="row">
          <span className="badge">{profile.username}</span>
          <span className="badge" style={{textTransform:'capitalize'}}>{profile.role}</span>
          <button className="btn ghost" onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

function BottomNav({ tab, setTab, role }){
  const Btn = ({ id, label, svg }) => (
    <button className={`btn ghost ${tab===id?'active':''}`} onClick={()=>setTab(id)}>
      <span>{svg}</span>
      <span className="small">{label}</span>
    </button>
  );
  return (
    <div className="bnav">
      <Btn id="home" label="Home" svg={<IconHome/>} />
      <Btn id="tasks" label="Tugas" svg={<IconTasks/>} />
      <Btn id="notifications" label="Notif" svg={<IconBell/>} />
      <Btn id="admin" label={role==='teacher'?'Guru':'Profil'} svg={role==='teacher'?<IconDashboard/>:<IconUser/>} />
    </div>
  );
}

// -----------------------------------------------------
// Splash
// -----------------------------------------------------
// Ganti komponen Splash dengan yang baru
// Ganti komponen Splash dengan yang ini
function Splash() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.floor(Math.random() * 8) + 4;
        if (next >= 100) {
          clearInterval(id);
          setTimeout(() => {
            setVisible(false);
          }, 450);
          return 100;
        }
        return next;
      });
    }, 220);

    return () => clearInterval(id);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500"
        >
          <div className="w-full max-w-sm mx-6 p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center gap-4">
            <motion.div
              initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 14 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "loop" }}
                className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm"
              >
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="4" fill="white" fillOpacity="0.12" />
                  <path d="M7 12h10M7 8h10M7 16h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>

              <div className="flex flex-col text-left">
                <div className="text-white font-semibold text-lg leading-tight">EduTask</div>
                <div className="text-white/80 text-sm">Memuat aplikasi...</div>
              </div>
            </motion.div>

            <div className="w-full flex flex-col items-center gap-3 mt-2">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-white/25 border-t-white animate-spin" />
                <motion.div
                  animate={{ scale: [0.9, 1.15, 0.95] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute w-3 h-3 rounded-full bg-white"
                />
              </div>

              <div className="w-full mt-2">
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-white/80"
                    style={{ width: `${progress}%` }}
                    transition={{ ease: "easeOut", duration: 0.35 }}
                  />
                </div>
                <div className="w-full flex items-center justify-between mt-2 text-xs text-white/90">
                  <div>Memuat EduTask....</div>
                  <div>{progress}%</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-white/60 mt-2">Modern Loader • Animasi Halus</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
            }




// -----------------------------------------------------
// Auth (username + password)
// -----------------------------------------------------
function Auth({ onSigned }){
  const [mode,setMode] = useState('login');
  return (
    <div className="card pop" style={{padding:14}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div className="title">{mode==='login'?'Masuk':'Daftar'}</div>
        <button className="btn ghost" onClick={()=>setMode(mode==='login'?'register':'login')}>{mode==='login'?'Buat Akun':'Punya Akun?'}</button>
      </div>
      {mode==='login'? <Login onSigned={onSigned}/> : <Register onSigned={onSigned}/>}
    </div>
  );
}

function Login({ onSigned }){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [err,setErr]=useState('');
  const submit=async(e)=>{e.preventDefault();setErr('');try{const email=`${username}@edutask.local`;const { error }=await supabase.auth.signInWithPassword({email,password});if(error) setErr(error.message); else onSigned();}catch(ex){setErr(ex.message)}};
  return (
    <form onSubmit={submit} className="col" style={{marginTop:10}}>
      <input required placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input required placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      {err && <div className="small" style={{color:'salmon'}}>{err}</div>}
      <div className="row" style={{justifyContent:'flex-end'}}><button className="btn">Masuk</button></div>
    </form>
  );
}

function Register({ onSigned }){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [role,setRole]=useState('student');
  const [classCode,setClassCode]=useState('');
  const [err,setErr]=useState('');

  const submit=async(e)=>{
    e.preventDefault();
    setErr('');
    try{
      const email=`${username}@edutask.local`;
      const { data,error }=await supabase.auth.signUp({ email, password });
      if(error) return setErr(error.message);
      const uid=data?.user?.id;
      if(!uid) return setErr('Gagal membuat akun');
      
      // Cari kelas berdasarkan kode
      let classId = null;
      if(role==='student'){
        if(!classCode) return setErr('Kode kelas wajib untuk siswa');
        const { data: classData, error: classError } = await supabase
          .from('classes')
          .select('id')
          .eq('code', classCode)
          .single();
        if(classError || !classData) return setErr('Kode kelas tidak valid');
        classId = classData.id;
      }

      const payload={ 
        id:uid, 
        username, 
        role, 
        class_id: role==='student'? classId : null 
      };
      const { error:pErr }=await supabase.from('profiles').insert(payload);
      if(pErr) setErr(pErr.message); 
      else onSigned();
    }catch(ex){setErr(ex.message)}
  };

  return (
    <form onSubmit={submit} className="col" style={{marginTop:10}}>
      <input required placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
      <input required placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      <div className="row">
        <label className="chip"><input type="radio" checked={role==='student'} onChange={()=>setRole('student')} /> Siswa</label>
        <label className="chip"><input type="radio" checked={role==='teacher'} onChange={()=>setRole('teacher')} /> Guru</label>
      </div>
      {role==='student' && (
        <div className="col">
          <div className="small muted">Masukkan Kode Kelas (minimal 5 karakter)</div>
          <input 
            required 
            placeholder="Kode Kelas" 
            value={classCode} 
            onChange={e=>setClassCode(e.target.value)}
            minLength={5}
          />
        </div>
      )}
      {err && <div className="small" style={{color:'salmon'}}>{err}</div>}
      <div className="row" style={{justifyContent:'flex-end'}}><button className="btn">Daftar</button></div>
    </form>
  );
}

function InlineCreateClass({ onCreated }){
  const [open,setOpen]=useState(false);
  const [name,setName]=useState('');
  const [code,setCode]=useState('');
  
  const create=async()=>{ 
    if(!name) return alert('Nama kelas wajib');
    if(!code || code.length < 5) return alert('Kode kelas minimal 5 karakter');
    
    const { data,error }=await supabase.from('classes')
      .insert({name, code})
      .select()
      .single(); 
      
    if(!error){ 
      onCreated(data); 
      setName(''); 
      setCode('');
      setOpen(false);
    } else {
      alert(error.message);
    }
  };
  
  return open? (
    <div className="col" style={{gap:6}}>
      <input placeholder="Nama kelas" value={name} onChange={e=>setName(e.target.value)} />
      <input 
        placeholder="Kode kelas (min 5 karakter)" 
        value={code} 
        onChange={e=>setCode(e.target.value)}
        minLength={5}
      />
      <div className="row">
        <button type="button" className="btn" onClick={create}>Simpan</button>
        <button type="button" className="btn ghost" onClick={()=>setOpen(false)}>Batal</button>
      </div>
    </div>
  ) : <button type="button" className="btn ghost" onClick={()=>setOpen(true)}>Buat Kelas</button>;
}
// -----------------------------------------------------
// Home
// -----------------------------------------------------
function Home({ profile }){
 const [className, setClassName] = useState('');

  useEffect(() => {
    if (profile?.class_id) {
      // Ambil nama kelas dari database
      supabase
        .from('classes')
        .select('name')
        .eq('id', profile.class_id)
        .single()
        .then(({ data }) => {
          if (data) setClassName(data.name);
        });
    }
  }, [profile]);
  
  return (
    <div className="grid grid-2">
      <div className="card pop" style={{padding:14}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <div>
            <div className="title">Halo, {profile?.username}</div>
            <div className="muted small">Selamat datang di EduTask. Semua fitur realtime, mobile-first.</div>
          </div>
          <div className="badge">WIB {dayjs().utcOffset(7).format('HH:mm')}</div>
        </div>
        <div className="row" style={{marginTop:12,gap:8,flexWrap:'wrap'}}>
           <span className="chip">Kelas: {className || '-'}</span>
          <span className="chip">Peran: {profile?.role}</span>
          <span className="chip">Upload ≤ 45 MB</span>
        </div>
      </div>
      <div className="card pop" style={{padding:14}}>
        <div className="title">Tips</div>
        <div className="small muted">• Ketuk tab Tugas untuk melihat/mengirim tugas dengan foto, video, atau teks.<br/>• Notifikasi popup akan muncul saat ada informasi baru atau lewat 12 jam.&nbsp;(Hanya sebelum 21:00 WIB)</div>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// Tasks Page
// -----------------------------------------------------
function TasksPage({ profile, onTaskSelect }){
  const [tasks,setTasks]=useState([]);
  const [q,setQ]=useState('');
  const [cats,setCats]=useState([]);
  const [filterCat,setFilterCat]=useState('');
  const [filterPrio,setFilterPrio]=useState('');
  const [classes,setClasses]=useState([]);

  useEffect(()=>{ load(); const sub = supabase.channel('realtime:tasks').on('postgres_changes',{event:'*',schema:'public',table:'tasks'},()=>load()).subscribe(); return ()=>supabase.removeChannel(sub); },[]);
  
  async function load(){
    const { data:t } = await supabase.from('tasks')
      .select('*, categories:category_id(name), classes:class_id(name)')
      .order('created_at',{ascending:false});
    const { data: c }= await supabase.from('categories').select('*').order('name');
    const { data: cs }= await supabase.from('classes').select('*').order('name');
    setTasks(t||[]); setCats(c||[]); setClasses(cs||[]);
  }

  const deleteTask = async (taskId) => {
    try {
      // Hapus submissions terkait terlebih dahulu
      await supabase.from('submissions').delete().eq('task_id', taskId);
      
      // Hapus messages terkait
      await supabase.from('messages').delete().eq('task_id', taskId);
      
      // Hapus task
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      
      if (error) {
        console.error('Error deleting task:', error);
        pushToast({ title: 'Gagal menghapus tugas', body: error.message });
      } else {
        pushToast({ title: 'Berhasil', body: 'Tugas dihapus' });
        load(); // Reload tasks
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      pushToast({ title: 'Error', body: 'Gagal menghapus tugas' });
    }
  };

  const shown = useMemo(()=> tasks.filter(x=>{
    if (profile.role==='student' && profile.class_id && x.class_id!==profile.class_id) return false;
    if (q && !(`${x.title} ${x.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
    if (filterCat && x.category_id!==filterCat) return false;
    if (filterPrio && x.priority!==filterPrio) return false;
    return true;
  }), [tasks,q,filterCat,filterPrio,profile]);

  return (
    <div className="col">
      <div className="card pop" style={{padding:12}}>
        <div className="row" style={{gap:8,flexWrap:'wrap'}}>
          <input placeholder="Cari tugas..." value={q} onChange={e=>setQ(e.target.value)} />
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">Kategori</option>
            {cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterPrio} onChange={e=>setFilterPrio(e.target.value)}>
            <option value="">Prioritas</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          {profile.role==='teacher' && <CreateTaskButton classes={classes} cats={cats} onCreated={load}/>}        
        </div>
      </div>

      <div className="col">
        {shown.map(t=> 
          t.id ? (
            <TaskCard 
              key={t.id} 
              task={t} 
              profile={profile}
              onOpen={()=>onTaskSelect(t.id)} 
              onDelete={deleteTask}
            />
          ) : null
        )}
        {shown.length===0 && <div className="muted small">Tidak ada tugas.</div>}
      </div>
    </div>
  );
}

function TaskCard({ task, onOpen, profile, onDelete }){
  return (
    <div className="item card slideUp" style={{cursor:'pointer', position: 'relative'}}>
      <div className="row" style={{justifyContent:'space-between'}}>
        <div style={{flex: 1}} onClick={onOpen}>
          <div className="title">{task.title}</div>
          <div className="small muted">{task.description?.slice(0,120)}</div>
          {profile.role === 'teacher' && task.classes && (
            <div className="small muted" style={{marginTop: 4}}>
              Kelas: {task.classes.name}
            </div>
          )}
        </div>
        <div className="col" style={{alignItems:'flex-end'}}>
          <span className="badge">{task.categories?.name || 'Umum'}</span>
          <span className="badge">Prioritas: {task.priority}</span>
          <span className="badge">Due: {task.due_at? dayjs(task.due_at).format('DD MMM HH:mm') : '-'}</span>
          {profile.role === 'teacher' && (
            <button 
              className="btn ghost" 
              style={{marginTop: 8, padding: '4px 8px', fontSize: '12px'}}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Hapus tugas ini?')) onDelete(task.id);
              }}
            >
              Hapus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaThumb({ file, showDownload = true }) {
  const url = getPublicUrl(file?.path);
  if (!url) return null;
  
  const isVideo = /\.(mp4|webm|mov|m4v)$/i.test(file.name||'');
  const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name||'');
  
  if (isVideo) {
    return (
      <div style={{position: 'relative'}}>
        <video className="thumb" src={url} muted playsInline />
        {showDownload && (
          <a href={url} download={file.name} className="btn" style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            padding: '4px 8px',
            fontSize: '12px',
            background: 'rgba(0,0,0,0.7)'
          }}>
            Download
          </a>
        )}
      </div>
    );
  } else if (isImage) {
    return (
      <div style={{position: 'relative'}}>
        <img className="thumb" src={url} alt={file.name} />
        {showDownload && (
          <a href={url} download={file.name} className="btn" style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            padding: '4px 8px',
            fontSize: '12px',
            background: 'rgba(0,0,0,0.7)'
          }}>
            Download
          </a>
        )}
      </div>
    );
  } else {
    // Untuk file non-image/video
    return (
      <a href={url} download={file.name} className="thumb" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.05)',
        textDecoration: 'none',
        color: 'var(--text)'
      }}>
        <div style={{textAlign: 'center', padding: 8}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{marginBottom: 4}}>
            <path d="M12 16L12 4M12 16L8 12M12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 20H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <div className="small" style={{wordBreak: 'break-word'}}>{file.name}</div>
          <div className="small muted">{Math.round(file.size / 1024)} KB</div>
        </div>
      </a>
    );
  }
}

function CreateTaskButton({ classes, cats, onCreated }){
  const [open,setOpen]=useState(false);
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const [classId,setClassId]=useState('');
  const [cat,setCat]=useState('');
  const [prio,setPrio]=useState('normal');
  const [due,setDue]=useState('');
  const [files,setFiles]=useState([]);

  useEffect(()=>{ if(classes?.[0]) setClassId(classes[0].id); },[classes]);
  const pick=(e)=>{ const list=Array.from(e.target.files||[]); for(const f of list){ if(f.size>45*1024*1024) return alert('File \' '+f.name+' \' >45MB'); } setFiles(list); };
  const submit=async()=>{
    if(!title || !classId) return alert('Judul & kelas wajib');
    const { data: t, error }= await supabase.from('tasks').insert({ title, description:desc, class_id:classId, category_id:cat||null, priority:prio, due_at: due||null }).select().single();
    if(error) return alert(error.message);
    const uploaded=[];
    for(const f of files){ const path=`${t.id}/${Date.now()}-${f.name}`; const { error:up }=await supabase.storage.from('uploads').upload(path,f,{upsert:false}); if(!up) uploaded.push({path,name:f.name,size:f.size}); }
    if(uploaded.length){ await supabase.from('submissions').insert({ task_id:t.id, student_id:null, text:null, files:uploaded }); }
    setOpen(false); setTitle(''); setDesc(''); setFiles([]); onCreated&&onCreated();
    pushToast({ title:'Tugas dibuat', body:title });
  };

  if(!open) return <button className="btn" onClick={()=>setOpen(true)}>Buat Tugas</button>;
  return (
    <div className="card pop" style={{padding:12,width:'100%'}}>
      <div className="title">Tugas Baru</div>
      <div className="col" style={{marginTop:8}}>
        <input placeholder="Judul" value={title} onChange={e=>setTitle(e.target.value)} />
        <textarea placeholder="Deskripsi" value={desc} onChange={e=>setDesc(e.target.value)} />
        <div className="row">
          <select value={classId} onChange={e=>setClassId(e.target.value)}>
            <option value="">Pilih Kelas</option>
            {classes.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <InlineCreateClass onCreated={(c)=>pushToast({title:'Kelas dibuat', body:c.name})} />
        </div>
        <div className="row">
          <select value={cat} onChange={e=>setCat(e.target.value)}>
            <option value="">Kategori</option>
            {cats.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={prio} onChange={e=>setPrio(e.target.value)}>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>
        <input type="datetime-local" value={due} onChange={e=>setDue(e.target.value)} />
        <div className="col">
          <div className="small muted">Lampiran (foto/video/file), max 45 MB per file</div>
          <input type="file" multiple onChange={pick} />
        </div>
        <div className="row" style={{justifyContent:'flex-end'}}>
          <button className="btn ghost" onClick={()=>setOpen(false)}>Batal</button>
          <button className="btn" onClick={submit}>Simpan</button>
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// Task Detail Page (New Component)
// -----------------------------------------------------
function TaskDetailPage({ taskId, profile, dayjs, onBack }){
  const [task, setTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [subs, setSubs] = useState([]);
  const [msg, setMsg] = useState('');
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [taskFiles, setTaskFiles] = useState([]); // File dari guru

  const loadSubs = useCallback(async () => {
    if (!taskId) return;
    
    let query = supabase
      .from('submissions')
      .select(`*, profiles:student_id(username)`)
      .eq('task_id', taskId);

    // Jika user adalah siswa, hanya tampilkan submission miliknya sendiri
    if (profile.role === 'student') {
      query = query.eq('student_id', profile.id);
    }

    const { data } = await query.order('submitted_at', { ascending: false });
    
    // Pisahkan file tugas dari guru dan submission siswa
    const teacherFiles = [];
    const studentSubmissions = [];
    
    (data || []).forEach(item => {
      if (item.student_id === null) {
        // Ini adalah file dari guru
        if (Array.isArray(item.files)) {
          teacherFiles.push(...item.files);
        }
      } else {
        // Ini adalah submission siswa
        studentSubmissions.push(item);
      }
    });
    
    setTaskFiles(teacherFiles);
    setSubs(studentSubmissions);
  }, [taskId, profile.id, profile.role]);
  
 const messagesContainerRef = useRef(null); // Ref untuk container pesan
const messagesEndRef = useRef(null);
  // Fungsi untuk scroll otomatis ke pesan terbaru di dalam container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    if (!taskId) return;

    // Definisikan fungsi-fungsi di dalam useEffect
    const loadTask = async () => {
      if (!taskId) return;
      const { data } = await supabase.from('tasks')
        .select('*, categories:category_id(name), class:class_id(name)')
        .eq('id', taskId)
        .single();
      setTask(data);
    };

    const loadMessages = async () => {
      if (!taskId) return;
      const { data } = await supabase.from('messages')
  .select('*, profiles:sender_id(username, role)') // Tambahkan relasi profiles
  .eq('task_id', taskId)
  .order('created_at');
      setMessages(data || []);
    };
  
  loadTask();
  loadMessages();
  loadSubs();
  
  const ch1 = supabase.channel('messages:'+taskId)
    .on('postgres_changes', {event: '*', schema: 'public', table: 'messages', filter: `task_id=eq.${taskId}`}, loadMessages)
    .subscribe();
  
  const ch2 = supabase.channel('subs:'+taskId)
    .on('postgres_changes', {event: '*', schema: 'public', table: 'submissions', filter: `task_id=eq.${taskId}`}, loadSubs)
    .subscribe();
  
  return () => {
    supabase.removeChannel(ch1);
    supabase.removeChannel(ch2);
  };
  }, [taskId, loadSubs]);


  const send = async () => {
    if (!msg || !taskId) return;
    await supabase.from('messages').insert({
      task_id: taskId,
      sender_id: profile.id,
      text: msg
    });
    setMsg('');
  };

  const pick = (e) => {
    const list = Array.from(e.target.files || []);
    for (const f of list) {
      if (f.size > 45 * 1024 * 1024) return alert('File >45MB');
    }
    setFiles(list);
  };

  const submit = async () => {
    if (!taskId || !task) return;
    
    const uploaded = [];
    for (const f of files) {
      const path = `${taskId}/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage.from('uploads').upload(path, f, {upsert: false});
      if (!error) uploaded.push({path, name: f.name, size: f.size});
    }
    
    await supabase.from('submissions').insert({
      task_id: taskId,
      student_id: profile.id,
      text: text || null,
      files: uploaded
    });
    
    setText('');
    setFiles([]);
    pushToast({ title: 'Tugas dikirim', body: task.title });
  };

  const grade = async (id, val) => {
    await supabase.from('submissions').update({ grade: val }).eq('id', id);
    pushToast({ title: 'Nilai diperbarui', body: String(val) });
  };

  if (!task) {
    return (
      <div className="card pop" style={{padding: 12}}>
        <div className="row" style={{justifyContent: 'space-between'}}>
          <button className="btn ghost" onClick={onBack}>&larr; Kembali</button>
          <div>Memuat tugas...</div>
        </div>
      </div>
    );
  }

  const gallery = (subs?.[0]?.files || []).slice(0, 4);

return (
    <div className="col">
      <div className="card pop" style={{padding:12}}>
        <div className="row" style={{justifyContent:'space-between', alignItems: 'center'}}>
          <button className="btn ghost" onClick={onBack}>&larr; Kembali</button>
          <div className="title">{task?.title || 'Memuat...'}</div>
          <div style={{width: 80}}></div>
        </div>

        {task && (
          <>
            <div className="small muted" style={{marginTop: 8}}>
              Due: {task.due_at ? dayjs(task.due_at).format('DD MMM YYYY HH:mm') : '-'} • 
              Prioritas: {task.priority} • 
              Kelas: {task.class?.name}
            </div>

            {/* Tampilkan file dari guru */}
            {taskFiles.length > 0 && (
              <div className="card" style={{padding:12, marginTop:12}}>
                <div className="title">File Tugas dari Guru</div>
                <div className="thumbs" style={{marginTop:10}}>
                  {taskFiles.map((f,i) => 
                    f?.path ? <MediaThumb key={i} file={f} showDownload={true} /> : null
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-2" style={{marginTop:12}}>
              <div className="card" style={{padding:12}}>
                <div className="title">Diskusi</div>
                <div ref={messagesContainerRef} style={{maxHeight:280,overflow:'auto',marginTop:8}}>
                  {messages.map(m => (
                  <div key={m.id} className="item" style={{marginBottom:8}}>
                  
                    <div className="small muted">
                        {m.profiles?.username || 'Unknown'}
                        {m.profiles?.role === 'teacher' && (
                          <span className="badge" style={{
                            marginLeft: 8, 
                            background: 'rgba(108, 139, 255, 0.12)', 
                            borderColor: 'rgba(108, 139, 255, 0.25)',
                            color: '#6c8bff'
                          }}>
                            Guru •
                          </span>
                        )}
                        • {dayjs(m.created_at).format('DD MMM HH:mm')}
                      </div>
                      <div>{m.text}</div>
                    </div>
                  ))}
                </div>
                <div className="row" style={{marginTop:8}}>
                  <input placeholder="Tulis pesan..." value={msg} onChange={e=>setMsg(e.target.value)} />
                  <button className="btn" onClick={send}>Kirim</button>
                </div>
              </div>

              <div className="card" style={{padding:12}}>
                {profile.role === 'student' ? (
                  <>
                    <div className="title">Kirim Tugas</div>
                    <textarea placeholder="Catatan (opsional)" value={text} onChange={e=>setText(e.target.value)} />
                    <input type="file" multiple onChange={pick} />
                    <div className="row" style={{justifyContent:'flex-end',marginTop:8}}>
                      <button className="btn" onClick={submit} disabled={!task}>Kirim</button>
                    </div>
                  </>
                ) : (
                  <div className="title">Pengumpulan Siswa</div>
                )}
                
                <div className="col" style={{marginTop:10}}>
                  {subs.length === 0 && (
                    <div className="muted small">Belum ada pengumpulan.</div>
                  )}
                  {subs.map(s => (
                    <div key={s.id} className="item">
                      <div className="small muted">{s.profiles?.username || (s.student_id ? 'Unknown' : 'oleh guru')} • {dayjs(s.submitted_at).format('DD MMM HH:mm')}</div>
                      {s.text && <div style={{marginTop:6}}>{s.text}</div>}
                      {Array.isArray(s.files) && s.files.length > 0 && (
                        <div className="thumbs" style={{marginTop:8}}>
                          {s.files.map((f,i) => 
                            f?.path ? <MediaThumb key={i} file={f} showDownload={true} /> : null
                          )}
                        </div>
                      )}
                      {profile.role === 'teacher' && (
                        <div className="row" style={{marginTop:8,justifyContent:'space-between'}}>
                          <div className="small">Nilai: <strong>{s.grade ?? '-'}</strong></div>
                          <input 
                            type="number" 
                            className="small" 
                            placeholder="Nilai" 
                            onBlur={e => grade(s.id, parseFloat(e.target.value))} 
                            style={{width: '80px'}}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="item" style={{marginTop:10}}>
              <div className="title">Pengingat & Notifikasi</div>
              <div className="small muted">Akan muncul notifikasi popup jika tugas lewat 12 jam dan belum dikumpulan (hanya jika waktu lokal &lt; 21:00 WIB).</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



// -----------------------------------------------------
// Notifications Page + Popup toasts
// -----------------------------------------------------
function NotificationsPage({ profile }){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ load(); const ch = supabase.channel('notif:'+profile.id).on('postgres_changes',{event:'*',schema:'public',table:'notifications',filter:`user_id=eq.${profile.id}`},()=>load()).subscribe(); return ()=>supabase.removeChannel(ch); },[profile?.id]);
  async function load(){ const { data }= await supabase.from('notifications').select('*').eq('user_id',profile.id).order('created_at',{ascending:false}); setRows(data||[]); }
  return (
    <div className="card pop" style={{padding:12}}>
      <div className="title">Notifikasi</div>
      <div className="col" style={{marginTop:8}}>
        {rows.map(n=> (
          <div key={n.id} className="item">
            <div className="small muted">{dayjs(n.created_at).format('DD MMM HH:mm')}</div>
            <div style={{fontWeight:600}}>{n.title}</div>
            <div className="small">{n.body}</div>
          </div>
        ))}
        {rows.length===0 && <div className="muted small">Belum ada notifikasi.</div>}
      </div>
    </div>
  );
}

// Toast system (in-memory)
const toastBus = [];
function pushToast({ title, body }){ toastBus.push({ id:Date.now()+Math.random(), title, body }); window.dispatchEvent(new CustomEvent('et-toast')); }
function ToastStack(){
  const [items,setItems]=useState([]);
  useEffect(()=>{ const on=()=> setItems([...toastBus]); window.addEventListener('et-toast',on); return ()=>window.removeEventListener('et-toast',on); },[]);
  useEffect(()=>{ if(items.length){ const tm=setTimeout(()=>{ toastBus.shift(); setItems([...toastBus]); }, 3200); return ()=>clearTimeout(tm);} },[items]);
  return (
    <div className="toast-wrap">
      {items.map(t=> (
        <div key={t.id} className="toast slideUp">
          <div className="title">{t.title}</div>
          <div className="small muted">{t.body}</div>
        </div>
      ))}
    </div>
  );
}

// -----------------------------------------------------
// Admin (teacher) or Profile (student)
// -----------------------------------------------------
function AdminOrProfile({ profile }){
const [className, setClassName] = useState('');

  useEffect(() => {
    if (profile?.class_id) {
      // Ambil nama kelas dari database
      supabase
        .from('classes')
        .select('name')
        .eq('id', profile.class_id)
        .single()
        .then(({ data }) => {
          if (data) setClassName(data.name);
        });
    }
  }, [profile]);
  
  if (profile.role==='teacher') return <TeacherAdmin/>;
  return (
    <div className="card pop" style={{padding:12}}>
      <div className="title">Profil</div>
      <div className="small">Username: {profile.username}</div>
      <div className="small">Peran: {profile.role}</div>
      <div className="small">Kelas: {className || '-'}</div>
    </div>
  );
}

function TeacherAdmin(){
  const [cats,setCats]=useState([]);
  const [classes,setClasses]=useState([]);
  const [newCat,setNewCat]=useState('');
  
  useEffect(()=>{ load(); },[]);
  
  async function load(){ 
    const { data:c }= await supabase.from('categories').select('*').order('name'); 
    const { data:cs }= await supabase.from('classes').select('*').order('name'); 
    setCats(c||[]); 
    setClasses(cs||[]);
  } 
  
  const addCat=async()=>{ 
    if(!newCat) return; 
    const { error }= await supabase.from('categories').insert({ name:newCat }); 
    if(error) return alert(error.message); 
    setNewCat(''); 
    load(); 
    pushToast({ title:'Kategori ditambahkan', body:newCat }); 
  };
  
  const delCat=async(id)=>{ 
    if(!confirm('Hapus kategori?')) return; 
    await supabase.from('categories').delete().eq('id',id); 
    load(); 
  };
  
  const delCls=async(id)=>{ 
    if(!confirm('Hapus kelas?')) return; 
    await supabase.from('classes').delete().eq('id',id); 
    load(); 
  };

  return (
    <div className="grid grid-2">
      <div className="card pop" style={{padding:12}}>
        <div className="title">Kategori</div>
        <div className="row" style={{marginTop:8}}>
          <input placeholder="Nama kategori" value={newCat} onChange={e=>setNewCat(e.target.value)} />
          <button className="btn" onClick={addCat}>Tambah</button>
        </div>
        <div className="col" style={{marginTop:8}}>
          {cats.map(c=> (
            <div key={c.id} className="item row" style={{justifyContent:'space-between'}}>
              <div>{c.name}</div>
              <button className="btn ghost" onClick={()=>delCat(c.id)}>Hapus</button>
            </div>
          ))}
          {cats.length===0 && <div className="muted small">Belum ada kategori.</div>}
        </div>
      </div>

      <div className="card pop" style={{padding:12}}>
        <div className="title">Kelas</div>
        <InlineCreateClass onCreated={(c)=>{ setClasses(v=>[...v,c]); pushToast({title:'Kelas dibuat', body:c.name}); }} />
        <div className="col" style={{marginTop:8}}>
          {classes.map(c=> (
            <div key={c.id} className="item row" style={{justifyContent:'space-between'}}>
              <div>
                <div>{c.name}</div>
                <div className="small muted">Kode: {c.code}</div>
              </div>
              <button className="btn ghost" onClick={()=>delCls(c.id)}>Hapus</button>
            </div>
          ))}
          {classes.length===0 && <div className="muted small">Belum ada kelas.</div>}
        </div>
      </div>
    </div>
  );
}


// -----------------------------------------------------
// Helpers
// -----------------------------------------------------
function getPublicUrl(path){ if(!path) return ''; const { data }= supabase.storage.from('uploads').getPublicUrl(path); return data?.publicUrl || ''; }

// Cleanup files older than 20 days (best-effort client). Use Storage Lifecycle for reliability.
async function cleanupOldFiles(){ try{ const cutoff = dayjs().subtract(20,'day').toISOString(); const { data }= await supabase.from('submissions').select('id,files,submitted_at').lte('submitted_at',cutoff); for(const s of (data||[])){ if(Array.isArray(s.files)){ for(const f of s.files){ try{ await supabase.storage.from('uploads').remove([f.path]); }catch{} } } await supabase.from('submissions').delete().eq('id',s.id);} }catch{} }

// Overdue notifier: call from a scheduled job (cron) or manually from console
export async function overdueNotifier(){ try{ const jakartaNow=dayjs().utcOffset(7); if(jakartaNow.hour()>=21) return; const threshold=dayjs().subtract(12,'hour').toISOString(); const { data: tasks }= await supabase.from('tasks').select('*').lte('due_at',threshold); for(const t of (tasks||[])){ const { data: subs }= await supabase.from('submissions').select('id').eq('task_id',t.id); if(!subs || subs.length===0){ const { data: students }= await supabase.from('profiles').select('id').eq('class_id', t.class_id); for(const s of (students||[])){ await supabase.from('notifications').insert({ user_id:s.id, title:'Tugas Terlambat', body:`Tugas "${t.title}" sudah lewat 12 jam dan belum dikumpulkan.` }); pushToast({ title:'Pengingat', body:`${t.title} terlambat` }); } } } }catch(e){ console.warn('notifier',e) } }

// -----------------------------------------------------
// Icons (inline SVG)
// -----------------------------------------------------
function IconHome(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z" stroke="currentColor" strokeWidth="1.5"/></svg>)}
function IconTasks(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M8 8h8M8 12h8M8 16h6" stroke="currentColor" strokeWidth="1.5"/></svg>)}
//function IconBell(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3a6 6 0 0 1 6 极速飞艇开奖结果，168飞艇官网开奖记录，幸运飞行艇开奖记录查询 6v3.5l1.5 2V16H4v-1.5l1.5-2V9a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 18a2.5 2.5 0 0 极速飞艇开奖官网 0 5 0" stroke="currentColor" strokeWidth="1.5"/></svg>)}
function IconDashboard(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h7v7H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 13h7v7H4z" stroke="currentColor" strokeWidth="1.5"/></svg>)}
//function IconUser(){return(<svg width="18" height="18" viewBox="0 0 24 24" fill="极速飞艇开奖结果"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5"/></svg>)}
// Ganti fungsi icon dengan ini
function IconBell(){
  return(
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3a6 6 0 0 1 6 6v3.5l1.5 2V16H4v-1.5l1.5-2V9a6 6 0 0 1 6-6z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9.5 18a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function IconUser(){
  return(
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
