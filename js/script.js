/* DESA HARMONI - PROTOTYPE INTERAKTIF
   Seluruh data disimpan pada localStorage browser yang sama.
   Ini simulasi PBL, bukan backend/database atau autentikasi produksi.
*/
(() => {
  'use strict';
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const read = (key, fallback=[]) => { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const today = () => new Date().toLocaleDateString('id-ID');
  const path = location.pathname.toLowerCase();
  const admin = path.includes('/admin/');
  const loginPage = path.endsWith('/login.html');
  const keys = {apps:'desaApplications', announcements:'desaAnnouncements', info:'desaInfoRecords', visits:'desaVisits'};

  if (admin && !loginPage && sessionStorage.getItem('desaAdminLogin') !== 'yes') {
    location.replace('login.html');
    return;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const toast = message => {
      let el=$('#desaToast');
      if(!el){el=document.createElement('div');el.id='desaToast';el.className='alert alert-success shadow position-fixed';el.style.cssText='right:18px;bottom:18px;z-index:4000;max-width:360px';document.body.append(el);}
      el.textContent=message;el.hidden=false;clearTimeout(window.__desaToastTimer);window.__desaToastTimer=setTimeout(()=>el.hidden=true,3500);
    };
    const field = (label,name,type='text',value='',required=true) => `<label class="form-label mt-2">${esc(label)}</label><input class="form-control" name="${esc(name)}" type="${esc(type)}" value="${esc(value)}" ${required?'required':''}>`;
    const area = (label,name,value='',required=true) => `<label class="form-label mt-2">${esc(label)}</label><textarea class="form-control" name="${esc(name)}" rows="4" ${required?'required':''}>${esc(value)}</textarea>`;
    const selectField = (label,name,options,value='') => `<label class="form-label mt-2">${esc(label)}</label><select class="form-select" name="${esc(name)}">${options.map(o=>`<option value="${esc(o)}" ${o===value?'selected':''}>${esc(o)}</option>`).join('')}</select>`;
    const modal = (title, body, saveLabel, onSave) => {
      $('#desaModal')?.remove();
      const wrap=document.createElement('div');wrap.id='desaModal';wrap.className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';wrap.style.cssText='background:#0008;z-index:3500;padding:16px';
      wrap.innerHTML=`<div class="bg-white rounded-4 shadow p-4" style="width:min(600px,100%);max-height:92vh;overflow:auto"><div class="d-flex justify-content-between align-items-center mb-3"><h5 class="mb-0">${esc(title)}</h5><button type="button" class="btn-close" data-close-modal aria-label="Tutup"></button></div><form id="desaModalForm">${body}<div class="d-flex justify-content-end gap-2 mt-4"><button type="button" class="btn btn-light" data-close-modal>Batal</button><button type="submit" class="btn btn-success">${esc(saveLabel||'Simpan')}</button></div></form></div>`;
      document.body.append(wrap);
      const close=()=>wrap.remove();$$('[data-close-modal]',wrap).forEach(b=>b.addEventListener('click',close));wrap.addEventListener('click',e=>{if(e.target===wrap)close();});
      $('#desaModalForm',wrap).addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.currentTarget));if(onSave(data)!==false)close();});
    };
    const exportCSV = (filename, rows) => {
      const csv=rows.map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');
      const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };

    // Login and logout simulation
    if(loginPage){
      $('#adminLoginForm')?.addEventListener('submit',e=>{e.preventDefault();const u=$('#username')?.value.trim(),p=$('#password')?.value;if(u==='admin'&&p==='desa123'){sessionStorage.setItem('desaAdminLogin','yes');location.href='index.html';}else{$('#loginMessage').textContent='Username atau password tidak sesuai.';}});
      return;
    }
    if(admin){
      const sidebar=$('aside');if(sidebar&&!$('#desaLogout')){const b=document.createElement('button');b.id='desaLogout';b.type='button';b.className='btn btn-outline-light w-100 mt-3';b.innerHTML='<i class="bi bi-box-arrow-right me-2"></i>Logout';b.addEventListener('click',()=>{sessionStorage.removeItem('desaAdminLogin');location.href='login.html';});sidebar.append(b);}
      const date=$('#adminToday');if(date)date.textContent=today();
    } else {
      const visits=read(keys.visits,[]);visits.push({page:document.title,path:location.pathname,date:new Date().toISOString()});write(keys.visits,visits);
    }

    // USER: submit service request and track its status
    if(!admin && path.endsWith('/layanan.html')){
      const serviceCards=$$('.service-detail-card');
      const tracking=document.createElement('section');
      tracking.className='container my-5';
      tracking.id='trackingLayanan';
      tracking.innerHTML=`<div class="card border-0 shadow-sm p-4">
        <h4 class="mb-2">Lacak Pengajuan Layanan</h4>
        <p class="text-muted">Masukkan nomor pengajuan yang diperoleh setelah mengirim formulir.</p>
        <form id="trackForm" class="row g-2">
          <div class="col-md-8"><input class="form-control" id="trackNumber" placeholder="Contoh: DH-12345678" autocomplete="off" required></div>
          <div class="col-md-4"><button class="btn btn-outline-success w-100" type="submit"><i class="bi bi-search me-1"></i>Lacak Status</button></div>
        </form>
        <div id="trackResult" class="mt-3" aria-live="polite"></div>
        <small class="text-muted mt-2">Catatan: data pelacakan hanya tersedia pada browser yang sama dengan browser pengajuan.</small>
      </div>`;
      const footer=$('footer');
      if(footer)footer.before(tracking);else ($('main')||document.body).append(tracking);

      function track(){
        const id=$('#trackNumber')?.value.trim();
        if(!id)return;
        const app=read(keys.apps,[]).find(x=>String(x.id).toLowerCase()===id.toLowerCase());
        const result=$('#trackResult');
        if(!app){result.innerHTML='<div class="alert alert-warning mb-0">Nomor pengajuan tidak ditemukan. Periksa kembali nomor atau gunakan browser yang sama dengan saat mengajukan.</div>';return;}
        const steps=['Menunggu','Diproses','Disetujui'];
        const current=app.status==='Ditolak'?'Ditolak':app.status;
        const badge=current==='Disetujui'?'success':current==='Ditolak'?'danger':current==='Diproses'?'info':'warning';
        const progress=current==='Menunggu'?1:current==='Diproses'?2:current==='Disetujui'?3:0;
        result.innerHTML=`<div class="card border p-3">
          <div class="d-flex flex-wrap justify-content-between gap-2 align-items-center mb-2"><strong>${esc(app.layanan)}</strong><span class="badge text-bg-${badge}">${esc(current)}</span></div>
          <div class="small text-muted mb-3">Nomor: <strong>${esc(app.id)}</strong> · Diajukan ${new Date(app.tanggal).toLocaleString('id-ID')}</div>
          <div class="row g-2 mb-3">${steps.map((step,i)=>`<div class="col-4"><div class="p-2 rounded text-center ${progress>=i+1?'bg-success text-white':'bg-light text-secondary'}"><small>${i+1}. ${step}</small></div></div>`).join('')}</div>
          ${current==='Ditolak'?'<div class="alert alert-danger mb-2">Permohonan belum dapat disetujui.</div>':''}
          <p class="mb-1"><strong>Catatan Admin:</strong></p><p class="mb-0">${esc(app.catatan||'Belum ada catatan dari Admin.')}</p>
        </div>`;
      }
      $('#trackForm')?.addEventListener('submit',e=>{e.preventDefault();track();});

      serviceCards.forEach(card=>{
        const button=$('a.btn-success, button.btn-success',card);
        if(!button)return;
        button.addEventListener('click',e=>{
          e.preventDefault();
          const service=$('h5',card)?.textContent.trim()||'Layanan Administrasi';
          modal('Formulir Pengajuan Layanan',`<div class="alert alert-light border"><strong>Jenis layanan:</strong> ${esc(service)}</div>
            ${field('Nama lengkap','nama')}${field('NIK (16 digit contoh)','nik')}${field('Alamat lengkap','alamat')}${field('Nomor WhatsApp','telepon','tel')}${area('Keperluan pengajuan','keperluan')}
            <p class="small text-muted mt-3 mb-0">Gunakan data fiktif untuk demonstrasi. Jangan memasukkan NIK atau nomor telepon pribadi.</p>`,'Kirim Pengajuan',data=>{
              if(data.nama.trim().length<3){toast('Nama lengkap minimal 3 karakter.');return false;}
              if(!/^\d{16}$/.test(data.nik.trim())){toast('NIK contoh harus terdiri dari 16 digit.');return false;}
              if(!/^\d{10,15}$/.test(data.telepon.replace(/[\s-]/g,''))){toast('Nomor WhatsApp harus terdiri dari 10–15 digit.');return false;}
              if(data.keperluan.trim().length<10){toast('Keperluan minimal 10 karakter.');return false;}
              const apps=read(keys.apps,[]);
              const id='DH-'+String(Date.now()).slice(-8);
              apps.unshift({id,nama:data.nama.trim(),nik:data.nik.trim(),alamat:data.alamat.trim(),telepon:data.telepon.trim(),keperluan:data.keperluan.trim(),layanan:service,tanggal:new Date().toISOString(),status:'Menunggu',catatan:''});
              write(keys.apps,apps);
              const input=$('#trackNumber');if(input)input.value=id;
              track();
              toast('Pengajuan berhasil disimpan. Nomor: '+id);
            });
        });
      });

      // Keep service count and empty-state feedback synchronized with search/filter results.
      const serviceList=$('#serviceList');
      if(serviceList&&!$('#serviceEmptyState')){
        const empty=document.createElement('div');empty.id='serviceEmptyState';empty.className='col-12 text-center text-muted py-4';empty.hidden=true;empty.textContent='Tidak ditemukan layanan yang sesuai.';serviceList.append(empty);
      }
      const updateServiceSummary=()=>{
        const visible=serviceCards.filter(card=>card.style.display!=='none');
        const count=$('.service-count');if(count)count.textContent=`${visible.length} dari ${serviceCards.length} Layanan`;
        const empty=$('#serviceEmptyState');if(empty)empty.hidden=visible.length!==0;
      };
      window.__desaUpdateServiceSummary=updateServiceSummary;
      updateServiceSummary();
    }

    // USER: announcements created by Admin appear in the existing announcement lists.
    if(!admin){
      const items=read(keys.announcements,[]);
      if(path.endsWith('/pengumuman.html')){
        const list=$('.announcement-page-list');
        if(list){
          items.slice().reverse().forEach((item,index)=>{
            const card=document.createElement('article');
            card.className='announcement-page-item admin-announcement-item';
            card.dataset.announcementId=item.id;
            card.innerHTML=`<div class="announcement-large-icon ${['blue','green','orange','red'][index%4]}"><i class="bi bi-megaphone"></i></div>
              <div class="announcement-page-content"><div class="announcement-meta">Informasi · ${esc(item.tanggal||'Pengumuman terbaru')}</div>
              <h5>${esc(item.judul)}</h5><p>${esc(String(item.isi).slice(0,180))}${String(item.isi).length>180?'…':''}</p>
              <a href="#" class="read-more" data-announcement-title="${esc(item.judul)}" data-announcement-body="${esc(item.isi)}">Selengkapnya <i class="bi bi-arrow-right"></i></a></div>`;
            list.prepend(card);
          });
        }
      }
      if(path.endsWith('/index.html')){
        const list=$('.announcement-list');
        if(list){
          items.slice(0,3).slice().reverse().forEach(item=>{
            const link=document.createElement('a');link.href='pengumuman.html';link.className='announcement-item admin-announcement-home';
            link.innerHTML=`<div class="announcement-icon green"><i class="bi bi-megaphone"></i></div><div class="announcement-content"><h6>${esc(item.judul)}</h6><small>${esc(item.tanggal||'Pengumuman terbaru')}</small></div><i class="bi bi-chevron-right announcement-arrow"></i>`;
            list.prepend(link);
          });
        }
      }
    }

    // ADMIN: information CRUD with three editable initial categories
    if(admin && path.endsWith('/informasi.html')){
      const defaults=[
        {id:'profil',judul:'Profil Desa Harmoni',kategori:'Profil Desa',isi:'Desa Harmoni merupakan wilayah pemerintahan yang memiliki potensi alam, sumber daya manusia, dan kehidupan masyarakat yang beragam. Website ini menyediakan informasi desa agar masyarakat memperoleh informasi secara mudah, cepat, dan transparan.',updated:today()},
        {id:'visi',judul:'Visi dan Misi Desa',kategori:'Visi dan Misi',isi:'Mewujudkan Desa Harmoni yang maju, mandiri, transparan, dan sejahtera melalui pelayanan publik yang berkualitas.',updated:today()},
        {id:'struktur',judul:'Struktur Pemerintahan',kategori:'Struktur Pemerintahan',isi:'Struktur pemerintahan Desa Harmoni terdiri dari Kepala Desa, Sekretaris Desa, Kepala Urusan, Kepala Seksi, dan Kepala Dusun.',updated:today()}
      ];
      let records=read(keys.info,null);if(!records){const old=read('desaInfo',[]);records=[...defaults,...old.map(x=>({...x,kategori:x.kategori||'Informasi Tambahan',updated:today()}))];write(keys.info,records);}
      const tbody=$('#infoTableBody');
      const render=()=>{records=read(keys.info,defaults);if(tbody)tbody.innerHTML=records.length?records.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.judul)}</strong><div class="small text-muted">${esc(x.isi).slice(0,100)}${x.isi.length>100?'…':''}</div></td><td>${esc(x.kategori)}</td><td>${esc(x.updated||'-')}</td><td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" data-edit-info="${esc(x.id)}"><i class="bi bi-pencil"></i> Edit</button> <button class="btn btn-sm btn-outline-danger" data-delete-info="${esc(x.id)}"><i class="bi bi-trash"></i> Hapus</button></td></tr>`).join(''):'<tr><td colspan="5" class="text-center text-muted py-4">Belum ada informasi.</td></tr>';
        const count=cat=>records.filter(x=>x.kategori===cat).length;$('#infoProfileCount').textContent=count('Profil Desa');$('#infoVisionCount').textContent=count('Visi dan Misi');$('#infoStructureCount').textContent=count('Struktur Pemerintahan');};
      const edit=(item=null)=>modal(item?'Edit Informasi':'Tambah Informasi',`${field('Judul Informasi','judul','text',item?.judul||'')}${selectField('Kategori','kategori',['Profil Desa','Visi dan Misi','Struktur Pemerintahan','Informasi Tambahan'],item?.kategori||'Informasi Tambahan')}${area('Isi Informasi','isi',item?.isi||'')}`,'Simpan Informasi',data=>{let arr=read(keys.info,defaults);if(item)arr=arr.map(x=>x.id===item.id?{...x,...data,updated:today()}:x);else arr.unshift({id:'INFO-'+Date.now(),...data,updated:today()});write(keys.info,arr);render();toast('Informasi berhasil disimpan.');});
      $('#addInfoBtn')?.addEventListener('click',()=>edit());
      tbody?.addEventListener('click',e=>{const ed=e.target.closest('[data-edit-info]'),del=e.target.closest('[data-delete-info]');let arr=read(keys.info,defaults);if(ed){const item=arr.find(x=>x.id===ed.dataset.editInfo);if(item)edit(item);}if(del&&confirm('Hapus informasi ini?')){write(keys.info,arr.filter(x=>x.id!==del.dataset.deleteInfo));render();toast('Informasi dihapus.');}});
      render();
    }

    // USER: apply Admin-managed information to the public information page.
    if(!admin && path.endsWith('/informasi.html')){
      const records=read(keys.info,null);
      if(records){
        const profile=records.find(x=>x.kategori==='Profil Desa');
        const vision=records.find(x=>x.kategori==='Visi dan Misi');
        const structure=records.find(x=>x.kategori==='Struktur Pemerintahan');
        if(profile){const card=$('#profil');if(card){const h2=$('h2',card);if(h2)h2.textContent=profile.judul;const paragraphs=$$('.col-md-7 p',card);if(paragraphs.length){paragraphs[0].textContent=profile.isi;paragraphs.slice(1).forEach(p=>p.remove());}}}
        else if($('#profil'))$('#profil').hidden=true;
        if(vision){const card=$('#visi-misi');if(card){const h2=$('h2',card);if(h2)h2.textContent=vision.judul;const p=$('.vision-box p',card);if(p){p.textContent=vision.isi;p.style.whiteSpace='pre-line';}if(/\bmisi\s*:/i.test(vision.isi)){const heading=$('h5.mt-4',card),list=$('.mission-list',card);if(heading)heading.hidden=true;if(list)list.hidden=true;}}}
        else if($('#visi-misi'))$('#visi-misi').hidden=true;
        if(structure){const card=$('#struktur');if(card){const h2=$('h2',card);if(h2)h2.textContent=structure.judul;let p=$('[data-admin-description]',card);if(!p){p=document.createElement('p');p.dataset.adminDescription='true';h2?.after(p);}p.textContent=structure.isi;}}
        else if($('#struktur'))$('#struktur').hidden=true;
        const extra=records.filter(x=>x.kategori==='Informasi Tambahan');
        const target=$('#struktur')?.parentElement;
        if(extra.length&&target){const box=document.createElement('section');box.className='content-card mt-4';box.innerHTML='<h2>Informasi Tambahan</h2>'+extra.map(x=>`<article class="border-bottom py-3"><h5>${esc(x.judul)}</h5><p class="mb-0">${esc(x.isi)}</p></article>`).join('');target.append(box);}
      }
    }

    // ADMIN: announcement CRUD
    if(admin && path.endsWith('/pengumuman.html')){
      const tbody=$('#announcementTableBody');
      const render=()=>{const arr=read(keys.announcements,[]);if(tbody)tbody.innerHTML=arr.length?arr.map((x,i)=>`<tr><td>${i+1}</td><td><strong>${esc(x.judul)}</strong></td><td>${esc(x.isi).slice(0,130)}${x.isi.length>130?'…':''}</td><td>${esc(x.tanggal||'-')}</td><td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" data-edit-ann="${esc(x.id)}"><i class="bi bi-pencil"></i> Edit</button> <button class="btn btn-sm btn-outline-danger" data-delete-ann="${esc(x.id)}"><i class="bi bi-trash"></i> Hapus</button></td></tr>`).join(''):'<tr><td colspan="5" class="text-center text-muted py-4">Belum ada pengumuman. Klik Tambah Pengumuman untuk membuatnya.</td></tr>';};
      const edit=item=>modal(item?'Edit Pengumuman':'Tambah Pengumuman',`${field('Judul Pengumuman','judul','text',item?.judul||'')}${area('Isi Pengumuman','isi',item?.isi||'')}`,'Simpan Pengumuman',data=>{let arr=read(keys.announcements,[]);if(item)arr=arr.map(x=>x.id===item.id?{...x,...data,tanggal:today()}:x);else arr.unshift({id:'ANN-'+Date.now(),...data,tanggal:today()});write(keys.announcements,arr);render();toast('Pengumuman berhasil disimpan.');});
      $('#addAnnouncementBtn')?.addEventListener('click',()=>edit(null));tbody?.addEventListener('click',e=>{const ed=e.target.closest('[data-edit-ann]'),del=e.target.closest('[data-delete-ann]');const arr=read(keys.announcements,[]);if(ed){const item=arr.find(x=>x.id===ed.dataset.editAnn);if(item)edit(item);}if(del&&confirm('Hapus pengumuman ini?')){write(keys.announcements,arr.filter(x=>x.id!==del.dataset.deleteAnn));render();toast('Pengumuman dihapus.');}});render();
    }

    // ADMIN: service verification
    if(admin && path.endsWith('/layanan.html')){
      const tbody=$('#applicationTableBody');
      const statusBadge=s=>s==='Disetujui'?'text-bg-success':s==='Ditolak'?'text-bg-danger':s==='Diproses'?'text-bg-info':'text-bg-warning';
      const render=()=>{const apps=read(keys.apps,[]),filter=$('#applicationStatusFilter')?.value||'Semua';const visible=filter==='Semua'?apps:apps.filter(x=>x.status===filter);
        if(tbody)tbody.innerHTML=visible.length?visible.map(a=>`<tr><td><strong>${esc(a.id)}</strong></td><td>${esc(a.nama)}</td><td>${esc(a.layanan)}</td><td>${new Date(a.tanggal).toLocaleDateString('id-ID')}</td><td><span class="badge ${statusBadge(a.status)}">${esc(a.status)}</span></td><td class="text-nowrap"><button class="btn btn-sm btn-outline-primary" data-detail-app="${esc(a.id)}"><i class="bi bi-eye"></i> Detail</button> <button class="btn btn-sm btn-outline-success" data-process-app="${esc(a.id)}">Proses</button></td></tr>`).join(''):'<tr><td colspan="6" class="text-center text-muted py-4">Tidak ada permohonan pada status ini.</td></tr>';
        $('#countMenunggu').textContent=apps.filter(x=>x.status==='Menunggu').length;$('#countDiproses').textContent=apps.filter(x=>x.status==='Diproses').length;$('#countSelesai').textContent=apps.filter(x=>['Disetujui','Ditolak'].includes(x.status)).length;};
      const changeStatus=app=>modal('Verifikasi Permohonan',`<div class="alert alert-light border"><strong>${esc(app.id)}</strong><br>${esc(app.layanan)} — ${esc(app.nama)}</div><p class="mb-1"><strong>Keperluan:</strong> ${esc(app.keperluan)}</p>${selectField('Status Permohonan','status',['Menunggu','Diproses','Disetujui','Ditolak'],app.status)}${area('Catatan Admin','catatan',app.catatan||'',false)}`,'Simpan Status',data=>{const arr=read(keys.apps,[]);const found=arr.find(x=>x.id===app.id);if(found){found.status=data.status;found.catatan=data.catatan;write(keys.apps,arr);render();toast('Status permohonan diperbarui.');}});
      $('#applicationStatusFilter')?.addEventListener('change',render);$('#refreshApplications')?.addEventListener('click',render);
      tbody?.addEventListener('click',e=>{const detail=e.target.closest('[data-detail-app]'),process=e.target.closest('[data-process-app]');const apps=read(keys.apps,[]);const id=detail?.dataset.detailApp||process?.dataset.processApp;const app=apps.find(x=>x.id===id);if(app)changeStatus(app);});render();
    }

    // ADMIN: visitor reporting and CSV export
    if(admin && path.endsWith('/pengunjung.html')){
      const tbody=$('#visitorTableBody');
      const render=()=>{const visits=read(keys.visits,[]).slice().sort((a,b)=>new Date(b.date)-new Date(a.date));const now=new Date();const todayVisits=visits.filter(v=>new Date(v.date).toDateString()===now.toDateString());const pages=new Set(visits.map(v=>v.path||v.page));$('#visitorTotal').textContent=visits.length;$('#visitorToday').textContent=todayVisits.length;$('#visitorPages').textContent=pages.size;
        const period=$('#visitorPeriod')?.value||'all';const filtered=visits.filter(v=>{if(period==='all')return true;const d=new Date(v.date);if(period==='today')return d.toDateString()===now.toDateString();return (now-d)<=Number(period)*86400000;});
        if(tbody)tbody.innerHTML=filtered.length?filtered.map((v,i)=>`<tr><td>${i+1}</td><td>${esc(v.page||v.path||'Halaman User')}</td><td>${new Date(v.date).toLocaleString('id-ID')}</td></tr>`).join(''):'<tr><td colspan="3" class="text-center text-muted py-4">Belum ada kunjungan pada periode ini.</td></tr>';};
      $('#visitorPeriod')?.addEventListener('change',render);$('#exportVisitors')?.addEventListener('click',()=>{const visits=read(keys.visits,[]);exportCSV('laporan-pengunjung-desa-harmoni.csv',[['Halaman','Alamat','Waktu'],...visits.map(v=>[v.page,v.path,new Date(v.date).toLocaleString('id-ID')])]);});render();
    }

    // ADMIN: dashboard values and latest applications
    if(admin && path.endsWith('/index.html')){
      const apps=read(keys.apps,[]),anns=read(keys.announcements,[]),visits=read(keys.visits,[]),infos=read(keys.info,[]);
      const stats=$$('.dashboard-stat h2');if(stats.length>=4){stats[0].textContent=visits.length;stats[1].textContent=apps.length;stats[2].textContent=anns.length;stats[3].textContent=infos.length||3;$$('.dashboard-stat span').forEach(el=>{el.textContent='Data simulasi browser ini';});}
      const rows=$('.dashboard-panel table tbody');if(rows)rows.innerHTML=apps.length?apps.slice(0,5).map((a,i)=>`<tr><td>${i+1}</td><td>${esc(a.nama)}</td><td>${esc(a.layanan)}</td><td>${new Date(a.tanggal).toLocaleDateString('id-ID')}</td><td><span class="badge ${a.status==='Disetujui'?'text-bg-success':a.status==='Ditolak'?'text-bg-danger':a.status==='Diproses'?'text-bg-info':'text-bg-warning'}">${esc(a.status)}</span></td></tr>`).join(''):'<tr><td colspan="5" class="text-center text-muted">Belum ada pengajuan layanan dari User.</td></tr>';
      // Dashboard announcement preview uses the same records as the announcement manager.
      const announcementPanel=$$('.dashboard-panel').find(panel=>$('h5',panel)?.textContent.toLowerCase().includes('pengumuman terbaru'));
      if(announcementPanel){const oldItems=$$('.announcement-item',announcementPanel);const anchor=$('a[href="pengumuman.html"]',announcementPanel);const list=document.createElement('div');list.id='dashboardAnnouncementList';list.innerHTML=anns.length?anns.slice(0,3).map((a,i)=>`<div class="announcement-item"><div class="announcement-icon ${['blue','green','orange'][i%3]}"><i class="bi bi-megaphone"></i></div><div><strong>${esc(a.judul)}</strong><small>${esc(a.isi).slice(0,75)}${a.isi.length>75?'…':''}</small></div><span>${esc(a.tanggal||'')}</span></div>`).join(''):'<p class="text-muted small mb-0">Belum ada pengumuman tambahan dari Admin.</p>';oldItems.forEach(el=>el.remove());if(anchor)anchor.closest('.panel-header')?.after(list);else announcementPanel.append(list);}
      // Recalculate the seven-day mini chart from locally recorded visits.
      const chart=$('.mini-chart');if(chart){const bars=$$('.mini-bar',chart);const labels=$$('.chart-labels span');const days=[];for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);days.push(d);}const counts=days.map(d=>visits.filter(v=>new Date(v.date).toDateString()===d.toDateString()).length);const max=Math.max(1,...counts);bars.forEach((bar,i)=>{bar.style.height=Math.max(8,(counts[i]/max)*84)+'%';const span=$('span',bar);if(span)span.textContent=counts[i];});labels.forEach((label,i)=>{if(days[i])label.textContent=days[i].toLocaleDateString('id-ID',{weekday:'short'});});}
      // All dashboard website buttons become real links
      $$('button').filter(b=>b.textContent.toLowerCase().includes('lihat website')).forEach(b=>{const a=document.createElement('a');a.className=b.className;a.href='../users/index.html';a.innerHTML=b.innerHTML;b.replaceWith(a);});
    }

    // Social links without configured URLs must explain their unavailable destination.
    $$('a[href="#"]').forEach(a=>{
      if(a.classList.contains('side-link')||a.classList.contains('read-more')||a.classList.contains('btn-success'))return;
      if(a.classList.contains('social-card')||a.closest('.social-links')||a.querySelector('.bi-facebook,.bi-instagram,.bi-youtube')){
        a.addEventListener('click',e=>{e.preventDefault();toast('Tautan media sosial belum dikonfigurasi oleh pengelola desa.');});
      }
    });

    // Service search and category filters (User page).
    const serviceSearch=$('#serviceSearch'),serviceColumns=$$('.service-column');
    const updateServiceSummary=()=>{
      const visible=serviceColumns.filter(c=>c.style.display!=='none');
      const count=$('.service-count');if(count)count.textContent=`${visible.length} dari ${serviceColumns.length} Layanan`;
      const empty=$('#serviceEmptyState');if(empty)empty.hidden=visible.length!==0;
    };
    if(serviceSearch&&serviceColumns.length){
      serviceSearch.addEventListener('input',function(){
        const q=this.value.trim().toLocaleLowerCase('id');
        serviceColumns.forEach(c=>c.style.display=c.textContent.toLocaleLowerCase('id').includes(q)?'':'none');
        updateServiceSummary();
      });
    }
    if(!admin && path.endsWith('/layanan.html')){
      $$('.side-menu .side-link').forEach(link=>link.addEventListener('click',e=>{
        e.preventDefault();const label=link.textContent.trim().toLocaleLowerCase('id');
        $$('.side-menu .side-link').forEach(x=>x.classList.remove('active'));link.classList.add('active');
        serviceColumns.forEach(card=>{
          const t=card.textContent.toLocaleLowerCase('id');let show=true;
          if(label.includes('surat keterangan'))show=t.includes('surat keterangan');
          else if(label.includes('kartu keluarga'))show=t.includes('kartu keluarga');
          else if(label.includes('akta kelahiran'))show=t.includes('akta kelahiran');
          else if(label.includes('akta kematian'))show=t.includes('akta kematian');
          else if(label.includes('administrasi kependudukan'))show=/kartu keluarga|akta kelahiran|akta kematian/.test(t);
          card.style.display=show?'':'none';
        });
        if(serviceSearch)serviceSearch.value='';updateServiceSummary();
      }));
    }

    // Announcement filters and a readable detail dialog (no JavaScript alert popups).
    if(!admin && path.endsWith('/pengumuman.html')){
      const showAnnouncementDetail=(title,body)=>{
        $('#announcementDetailDialog')?.remove();
        const overlay=document.createElement('div');overlay.id='announcementDetailDialog';overlay.className='position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center';overlay.style.cssText='background:#0008;z-index:3600;padding:16px';
        overlay.innerHTML=`<article class="bg-white rounded-4 shadow p-4" role="dialog" aria-modal="true" aria-labelledby="announcementDetailTitle" style="width:min(620px,100%);max-height:90vh;overflow:auto"><div class="d-flex justify-content-between align-items-start gap-3 mb-3"><h4 id="announcementDetailTitle" class="mb-0">${esc(title)}</h4><button type="button" class="btn-close" aria-label="Tutup"></button></div><p class="mb-0" style="white-space:pre-wrap;line-height:1.7">${esc(body)}</p><div class="text-end mt-4"><button type="button" class="btn btn-success" data-close-announcement>Tutup</button></div></article>`;
        document.body.append(overlay);
        const close=()=>overlay.remove();$('.btn-close',overlay).addEventListener('click',close);$('[data-close-announcement]',overlay).addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
        document.addEventListener('keydown',function escDialog(e){if(e.key==='Escape'){close();document.removeEventListener('keydown',escDialog);}});
      };
      const list=$('.announcement-page-list');
      list?.addEventListener('click',e=>{
        const link=e.target.closest('.read-more');if(!link)return;e.preventDefault();
        const card=link.closest('.announcement-page-item');
        const title=link.dataset.announcementTitle||$('h5',card)?.textContent.trim()||'Pengumuman';
        const body=link.dataset.announcementBody||$('p',card)?.textContent.trim()||'';
        showAnnouncementDetail(title,body);
      });
      $$('.side-menu .side-link').forEach(link=>link.addEventListener('click',e=>{
        e.preventDefault();const label=link.textContent.trim().toLocaleLowerCase('id');
        $$('.side-menu .side-link').forEach(x=>x.classList.remove('active'));link.classList.add('active');
        $$('.announcement-page-item').forEach(card=>{const meta=$('.announcement-meta',card)?.textContent.toLocaleLowerCase('id')||'';card.style.display=label==='semua'||meta.includes(label)?'':'none';});
      }));
    }

    // Make the existing sample phone and email values actionable on the Contact page.
    if(!admin && path.endsWith('/kontak.html')){
      const contactItems=$$('.contact-item');
      contactItems.forEach(item=>{
        const heading=$('h6',item)?.textContent.trim().toLowerCase();const p=$('p',item);if(!p)return;
        const value=p.textContent.trim();
        if(heading==='telepon'&&value){const link=document.createElement('a');link.href='tel:'+value.replace(/[^\d+]/g,'');link.textContent=value;link.className='text-decoration-none';p.textContent='';p.append(link);}
        if(heading==='email'&&value){const link=document.createElement('a');link.href='mailto:'+value;link.textContent=value;link.className='text-decoration-none';p.textContent='';p.append(link);}
      });
      const mapText=$('.map-placeholder p');if(mapText)mapText.textContent='Alamat dan titik peta perlu dikonfirmasi oleh pengelola desa sebelum lokasi resmi ditampilkan.';
    }

    console.log('JavaScript Desa Harmoni aktif.');
  });
})();
