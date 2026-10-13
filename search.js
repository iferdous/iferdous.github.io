(() => {
  const aliases = {
    projects: 'apps products software portfolio building',
    research: 'work experience employment jobs laboratories lab scientist teaching',
    learning: 'skills toolkit tech stack technologies programming languages education university',
    coursework: 'classes class courses coursework semester semesters fall spring summer study academics',
    readings: 'books papers essays articles reading reading list library notes literature',
    photography: 'photos photographs pictures camera gallery album city hall',
    outside: 'personal life hobbies interests outside classroom'
  };
  const normalize = value => String(value).toLowerCase().normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const queryTerms = value => normalize(value).replace(/\b(fall|spring|summer)\s+(25|26)\b/g, '$1 20$2').split(' ').filter(Boolean);

  // Transposed letters count as one typo; short words require exact or prefix matches.
  function distance(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    const rows = Array.from({length:a.length + 1}, () => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) rows[i][0] = i;
    for (let j = 0; j <= b.length; j++) rows[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        rows[i][j] = Math.min(rows[i-1][j]+1, rows[i][j-1]+1, rows[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
        if (i>1 && j>1 && a[i-1]===b[j-2] && a[i-2]===b[j-1]) rows[i][j] = Math.min(rows[i][j], rows[i-2][j-2]+1);
      }
    }
    return rows[a.length][b.length];
  }
  function prepare(record) {
    return {...record, titleWords:normalize(record.title).split(' '),
      tagWords:normalize(record.tags || '').split(' '), bodyWords:normalize(record.body || '').split(' ')};
  }
  function buildIndex(content, photos = []) {
    const records = [];
    for (const [key, folder] of Object.entries(content)) {
      records.push(prepare({id:key, title:folder.title, context:'Folder', kind:'folder', icon:'folder',
        href:`#${key}`, tags:`${key} ${aliases[key] || ''}`, body:folder.description || ''}));
      for (const entry of folder.entries) {
        const prose = [...(entry.paragraphs || []), ...(entry.details?.items || [])].join(' ');
        records.push(prepare({id:`${key}/${entry.id}`, title:entry.title, context:folder.title,
          kind:'entry', icon:'file-text', href:`#${key}/${entry.id}`,
          tags:`${aliases[key] || ''} ${entry.meta || ''}`, body:prose, prose}));
      }
    }
    photos.forEach((photo, i) => records.push(prepare({id:`photo-${i}`, title:photo.caption,
      context:`Photography / ${photo.date || ''}`, kind:'photo', icon:'camera', photo,
      tags:`photo picture photograph photography ${photo.alt}`, body:photo.date || ''})));
    records.push(prepare({id:'resume', title:'Resume', context:'Ismam Ferdous / PDF',
      kind:'resume', icon:'file-text', tags:'cv curriculum vitae resume download pdf qualifications career'}));
    records.push(prepare({id:'home', title:'Home', context:'Ismam Ferdous', kind:'folder', icon:'folder', href:'#', tags:'home about bio profile'}));
    return records;
  }
  function wordScore(term, words, exact, prefix, fuzzy) {
    if (words.includes(term)) return exact;
    if (words.some(word => word.startsWith(term))) return prefix;
    if (term.length >= 4 && words.some(word => distance(term, word) <= 1)) return fuzzy;
    if (term.length >= 6 && words.some(word => distance(term, word) <= 2)) return Math.max(1, fuzzy - 2);
    return 0;
  }
  function rank(records, query) {
    const terms = queryTerms(query);
    if (!terms.length) return records.filter(record => record.kind==='folder' || record.kind==='resume' || record.kind==='action');
    return records.map(record => {
      let score = 0;
      for (const term of terms) {
        const match = Math.max(wordScore(term, record.titleWords, 18, 13, 8),
          wordScore(term, record.tagWords, 9, 6, 3), wordScore(term, record.bodyWords, 5, 3, 1));
        if (!match) return {...record, score:0};
        score += match;
      }
      if (normalize(record.title).includes(terms.join(' '))) score += 20;
      return {...record, score};
    }).filter(record => record.score>0).sort((a,b) => b.score-a.score || a.title.localeCompare(b.title));
  }
  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }
  function icon(name) {
    const element = node('span', `icon ${name}`); element.setAttribute('aria-hidden', 'true'); return element;
  }
  class CommandMenu {
    constructor(options) {
      this.options = options;
      this.dialog = document.getElementById('command-dialog');
      this.input = document.getElementById('site-search-input');
      this.list = document.getElementById('search-results');
      this.status = document.getElementById('search-status');
      this.index = buildIndex(options.content, options.photos);
      document.getElementById('search-shortcut').textContent = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘ K' : 'Ctrl K';
      ['search-open', 'header-search'].forEach(id => document.getElementById(id).addEventListener('click', () => this.open()));
      document.getElementById('search-close').addEventListener('click', () => this.close());
      this.input.addEventListener('input', () => this.render());
      this.input.addEventListener('keydown', event => {
        if (event.isComposing) return;
        if (event.key==='ArrowDown' || event.key==='ArrowUp') {
          event.preventDefault();
          if (this.matches.length) this.select((this.selected+(event.key==='ArrowDown'?1:-1)+this.matches.length)%this.matches.length, true);
        } else if (event.key==='Escape') {
          event.preventDefault(); event.stopPropagation(); this.close();
        }
      });
      this.dialog.querySelector('form').addEventListener('submit', event => {event.preventDefault();this.choose(this.selected);});
      this.dialog.addEventListener('click', event => {if (event.target===this.dialog) this.close();});
      this.dialog.addEventListener('cancel', event => {event.preventDefault();this.close();});
      this.dialog.addEventListener('keydown', event => {
        if (event.key!=='Tab') return;
        const close=document.getElementById('search-close');
        if (event.shiftKey && document.activeElement===this.input) {event.preventDefault();close.focus();}
        else if (!event.shiftKey && document.activeElement===close) {event.preventDefault();this.input.focus();}
      });
      document.addEventListener('keydown', event => {
        const editable = event.target.closest('input,textarea,[contenteditable=true]');
        const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase()==='k';
        const slash = event.key==='/' && !editable && !event.metaKey && !event.ctrlKey;
        if ((!shortcut && !slash) || event.altKey || event.isComposing) return;
        if (document.querySelector('dialog[open]:not(#command-dialog)')) return;
        event.preventDefault();
        if (this.dialog.open) this.close(); else this.open();
      });
    }
    open() {
      if (this.dialog.open || document.querySelector('dialog[open]')) return;
      this.input.value = ''; this.render(); this.dialog.showModal(); this.input.focus();
      this.options.onOpen?.();
    }
    close() {if (this.dialog.open) this.dialog.close();}
    render() {
      this.matches = rank([...this.index, ...this.options.getActions().map(prepare)], this.input.value).slice(0,14);
      this.list.replaceChildren(); this.selected = 0; this.rows = [];
      let group = '';
      this.matches.forEach((record, index) => {
        const nextGroup = this.input.value.trim() ? 'Matches' : record.kind==='action' ? 'Quick actions' : 'Explore';
        if (nextGroup!==group) {this.list.append(node('div', 'command-group', nextGroup));group=nextGroup;}
        const row = node('button', 'command-option'); row.type='button'; row.id=`command-option-${index}`;
        row.tabIndex=-1;row.setAttribute('role','option');row.setAttribute('aria-selected','false');
        const glyph = node('span','command-glyph');glyph.append(icon(record.icon));
        const copy = node('span','command-copy');const title = node('span','command-title');
        const terms = queryTerms(this.input.value);
        // Mark text with DOM nodes, never HTML derived from a query.
        record.title.split(/(\s+)/).forEach(word => {
          if (terms.some(term => normalize(word).startsWith(term))) title.append(node('mark','',word)); else title.append(document.createTextNode(word));
        });
        copy.append(title,node('span','command-context',record.context));
        row.append(glyph,copy,icon('chevron-right'));
        row.addEventListener('pointermove', event => {if (event.pointerType==='mouse') this.select(index);});
        row.addEventListener('click', () => this.choose(index));
        this.list.append(row);this.rows.push(row);
      });
      if (!this.matches.length) {
        const empty=node('div','command-empty');empty.append(icon('search-icon'),node('strong','','No matches'),node('span','',this.input.value));this.list.append(empty);
      }
      this.status.textContent=`${this.matches.length} ${this.matches.length===1?'destination':'destinations'}`;
      this.select(0);this.list.scrollTop=0;
    }
    select(index, scroll=false) {
      this.selected=index;
      this.rows.forEach((row,i) => row.setAttribute('aria-selected', String(i===index)));
      if (this.rows[index]) {
        this.input.setAttribute('aria-activedescendant',this.rows[index].id);
        if (scroll) this.rows[index].scrollIntoView({block:'nearest'});
      } else this.input.removeAttribute('aria-activedescendant');
    }
    choose(index) {
      const record=this.matches[index];if (!record) return;
      this.close();this.options.onSelect(record);
    }
  }
  window.PortfolioSearch={buildIndex,rank,normalize,distance};
  window.CommandMenu=CommandMenu;
})();
