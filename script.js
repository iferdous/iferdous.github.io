(() => {
  const content = window.PORTFOLIO;
  const reader=document.getElementById('reader');
  const body=document.getElementById('reader-body');
  const workspace=document.getElementById('workspace');
  const folderLinks=[...document.querySelectorAll('[data-folder]')];
  const mobile=matchMedia('(max-width:760px)');
  const theme=document.getElementById('theme-toggle');
  const back=document.getElementById('reader-back');
  const field=new window.ColorField(document.getElementById('color-field'),reader);
  const audio=new window.AmbientSound(document.getElementById('sound-toggle'));
  let route={folder:null,entry:null};
  let previousFolder=null;
  let sequence=0;
  let restoreScroll=0;

  function element(tag,className,text) {
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function icon(name) {const node=element('span',`icon ${name}`);node.setAttribute('aria-hidden','true');return node;}

  function sheetFor(folder,entry) {
    const sheet=element('article','reading-sheet');sheet.tabIndex=-1;
    const title=entry?.title || folder.title;
    if(entry?.meta)sheet.append(element('p','meta',entry.meta));
    const heading=element('h2','',title);heading.id='entry-heading';sheet.setAttribute('aria-labelledby','entry-heading');sheet.append(heading);
    const paragraphs=entry ? entry.paragraphs || [] : [folder.description];
    paragraphs.forEach((p)=>sheet.append(element('p','',p)));
    if(entry?.details){
      if(entry.details.title)sheet.append(element('h3','',entry.details.title));
      const list=element('ul');entry.details.items.forEach((item)=>list.append(element('li','',item)));sheet.append(list);
    }
    if(entry?.note)sheet.append(element('p','document-note',entry.note));
    if(entry?.links){
      const links=element('div','document-links');
      entry.links.forEach((item)=>{const a=element('a','',item.label);a.href=item.url;a.target='_blank';a.rel='noopener noreferrer';a.append(icon('arrow-up-right'));links.append(a);});sheet.append(links);
    }
    if(entry?.gallery || (!entry && folder.gallery)) {
      if(!window.PHOTOGRAPHS.length){const empty=element('div','empty-album');empty.append(icon('camera'),element('span','','First photographs coming soon.'));sheet.append(empty);}
      else {
        const gallery=element('div','photo-list');
        window.PHOTOGRAPHS.forEach((photo)=>{
          const figure=element('figure');const button=element('button');button.type='button';button.setAttribute('aria-label',`Open photograph: ${photo.alt}`);
          const img=element('img');img.src=photo.src;img.alt=photo.alt;img.loading='lazy';img.draggable=false;
          if(photo.width)img.width=photo.width;if(photo.height)img.height=photo.height;
          img.addEventListener('error',()=>{button.replaceWith(element('p','document-note','This photograph is temporarily unavailable.'));},{once:true});
          button.append(img);button.addEventListener('click',()=>openPhoto(photo));
          const caption=element('figcaption');caption.append(element('span','photo-caption-title',photo.caption));
          if(photo.date){const date=element('time','photo-caption-date',photo.date);caption.append(date);}
          figure.append(button,caption);gallery.append(figure);
        });sheet.append(gallery);
      }
    }
    if(!entry && folder.entries.length)sheet.append(element('p','overview-count',`${folder.entries.length} ${folder.entries.length===1?'entry':'entries'} in this folder`));
    return sheet;
  }

  function layoutFor(key,entryId) {
    const folder=content[key];const entry=folder.entries.find((e)=>e.id===entryId);
    const layout=element('div',`reader-layout${entry?' has-entry':''}${folder.entries.length?'':' empty-folder'}`);
    const index=element('nav','entry-index');index.setAttribute('aria-label',`${folder.title} entries`);
    index.append(element('p','index-label',folder.title));
    folder.entries.forEach((item)=>{
      const a=element('a','entry-link');a.href=`#${key}/${item.id}`;
      if(item===entry)a.setAttribute('aria-current','page');
      a.append(element('small','',item.meta||''),element('span','',item.title));
      const arrow=icon('chevron-right');arrow.classList.add('entry-arrow');a.append(arrow);index.append(a);
    });
    layout.append(index,sheetFor(folder,entry));return layout;
  }

  function readRoute() {
    const parts=location.hash.slice(1).split('/');
    const folder=content[parts[0]] ? parts[0] : null;
    const entry=folder && content[folder].entries.some((e)=>e.id===parts[1]) ? parts[1] : null;
    return {folder,entry};
  }

  function renderRoute({focus=true}={}) {
    const next=readRoute();
    if(next.folder===route.folder && next.entry===route.entry && body.children.length)return;
    const token=++sequence;
    field.cancelTransition();
    const wasOpen=!reader.hidden;
    const oldRoute=route;route=next;
    folderLinks.forEach((link)=>{
      const active=link.dataset.folder===next.folder;
      link.setAttribute('aria-current',String(active));
      link.setAttribute('aria-expanded',String(active));
      link.querySelector('.icon').className=`icon ${active?'folder-open':'folder'}`;
    });
    field.setPalette(next.folder ? content[next.folder].palette : null);

    if(!next.folder){
      previousFolder=oldRoute.folder||previousFolder;
      document.title='Ismam Ferdous';
      const finish=()=>{
        if(token!==sequence)return;
        reader.hidden=true;body.replaceChildren();workspace.classList.remove('has-reader');
        document.body.style.overflow='';
        if(mobile.matches)window.scrollTo(0,restoreScroll);
        if(focus)folderLinks.find((a)=>a.dataset.folder===previousFolder)?.focus({preventScroll:true});
        field.resize();
      };
      if(wasOpen)field.animate('close',null,finish);else finish();
      return;
    }

    if(!wasOpen){restoreScroll=scrollY;if(mobile.matches)window.scrollTo(0,0);}
    reader.hidden=false;workspace.classList.add('has-reader');
    if(mobile.matches)document.body.style.overflow='hidden';
    const folder=content[next.folder];const entry=folder.entries.find((e)=>e.id===next.entry);
    document.title=`${entry?.title||folder.title} | Ismam Ferdous`;
    reader.setAttribute('aria-label',`${folder.title} folder`);
    document.getElementById('breadcrumb-folder').textContent=folder.title;
    document.getElementById('reader-path').textContent=`/${next.folder}${next.entry?`/${next.entry}`:''}`;
    document.getElementById('reader-count').textContent=entry?`${folder.entries.indexOf(entry)+1} / ${folder.entries.length}`:`${folder.entries.length} entries`;
    back.title=next.entry?'Back to folder':'Back to home';back.setAttribute('aria-label',back.title);
    const layout=layoutFor(next.folder,next.entry);
    const oldLayout=body.lastElementChild;
    if(oldLayout){oldLayout.inert=true;oldLayout.setAttribute('aria-hidden','true');oldLayout.querySelector('[id]')?.removeAttribute('id');}
    if(wasOpen && !field.motionPreference.matches)layout.style.clipPath='inset(0 0 100% 0)';
    body.append(layout);
    const finish=()=>{
      if(token!==sequence)return;
      [...body.children].filter((n)=>n!==layout).forEach((n)=>n.remove());layout.style.clipPath='';
      document.getElementById('route-status').textContent=`${entry?.title||folder.title} opened`;
      if(focus && !document.querySelector('dialog[open]')){
        if(mobile.matches && !entry && folder.entries.length)layout.querySelector('.entry-link')?.focus({preventScroll:true});
        else layout.querySelector('.reading-sheet').focus({preventScroll:true});
      }
    };
    field.animate(wasOpen?'switch':'open',wasOpen?(progress)=>{layout.style.clipPath=`inset(0 0 ${(1-progress)*100}% 0)`;}:null,finish);
  }

  folderLinks.forEach((link)=>{
    link.querySelector('.folder-count').textContent=content[link.dataset.folder].entries.length;
    link.setAttribute('aria-controls','reader');link.setAttribute('aria-expanded','false');
    link.addEventListener('click',(event)=>{
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      if(route.folder===link.dataset.folder){event.preventDefault();location.hash='';}
    });
    link.addEventListener('pointerenter',()=>{if(!route.folder)field.setPalette(content[link.dataset.folder].palette);});
    link.addEventListener('pointerleave',()=>{if(!route.folder)field.setPalette(null);});
  });
  back.addEventListener('click',()=>{location.hash=route.entry?route.folder:'';});
  document.getElementById('reader-close').addEventListener('click',()=>{location.hash='';});
  window.addEventListener('hashchange',()=>renderRoute());
  mobile.addEventListener('change',()=>{document.body.style.overflow=mobile.matches&&route.folder?'hidden':'';field.resize();});

  function syncTheme(){
    const dark=document.documentElement.dataset.theme==='dark';
    const label=dark?'Dark':'Light';
    theme.setAttribute('aria-pressed',String(dark));theme.setAttribute('aria-label',`${label} appearance; switch to ${dark?'light':'dark'} mode`);theme.title=`Switch to ${dark?'light':'dark'} mode`;
    theme.querySelector('.icon').className=`icon ${dark?'moon':'sun'}`;document.getElementById('theme-label').textContent=label;
    document.querySelector('meta[name="theme-color"]').content=dark?'#191c1c':'#fafaf8';field.request();
  }
  theme.addEventListener('click',()=>{
    const value=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=value;
    try{localStorage.setItem('ismam-theme',value);}catch{}
    syncTheme();
  });
  const motion=document.getElementById('motion-toggle');
  function syncMotion(){const label=field.paused?'Resume animation':'Pause animation';motion.setAttribute('aria-label',label);motion.title=label;motion.setAttribute('aria-pressed',String(field.paused));motion.querySelector('.icon').className=`icon ${field.paused?'play':'pause'}`;}
  motion.addEventListener('click',()=>{field.setPaused(!field.paused);syncMotion();});
  window.addEventListener('fieldmotionchange',syncMotion);

  const lightbox=document.getElementById('lightbox');
  function openPhoto(photo){document.getElementById('lightbox-image').src=photo.src;document.getElementById('lightbox-image').alt=photo.alt;document.getElementById('lightbox-caption').textContent=photo.date?`${photo.caption} · ${photo.date}`:photo.caption;lightbox.showModal();}
  const resumeDialog=document.getElementById('resume-dialog');
  const resumeOpen=document.getElementById('resume-open');
  const resumeClose=document.getElementById('resume-close');
  resumeOpen.addEventListener('click',()=>{resumeDialog.classList.remove('is-closing');if(!resumeDialog.open)resumeDialog.showModal();resumeClose.focus();});
  function closeResume(){
    if(!resumeDialog.open||resumeDialog.classList.contains('is-closing'))return;
    if(matchMedia('(prefers-reduced-motion: reduce)').matches){resumeDialog.close();resumeOpen.focus();return;}
    resumeDialog.classList.add('is-closing');
    setTimeout(()=>{if(resumeDialog.open)resumeDialog.close();resumeDialog.classList.remove('is-closing');resumeOpen.focus();},150);
  }
  resumeClose.addEventListener('click',closeResume);
  resumeDialog.addEventListener('cancel',(event)=>{event.preventDefault();closeResume();});
  resumeDialog.addEventListener('click',(event)=>{if(event.target===resumeDialog)closeResume();});
  const localClock=document.getElementById('local-clock');
  const localClockFormat=new Intl.DateTimeFormat(undefined,{hour:'numeric',minute:'2-digit',second:'2-digit',timeZoneName:'short'});
  function updateClock(){const now=new Date();localClock.dateTime=now.toISOString();localClock.textContent=localClockFormat.format(now);document.getElementById('copyright-year').textContent=now.getFullYear();}
  updateClock();setInterval(updateClock,1000);
  const commands=new window.CommandMenu({
    content, photos:window.PHOTOGRAPHS,
    getActions:()=>[
      {id:'theme-action',kind:'action',title:document.documentElement.dataset.theme==='dark'?'Switch to light mode':'Switch to dark mode',context:'Appearance',icon:document.documentElement.dataset.theme==='dark'?'sun':'moon',tags:'theme appearance light dark mode'},
      {id:'audio-action',kind:'action',title:audio.enabled?'Mute sound':'Enable sound',context:'Ambient audio and click feedback',icon:audio.enabled?'volume-x':'volume-2',tags:'sound audio music ambient mute'},
      {id:'motion-action',kind:'action',title:field.paused?'Resume animation':'Pause animation',context:'Wandering field',icon:field.paused?'play':'pause',tags:'motion animation wandering movement'}
    ],
    onSelect:(record)=>{
      if(record.kind==='resume')resumeOpen.click();
      else if(record.kind==='photo')openPhoto(record.photo);
      else if(record.id==='theme-action')theme.click();
      else if(record.id==='audio-action')document.getElementById('sound-toggle').click();
      else if(record.id==='motion-action')motion.click();
      else {
        if(location.hash===record.href)reader.querySelector('.reading-sheet')?.focus();
        else location.hash=record.href;
      }
    }
  });
  document.addEventListener('click',(event)=>{
    if(event.target.closest('a,button')&&!event.target.closest('#sound-toggle'))audio.feedback();
  });
  document.getElementById('lightbox-image').draggable=false;
  document.getElementById('lightbox-close').addEventListener('click',()=>lightbox.close());
  lightbox.addEventListener('click',(event)=>{if(event.target===lightbox)lightbox.close();});
  document.addEventListener('keydown',(event)=>{
    if(event.key==='Escape'&&!lightbox.open&&!resumeDialog.open&&!commands.dialog.open&&route.folder){event.preventDefault();location.hash=route.entry?route.folder:'';}
  });
  syncTheme();syncMotion();renderRoute({focus:false});
})();
