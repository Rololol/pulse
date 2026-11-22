"use client";

import { useCallback, useState } from "react";

type Source = { sourceUrl: string; title: string | null; source: { name: string } };
type Article = {
  id: string; slug: string; title: string; standfirst: string; body: string; category: string;
  author: string | null; status: "DRAFT" | "IN_REVIEW" | "PUBLISHED";
  sourcePublishedAt: string | null; sources: Source[];
};

const categories = ["Politik","Deutschland","Welt","Wirtschaft","Wissenschaft","Digital","Gesellschaft","Kultur","Sport"];
const inputStyle: React.CSSProperties = { display:"block",width:"100%",padding:11,marginTop:6,border:"1px solid #deddd7",borderRadius:4,fontSize:13,boxSizing:"border-box" };

export default function EditorialPage() {
  const [secret,setSecret]=useState("");
  const [ready,setReady]=useState(false);
  const [articles,setArticles]=useState<Article[]>([]);
  const [selected,setSelected]=useState<Article|null>(null);
  const [filter,setFilter]=useState("DRAFT");
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);

  const call=useCallback((url:string,init:RequestInit={})=>fetch(url,{...init,headers:{"Content-Type":"application/json",Authorization:"Bearer "+secret,...(init.headers||{})}}),[secret]);
  const load=useCallback(async()=>{
    setBusy(true);setMessage("");
    try {
      const response=await call("/api/editor/articles");
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||"Zugriff fehlgeschlagen");
      setArticles(data.articles);setReady(true);
      setSelected(old=>old?data.articles.find((a:Article)=>a.id===old.id)||null:null);
    } catch(e) {setReady(false);setMessage(e instanceof Error?e.message:"Verbindung fehlgeschlagen");}
    finally {setBusy(false);}
  },[call]);

  const save=async(status?:Article["status"])=>{
    if(!selected)return;
    setBusy(true);setMessage("");
    try {
      const response=await call("/api/editor/articles/"+selected.id,{method:"PATCH",body:JSON.stringify({
        title:selected.title,standfirst:selected.standfirst,body:selected.body,category:selected.category,author:selected.author||"",...(status?{status}:{})
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Speichern fehlgeschlagen");
      setMessage(status==="PUBLISHED"?"Artikel veröffentlicht.":"Änderungen gespeichert.");
      await load();
    } catch(e) {setMessage(e instanceof Error?e.message:"Speichern fehlgeschlagen");}
    finally {setBusy(false);}
  };
  const edit=(key:keyof Article,value:string)=>setSelected(old=>old?{...old,[key]:value}:null);
  const visible=articles.filter(a=>a.status===filter);

  return <main style={{minHeight:"100vh",background:"#f5f4f0",color:"#17212b",fontFamily:"Arial,sans-serif"}}>
    <header style={{background:"#142332",color:"#fff",padding:"17px 24px",display:"flex",justifyContent:"space-between"}}>
      <a href="/" style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:"#fff"}}>pulse.</a><span style={{fontSize:11,letterSpacing:2}}>REDAKTION · INTERN</span>
    </header>
    <div className="editor-grid" style={{maxWidth:1200,margin:"30px auto",padding:"0 18px",display:ready?"grid":"block",gridTemplateColumns:"270px minmax(0,1fr)",gap:20}}>
      {!ready?<section style={{maxWidth:440,margin:"55px auto",padding:28,background:"#fff",border:"1px solid #e5e4df",borderRadius:8}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:30}}>Redaktionszugang</h1>
        <p style={{fontSize:13,color:"#6d7882",lineHeight:1.6}}>Nur für autorisierte Redakteure. Der Schlüssel bleibt im Arbeitsspeicher dieser Seite.</p>
        <form onSubmit={e=>{e.preventDefault();void load();}}>
          <input type="password" required value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Redaktionsschlüssel" style={inputStyle}/>
          <button disabled={busy} style={{...inputStyle,background:"#142332",color:"#fff",fontWeight:700}}>{busy?"Prüfe …":"Anmelden"}</button>
        </form>
        {message&&<p role="alert" style={{color:"#b33b31",fontSize:12}}>{message}</p>}
      </section>:<>
        <aside style={{background:"#fff",padding:18,border:"1px solid #e5e4df",borderRadius:7,alignSelf:"start"}}>
          <h2 style={{fontFamily:"Georgia,serif",fontSize:22}}>Posteingang</h2>
          {(["DRAFT","IN_REVIEW","PUBLISHED"] as const).map(s=><button key={s} onClick={()=>{setFilter(s);setSelected(null);}} style={{width:"100%",padding:12,border:0,borderBottom:"1px solid #eee",background:filter===s?"#f7f1e8":"white",textAlign:"left",fontWeight:700}}>{s==="DRAFT"?"Entwürfe":s==="IN_REVIEW"?"In Prüfung":"Veröffentlicht"} <span style={{float:"right"}}>{articles.filter(a=>a.status===s).length}</span></button>)}
          <button onClick={()=>void load()} style={{marginTop:15,border:0,background:"transparent",color:"#b84033"}}>Liste aktualisieren</button>
        </aside>
        <section style={{minWidth:0,background:"#fff",padding:22,border:"1px solid #e5e4df",borderRadius:7}}>
          {selected?<>
            <button onClick={()=>setSelected(null)} style={{border:0,background:"transparent",color:"#b84033"}}>← Zur Liste</button>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:28}}>Artikel bearbeiten</h1>
            <label style={{display:"block",fontSize:11,fontWeight:700}}>Überschrift<input value={selected.title} onChange={e=>edit("title",e.target.value)} style={inputStyle}/></label>
            <label style={{display:"block",fontSize:11,fontWeight:700,marginTop:13}}>Vorspann<textarea rows={3} value={selected.standfirst} onChange={e=>edit("standfirst",e.target.value)} style={inputStyle}/></label>
            <label style={{display:"block",fontSize:11,fontWeight:700,marginTop:13}}>Artikeltext<textarea rows={14} value={selected.body} onChange={e=>edit("body",e.target.value)} style={{...inputStyle,lineHeight:1.6}}/></label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:12}}>
              <label style={{fontSize:11,fontWeight:700}}>Ressort<select value={selected.category} onChange={e=>edit("category",e.target.value)} style={inputStyle}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
              <label style={{fontSize:11,fontWeight:700}}>Autor<input value={selected.author||""} onChange={e=>edit("author",e.target.value)} style={inputStyle}/></label>
            </div>
            <div style={{padding:14,background:"#f7f6f2",marginTop:18,borderRadius:5}}>
              <strong style={{fontSize:12}}>Quellen ({selected.sources.length})</strong>
              {selected.sources.map((s,i)=><p key={i} style={{fontSize:11}}><a href={s.sourceUrl} target="_blank" rel="noreferrer" style={{color:"#b84033",textDecoration:"underline"}}>{s.title||s.source.name} ↗</a></p>)}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:18}}>
              <button disabled={busy} onClick={()=>void save()} style={{padding:12,background:"#142332",color:"#fff",border:0,borderRadius:4}}>Entwurf speichern</button>
              {selected.status!=="PUBLISHED"&&<button disabled={busy} onClick={()=>void save("IN_REVIEW")} style={{padding:12,background:"#f1e7d5",border:0,borderRadius:4}}>Zur Prüfung</button>}
              {selected.status!=="PUBLISHED"&&<button disabled={busy} onClick={()=>void save("PUBLISHED")} style={{padding:12,background:"#d84a3a",color:"#fff",border:0,borderRadius:4}}>Veröffentlichen</button>}
            </div>
            {message&&<p role="status" style={{fontSize:12,color:message.includes("fehl")||message.includes("Bitte")?"#b33b31":"#28764b"}}>{message}</p>}
          </>:<>
            <h1 style={{fontFamily:"Georgia,serif",fontSize:28}}>{filter==="DRAFT"?"Eingegangene Entwürfe":filter==="IN_REVIEW"?"Artikel in Prüfung":"Veröffentlichte Artikel"}</h1>
            {visible.length?visible.map(a=><button key={a.id} onClick={()=>{setSelected(a);setMessage("");}} style={{display:"block",width:"100%",textAlign:"left",padding:"16px 3px",border:0,borderTop:"1px solid #eee",background:"white"}}>
              <span style={{color:"#d84a3a",fontSize:10,fontWeight:800}}>{a.category} · {a.sources.length} QUELLE(N)</span><strong style={{display:"block",fontFamily:"Georgia,serif",fontSize:19,margin:"7px 0"}}>{a.title}</strong><small style={{color:"#818b93"}}>{a.sourcePublishedAt?new Date(a.sourcePublishedAt).toLocaleString("de-DE"):"Importiert"}</small>
            </button>):<p style={{color:"#818b93",padding:"25px 0"}}>Keine Artikel in diesem Bereich.</p>}
          </>}
        </section>
      </>}
    </div>
    <style>{'@media(max-width:720px){.editor-grid{grid-template-columns:1fr!important}}'}</style>
  </main>;
}