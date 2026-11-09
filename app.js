// ===== HELPERS =====
const $=s=>document.querySelector(s);
const rp=n=>(n<0?"-":"")+"Rp "+Math.abs(Math.round(n)).toLocaleString("id-ID");
const short=n=>n>=1e6?(n/1e6).toFixed(1)+" jt":Math.round(n/1e3)+" rb";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const prod=id=>DB.products.find(p=>p.id===id);
const inM=(s,y,m)=>{const d=new Date(s.t);return d.getFullYear()===y&&d.getMonth()===m};
const sum=L=>{const om=L.reduce((a,s)=>a+s.qty*s.jual,0),mo=L.reduce((a,s)=>a+s.qty*s.beli,0);return{om,mo,lb:om-mo}};
const pct=(a,b)=>b?(a/b*100).toFixed(1)+"%":"0%";
const jam=t=>new Date(t).toLocaleString("id-ID",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1800)}
const now=new Date();let mo={y:now.getFullYear(),m:now.getMonth()},tab="home",form={pid:1,qty:1,cust:""},sheet=null,delArm=false;
const TABS=[["home","⌂","Beranda"],["sell","＋","Jual"],["stock","▤","Stok"],["hist","☰","Riwayat"]];

function bars(items,cols){
  const w=322,max=Math.max(1,...items.flatMap(i=>i.v)),sw=w/items.length,bw=Math.min(28,(sw-8)/cols.length);
  return `<svg viewBox="0 0 ${w} 150" width="100%" role="img"><text x="0" y="10">maks ${short(max)}</text>`+items.map((it,i)=>{
    const x0=i*sw+(sw-bw*cols.length)/2;
    return it.v.map((v,j)=>{const h=Math.max(3,v/max*100);return `<rect x="${x0+j*bw}" y="${122-h}" width="${bw-3}" height="${h}" rx="5" fill="${cols[j]}"/>`}).join("")+`<text x="${i*sw+sw/2}" y="140" text-anchor="middle">${it.l}</text>`}).join("")+`</svg>`}

// ===== VIEWS =====
function home(){
  const L=DB.sales.filter(s=>inM(s,mo.y,mo.m)),a=sum(L),isNow=mo.y===now.getFullYear()&&mo.m===now.getMonth();
  const d7=[...Array(7)].map((_,i)=>{const t=Date.now()-(6-i)*DAY,d=new Date(t);
    return{l:d.toLocaleDateString("id-ID",{weekday:"short"}),v:[sum(DB.sales.filter(s=>new Date(s.t).toDateString()===d.toDateString())).om]}});
  const m6=[...Array(6)].map((_,i)=>{const d=new Date(mo.y,mo.m-5+i,1),x=sum(DB.sales.filter(s=>inM(s,d.getFullYear(),d.getMonth())));
    return{l:MN[d.getMonth()].slice(0,3),v:[x.om,x.lb]}});
  const stokMod=DB.products.reduce((x,p)=>x+p.stok*p.beli,0);
  return `<div class="hero"><small>Penjualan Es Kristal<span id="sync">${window.syncTxt?" · "+syncTxt():""}</span></small><h1>Warung Mahrev</h1></div>
  <div class="mon"><button onclick="mv(-1)">‹</button><b>${MN[mo.m]} ${mo.y}</b><button onclick="mv(1)" ${isNow?"disabled":""}>›</button></div>
  <div class="grid">
   <div class="stat"><span>Omzet (penjualan)</span><b>${rp(a.om)}</b></div>
   <div class="stat"><span>Modal (harga beli)</span><b>${rp(a.mo)}</b></div>
   <div class="stat"><span>Keuntungan</span><b style="color:var(--ok)">${rp(a.lb)}</b></div>
   <div class="stat"><span>Margin</span><b>${pct(a.lb,a.om)}</b></div>
  </div>
  <div class="card"><h2>Penjualan 7 Hari Terakhir</h2>${bars(d7,["var(--pr)"])}</div>
  <div class="card"><h2>Omzet &amp; Keuntungan per Bulan</h2><div class="legend"><span><i style="background:var(--pr)"></i>Omzet</span><span><i style="background:var(--ok)"></i>Keuntungan</span></div>${bars(m6,["var(--pr)","var(--ok)"])}</div>
  <div class="card"><div class="row" style="padding:0;border:0"><div><b>Modal tertanam di stok</b><small>Total harga beli barang yang belum terjual</small></div><b>${rp(stokMod)}</b></div></div>`}
function sell(){
  if(!DB.products.length)return `<h2 class="t">Penjualan Baru</h2><div class="card"><div class="empty">Belum ada produk. Tambahkan dulu di tab Stok.</div></div>`;
  if(!prod(form.pid))form.pid=DB.products[0].id;const p=prod(form.pid);
  return `<h2 class="t">Penjualan Baru</h2><div class="card" style="margin-top:12px">
   <div class="thumb" style="width:100%;height:150px;border-radius:18px"></div>
   <label>Produk</label>
   <select onchange="form.pid=+this.value;form.qty=1;go()">${DB.products.map(x=>`<option value="${x.id}" ${x.id===form.pid?"selected":""}>${esc(x.nama)} · ${rp(x.harga)}</option>`).join("")}</select>
   <label>Jumlah (stok: ${p.stok})</label>
   <div class="qty"><button onclick="chg(-1)">−</button><input type="number" inputmode="numeric" min="1" value="${form.qty}" onchange="form.qty=Math.max(1,+this.value||1);go()"><button onclick="chg(1)">+</button></div>
   <label>Nama pembeli (opsional)</label>
   <input placeholder="Contoh: Warung Bu Ani" value="${esc(form.cust)}" oninput="form.cust=this.value">
   <div class="total"><span>Total<small class="sm">Estimasi laba ${rp((p.harga-p.beli)*form.qty)}</small></span><b>${rp(p.harga*form.qty)}</b></div>
   <button class="btn" onclick="doSell()">Simpan Penjualan</button></div>`}
function stock(){
  const max=Math.max(...DB.products.map(p=>p.stok),80),tm=DB.products.reduce((x,p)=>x+p.stok*p.beli,0),tj=DB.products.reduce((x,p)=>x+p.stok*p.harga,0);
  return `<div style="display:flex;justify-content:space-between;align-items:center"><h2 class="t">Stok Produk</h2><button class="pill a" onclick="openSheet(0)">+ Tambah</button></div>
  <div class="grid"><div class="stat"><span>Modal stok</span><b>${rp(tm)}</b></div><div class="stat"><span>Potensi omzet</span><b>${rp(tj)}</b></div></div>`+
  (DB.products.length?DB.products.map(p=>`<div class="card" style="margin-top:12px"><div class="row" style="padding:0;border:0"><div style="display:flex;gap:12px;align-items:center"><div class="thumb"></div><div><b>${esc(p.nama)}</b><small>Beli ${rp(p.beli)} · Jual ${rp(p.harga)}</small><small>Margin ${pct(p.harga-p.beli,p.harga)} · sisa ${p.stok}</small></div></div></div>
  <div class="bar"><i style="width:${Math.min(100,p.stok/max*100)}%"></i></div>
  <div style="display:flex;gap:8px;margin-top:12px"><button class="pill" onclick="restock(${p.id},10)">+10</button><button class="pill" onclick="restock(${p.id},50)">+50</button><button class="pill" style="margin-left:auto" onclick="openSheet(${p.id})">Edit</button></div></div>`).join(""):`<div class="card"><div class="empty">Belum ada produk</div></div>`)}
function hist(){
  const list=[...DB.sales].sort((a,b)=>b.t-a.t).slice(0,40);
  return `<h2 class="t">Riwayat</h2><div class="card" style="margin-top:12px">`+(list.length?list.map(s=>`<div class="row"><div><b>${esc(s.cust||"Pembeli umum")}</b><small>${esc(s.nama)} × ${s.qty} · ${jam(s.t)}</small><small>Laba ${rp(s.qty*(s.jual-s.beli))}</small></div>
  <div style="text-align:right"><b>${rp(s.qty*s.jual)}</b><button class="del" onclick="delSale(${s.id})" aria-label="Hapus">×</button></div></div>`).join(""):`<div class="empty">Belum ada transaksi</div>`)+`</div>`}

// ===== CRUD PRODUK =====
function openSheet(id){sheet=id?{...prod(id)}:{id:0,nama:"",beli:"",harga:"",stok:""};delArm=false;drawSheet()}
function drawSheet(){const el=$("#sheet");if(!sheet){el.innerHTML="";return}
  el.innerHTML=`<div class="ov" onclick="if(event.target===this){sheet=null;drawSheet()}"><div class="sh"><h2>${sheet.id?"Edit":"Tambah"} Produk</h2>
  <label>Nama produk</label><input id="f_n" value="${esc(sheet.nama)}" placeholder="Es Kristal 10 kg">
  <label>Harga beli (modal per unit)</label><input id="f_b" inputmode="numeric" value="${sheet.beli}" placeholder="0">
  <label>Harga jual</label><input id="f_h" inputmode="numeric" value="${sheet.harga}" placeholder="0">
  <label>Stok</label><input id="f_s" inputmode="numeric" value="${sheet.stok}" placeholder="0">
  <button class="btn" onclick="saveP()">Simpan</button>
  ${sheet.id?`<button class="btn ghost" onclick="delP()">${delArm?"Tekan lagi untuk menghapus":"Hapus produk"}</button>`:""}</div></div>`}
function saveP(){
  const n=$("#f_n").value.trim(),b=+$("#f_b").value,h=+$("#f_h").value,s=+$("#f_s").value;
  if(!n||!(h>0)||b<0||s<0||isNaN(b+s)){toast("Lengkapi data dengan benar");return}
  if(sheet.id){Object.assign(prod(sheet.id),{nama:n,beli:b,harga:h,stok:Math.floor(s)})}
  else DB.products.push({id:DB.pid++,nama:n,beli:b,harga:h,stok:Math.floor(s)});
  save();toast(sheet.id?"Produk diperbarui":"Produk ditambahkan");sheet=null;drawSheet();go()}
function delP(){if(!delArm){delArm=true;drawSheet();return}
  DB.products=DB.products.filter(p=>p.id!==sheet.id);save();toast("Produk dihapus");sheet=null;drawSheet();go()}
function restock(id,n){prod(id).stok+=n;save();toast("Stok ditambah "+n);go()}

// ===== TRANSAKSI =====
function chg(d){form.qty=Math.max(1,form.qty+d);go()}
function mv(d){const x=new Date(mo.y,mo.m+d,1);mo={y:x.getFullYear(),m:x.getMonth()};go()}
function doSell(){const p=prod(form.pid);
  if(form.qty>p.stok){toast("Stok tidak cukup");return}
  p.stok-=form.qty;DB.sales.push({id:DB.nid++,t:Date.now(),cust:form.cust.trim(),pid:p.id,nama:p.nama,qty:form.qty,jual:p.harga,beli:p.beli});
  save();form={pid:p.id,qty:1,cust:""};toast("Penjualan tersimpan ✓");tab="home";mo={y:now.getFullYear(),m:now.getMonth()};go()}
function delSale(id){const s=DB.sales.find(x=>x.id===id);if(!s)return;const p=prod(s.pid);if(p)p.stok+=s.qty;DB.sales=DB.sales.filter(x=>x.id!==id);save();toast("Transaksi dihapus");go()}
function go(){
  $("#app").innerHTML={home,sell,stock,hist}[tab]();
  $("#nav").innerHTML=TABS.map(t=>`<button class="${t[0]===tab?"on":""}" onclick="tab='${t[0]}';go();scrollTo(0,0)"><span>${t[1]}</span>${t[2]}</button>`).join("")}
go();
