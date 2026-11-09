// ===== DATABASE (disimpan di script JS; salinan di localStorage bila tersedia) =====
const DAY=864e5,KEY="mahrev_db_v2";
const MN=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const DB={products:[
  {id:1,nama:"Es Kristal 2 kg",beli:5000,harga:8000,stok:60},
  {id:2,nama:"Es Kristal 5 kg",beli:12000,harga:18000,stok:40},
  {id:3,nama:"Es Kristal Karung 25 kg",beli:55000,harga:75000,stok:20}],sales:[],nid:1,pid:4};
(function seed(){let r=7;const rnd=()=>(r=(r*9301+49297)%233280)/233280;
  const N=["Warung Bu Siti","Kedai Kopi Pagi","Pak Joko","Resto Laut","Es Teh Mantap","Pak Andi","Kafe Senja"];
  for(let d=150;d>=0;d--){const n=rnd()<.25?0:rnd()<.5?1:2;
    for(let k=0;k<n;k++){const p=DB.products[Math.floor(rnd()*3)],q=1+Math.floor(rnd()*(p.id===3?3:7));
      DB.sales.push({id:DB.nid++,t:Date.now()-d*DAY-(k+1)*900e3,cust:N[Math.floor(rnd()*7)],pid:p.id,nama:p.nama,qty:q,jual:p.harga,beli:p.beli})}}})();
try{const s=localStorage.getItem(KEY);if(s){const o=JSON.parse(s);if(o&&o.products&&o.sales)Object.assign(DB,o)}}catch(e){}
const save=()=>{DB.rev=Date.now();try{localStorage.setItem(KEY,JSON.stringify(DB))}catch(e){}if(window.cloudPush)cloudPush()};
