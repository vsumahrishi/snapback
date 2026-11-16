/* One playable brain minute a day for 365 days.
   Same kinds of drills as the well-known brain apps, under plain names. */
var BRAIN_KINDS = [
  {id:'same', name:'Same or different'},
  {id:'grid', name:'Remember the tiles'},
  {id:'scan', name:'Find every letter'},
  {id:'pairs', name:'Match the pairs'},
  {id:'order', name:'Watch the order'},
  {id:'word', name:'Which word was it'},
  {id:'rule', name:'Follow the rule'}
];
var BRAIN_WORDS = ['river','lamp','bread','clock','garden','ticket','window','pencil','orange','bridge','camera','pillow','button','mirror','basket','candle','rabbit','hammer','island','glove','pocket','carrot','kettle','pebble','scarf','marble','bicycle','forest','ladder','spoon'];
var BRAIN_SHAPES = ['●','■','▲','◆'];
var BRAIN_COLORS = ['#1d3b32','#8C3A2F','#2C5F8A','#8A6A1A'];
var BRAIN_LETTERS = 'ABCDEFGHKLMNPRST';

function brainRand(seed){
  var s = (seed + 1) * 9973;
  return function(){
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
function brainPick(rng, list){ return list[Math.floor(rng() * list.length)]; }
function brainShuffle(rng, arr){
  var a = arr.slice();
  for(var i=a.length-1;i>0;i--){
    var j=Math.floor(rng()*(i+1));
    var t=a[i]; a[i]=a[j]; a[j]=t;
  }
  return a;
}
function brainDay(){
  if(!state.brainStart){
    state.brainStart = todayStr();
    try{ saveState(); }catch(e){}
  }
  return Math.max(0, -deskDaysBetween(state.brainStart));
}
function yearPractices(){
  var bank = window.SKILL_BANK || {};
  var keys = ['hold','start','plan','time','org','flex','impulse','emotion','attend','meta','goal','stress'];
  var lists = keys.map(function(k){
    return (bank[k]||[]).map(function(item){ return String((item && (item.a||item.s))||'').trim(); }).filter(Boolean);
  });
  var out = [];
  var n = 0;
  lists.forEach(function(list){ n = Math.max(n, list.length); });
  for(var i=0;i<n;i++){
    for(var k=0;k<lists.length;k++){
      if(lists[k][i]) out.push(lists[k][i]);
    }
  }
  return out;
}
function yearSlots(){
  if(window._yearSlots) return window._yearSlots;
  var practices = yearPractices();
  var slots = new Array(365);
  var used = {};
  for(var i=0;i<practices.length;i++){
    var at = practices.length<2 ? 0 : Math.round(i * 364 / (practices.length-1));
    while(used[at] && at<365) at++;
    if(at>364){
      at = 0;
      while(used[at] && at<365) at++;
    }
    used[at] = true;
    slots[at] = {type:'do', text:practices[i]};
  }
  for(var d=0;d<365;d++){
    if(!slots[d]) slots[d] = {type:'play'};
  }
  window._yearSlots = slots;
  return slots;
}
function yearSlot(day){
  var slots = yearSlots();
  return slots[Math.max(0, Math.min(364, day))] || {type:'play'};
}
function brainKind(day){ return BRAIN_KINDS[day % BRAIN_KINDS.length]; }

function brainBuild(day){
  var rng = brainRand(day * 17 + 3);
  var kind = brainKind(day).id;
  var week = Math.floor(day / 7);
  if(kind==='same'){
    var seq = [];
    for(var i=0;i<9;i++){
      seq.push({shape:Math.floor(rng()*4), color:Math.floor(rng()*4)});
    }
    return {kind:kind, seq:seq, trial:0, hits:0, phase:'look'};
  }
  if(kind==='grid'){
    var n = week>=40 ? 5 : week>=18 ? 4 : 3;
    var cells = brainShuffle(rng, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]).slice(0,n);
    return {kind:kind, cells:cells, picks:[], phase:'look', hits:0};
  }
  if(kind==='scan'){
    var target = BRAIN_LETTERS.charAt(Math.floor(rng()*BRAIN_LETTERS.length));
    var grid = [];
    for(var g=0;g<24;g++) grid.push(BRAIN_LETTERS.charAt(Math.floor(rng()*BRAIN_LETTERS.length)));
    var spots = brainShuffle(rng, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]).slice(0,5);
    spots.forEach(function(ix){ grid[ix]=target; });
    for(var c=0;c<grid.length;c++){
      if(spots.indexOf(c)<0 && grid[c]===target){
        grid[c] = target==='A' ? 'B' : 'A';
      }
    }
    var order = spots.slice().sort(function(a,b){ return a-b; });
    return {kind:kind, grid:grid, target:target, order:order, found:[], note:'', hits:0};
  }
  if(kind==='pairs'){
    var icons = brainShuffle(rng, ['●','■','▲','◆','★','✚']).slice(0,3);
    var deck = brainShuffle(rng, icons.concat(icons));
    return {kind:kind, deck:deck, up:[], known:[], lock:false, hits:0, phase:'play'};
  }
  if(kind==='order'){
    var len = week>=30 ? 4 : 3;
    var seq = brainShuffle(rng, [0,1,2,3]).slice(0, len);
    return {kind:kind, seq:seq, picks:[], phase:'look', hits:0};
  }
  if(kind==='word'){
    var rounds = [];
    for(var r=0;r<5;r++){
      var word = BRAIN_WORDS[Math.floor(rng()*BRAIN_WORDS.length)];
      var opts = [word];
      while(opts.length<4){
        var w = BRAIN_WORDS[Math.floor(rng()*BRAIN_WORDS.length)];
        if(opts.indexOf(w)<0) opts.push(w);
      }
      rounds.push({word:word, opts:brainShuffle(rng, opts)});
    }
    return {kind:kind, rounds:rounds, trial:0, hits:0, phase:'look'};
  }
  var trials = [];
  for(var t=0;t<8;t++){
    var rule = (Math.floor(t/2)%2===0) ? 'circle' : 'blue';
    var shape = rng()<0.5 ? 'circle' : 'square';
    var color = rng()<0.5 ? 'blue' : 'red';
    var yes = rule==='circle' ? shape==='circle' : color==='blue';
    trials.push({rule:rule, shape:shape, color:color, yes:yes});
  }
  return {kind:kind, trials:trials, trial:0, hits:0, phase:'play'};
}

function brainEnsure(){
  var day = brainDay();
  var play = state.brainPlay;
  if(play && play.date===todayStr() && play.day===day) return play;
  return null;
}

function brainCardHtml(){
  var day = brainDay();
  if(day>=365){
    return '<div class="card skill-card"><div class="skill-top"><span class="skill-pill">Today</span><span class="skill-count">365 of 365</span></div><p class="skill-ask">You have finished a year of these. They do not start over unless you want them to.</p></div>';
  }
  var slot = yearSlot(day);
  var head = '<div class="skill-top"><span class="skill-pill">Today</span><span class="skill-count">Day '+(day+1)+' of 365</span></div>';
  if(state.brainDone===todayStr()){
    var wrote = state.yearNote && state.yearNote.date===todayStr() && state.yearNote.text ? '<p style="margin:0">'+escapeHtml(state.yearNote.text)+'</p>' : '';
    var name = slot.type==='play' ? brainKind(day).name : '';
    return '<div class="card skill-card">'+head+'<p class="skill-ask">Done for today. The next one is tomorrow.</p>'+(name?'<p class="skill-note">'+escapeHtml(name)+'</p>':'')+wrote+'</div>';
  }
  if(slot.type==='do'){
    var text = slot.text;
    var wants = /\btype\b|box below/i.test(text);
    var saved = state.yearNote && state.yearNote.date===todayStr() ? state.yearNote.text : '';
    var box = wants ? '<label for="yearLine" style="display:block;font-weight:750;margin:0 0 6px">Type it in this box</label><textarea id="yearLine" rows="3" placeholder="Type it here" style="width:100%;box-sizing:border-box;margin-bottom:8px">'+escapeHtml(saved)+'</textarea>' : '';
    return '<div class="card skill-card">'+head+'<p class="skill-ask">'+escapeHtml(text)+'</p>'+box+'<div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="done">Done</button></div></div>';
  }
  var meta = brainKind(day);
  var play = brainEnsure();
  if(!play){
    return '<div class="card skill-card">'+head+'<p class="skill-ask">'+escapeHtml(meta.name)+'</p><p class="skill-note">About one minute. It is not a grade.</p><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="start">Start</button></div></div>';
  }
  return '<div class="card skill-card">'+head+brainBody(play)+'</div>';
}

function brainFace(item){
  return '<div class="brain-shape" style="color:'+BRAIN_COLORS[item.color]+'">'+BRAIN_SHAPES[item.shape]+'</div>';
}
function brainResult(line, got, total){
  return '<p class="skill-ask">'+escapeHtml(line)+'</p><p class="skill-note">'+got+' of '+total+'. That is the whole minute.</p><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="done">Done</button></div>';
}

function brainBody(play){
  if(play.kind==='same') return brainSame(play);
  if(play.kind==='grid') return brainGrid(play);
  if(play.kind==='scan') return brainScan(play);
  if(play.kind==='pairs') return brainPairs(play);
  if(play.kind==='order') return brainOrder(play);
  if(play.kind==='word') return brainWord(play);
  return brainRule(play);
}

function brainSame(play){
  if(play.phase==='result') return brainResult('Same means the same shape and the same colour.', play.hits, 8);
  var item = play.seq[play.trial];
  if(play.phase==='look' || play.trial===0 && play.phase==='look'){
    return '<p class="skill-ask">Look at this shape. You will say if the next one matches it.</p>'+brainFace(item)+'<div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="next">I have looked</button></div>';
  }
  var prev = play.seq[play.trial-1];
  return '<p class="skill-ask">Does this match the last one?</p><p class="skill-note">Same means the same shape and the same colour. '+play.trial+' of 8.</p>'+brainFace(item)+'<div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="yes">Same</button><button type="button" class="btn ghost" data-dose="brain" data-val="no">Different</button></div>';
}

function brainGrid(play){
  if(play.phase==='result') return brainResult('The tiles that were lit are marked.', play.hits, play.cells.length);
  var cells = '';
  for(var i=0;i<16;i++){
    var on = play.phase==='look' && play.cells.indexOf(i)>=0;
    var picked = play.picks.indexOf(i)>=0;
    cells += '<button type="button" class="brain-cell'+(on||picked?' on':'')+'" data-dose="brain" data-val="cell" data-i="'+i+'" aria-label="Tile '+(i+1)+'"'+(play.phase==='look'?' disabled':'')+'></button>';
  }
  if(play.phase==='look'){
    return '<p class="skill-ask">Remember these '+play.cells.length+' tiles.</p><div class="brain-grid" style="grid-template-columns:repeat(4,1fr)">'+cells+'</div><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="hide">Hide them</button></div>';
  }
  return '<p class="skill-ask">Tap the '+play.cells.length+' tiles that were lit.</p><div class="brain-grid" style="grid-template-columns:repeat(4,1fr)">'+cells+'</div><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="check">Check</button></div>';
}

function brainScan(play){
  if(play.phase==='result') return brainResult('You found the letters in reading order, left to right, top to bottom.', play.hits, play.order.length);
  var next = play.order[play.found.length];
  var cells = '';
  for(var i=0;i<play.grid.length;i++){
    var got = play.found.indexOf(i)>=0;
    cells += '<button type="button" class="brain-cell'+(got?' got':'')+'" data-dose="brain" data-val="scan" data-i="'+i+'">'+escapeHtml(play.grid[i])+'</button>';
  }
  var note = play.note ? '<p class="brain-miss">'+escapeHtml(play.note)+'</p>' : '';
  return '<p class="skill-ask">Tap every '+escapeHtml(play.target)+'. Go left to right, then the next row.</p><p class="skill-note">'+play.found.length+' of '+play.order.length+'</p>'+note+'<div class="brain-grid" style="grid-template-columns:repeat(6,1fr)">'+cells+'</div>';
}

function brainPairs(play){
  if(play.phase==='result') return brainResult('All three pairs are open.', 3, 3);
  var cells = '';
  for(var i=0;i<play.deck.length;i++){
    var open = play.known.indexOf(i)>=0 || play.up.indexOf(i)>=0;
    cells += '<button type="button" class="brain-cell'+(open?' on':'')+'" data-dose="brain" data-val="pair" data-i="'+i+'" aria-label="'+(open?play.deck[i]:'Face down card')+'">'+(open?escapeHtml(play.deck[i]):'')+'</button>';
  }
  return '<p class="skill-ask">Tap two cards. Matching pairs stay open.</p><div class="brain-grid" style="grid-template-columns:repeat(3,1fr)">'+cells+'</div>';
}

function brainOrder(play){
  if(play.phase==='result') return brainResult('The order was '+play.seq.map(function(n){ return n+1; }).join(', then ')+'.', play.hits, 1);
  var cells = '';
  for(var i=0;i<4;i++){
    var mark = '';
    if(play.phase==='look'){
      var at = play.seq.indexOf(i);
      if(at>=0) mark = String(at+1);
    } else {
      var got = play.picks.indexOf(i);
      if(got>=0) mark = String(got+1);
    }
    cells += '<button type="button" class="brain-cell'+(mark?' on':'')+'" data-dose="brain" data-val="pad" data-i="'+i+'">'+mark+'</button>';
  }
  if(play.phase==='look'){
    return '<p class="skill-ask">The numbers are the order. 1 first, then 2.</p><div class="brain-grid" style="grid-template-columns:repeat(4,1fr)">'+cells+'</div><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="hide">Hide them</button></div>';
  }
  return '<p class="skill-ask">Tap the squares in that same order.</p><div class="brain-grid" style="grid-template-columns:repeat(4,1fr)">'+cells+'</div><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="check">Check</button></div>';
}

function brainWord(play){
  if(play.phase==='result') return brainResult('You picked the word that was just on the screen.', play.hits, play.rounds.length);
  var round = play.rounds[play.trial];
  if(play.phase==='look'){
    return '<p class="skill-ask">Read this word. It will go away.</p><p class="brain-shape" style="font-size:2rem">'+escapeHtml(round.word)+'</p><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="hide">Hide it</button></div>';
  }
  var buttons = round.opts.map(function(w){
    return '<button type="button" class="btn" data-dose="brain" data-val="pick" data-word="'+escapeHtml(w)+'">'+escapeHtml(w)+'</button>';
  }).join('');
  return '<p class="skill-ask">Which word was it? '+(play.trial+1)+' of '+play.rounds.length+'.</p><div class="desk-actions">'+buttons+'</div>';
}

function brainRule(play){
  if(play.phase==='result') return brainResult('The question at the top is the one that counts.', play.hits, play.trials.length);
  var t = play.trials[play.trial];
  var ask = t.rule==='circle' ? 'Is it a circle?' : 'Is it blue?';
  var bg = t.color==='blue' ? '#2C5F8A' : '#8C3A2F';
  var shape = t.shape==='circle' ? '●' : '■';
  return '<p class="skill-ask">'+ask+'</p><p class="skill-note">The question changes. '+(play.trial+1)+' of '+play.trials.length+'.</p><div class="brain-shape" style="color:'+bg+'">'+shape+'</div><div class="desk-actions"><button type="button" class="btn" data-dose="brain" data-val="yes">Yes</button><button type="button" class="btn ghost" data-dose="brain" data-val="no">No</button></div>';
}

function brainAct(btn){
  var val = btn.getAttribute('data-val')||'';
  var day = brainDay();
  if(val==='done'){
    var line = document.getElementById('yearLine');
    if(line) state.yearNote = {date:todayStr(), text:String(line.value||'').trim()};
    state.brainDone = todayStr();
    state.brainPlay = null;
    persistRender();
    return;
  }
  if(val==='start'){
    var play = brainBuild(day);
    play.date = todayStr();
    play.day = day;
    state.brainPlay = play;
    persistRender();
    return;
  }
  var play = brainEnsure();
  if(!play) return;
  if(play.kind==='same') brainActSame(play, val);
  else if(play.kind==='grid') brainActGrid(play, val, btn);
  else if(play.kind==='scan') brainActScan(play, btn);
  else if(play.kind==='pairs') brainActPairs(play, btn);
  else if(play.kind==='order') brainActOrder(play, val, btn);
  else if(play.kind==='word') brainActWord(play, val, btn);
  else brainActRule(play, val);
  persistRender();
}

function brainActSame(play, val){
  if(val==='next' || (play.trial===0 && play.phase==='look' && val==='hide')){
    play.phase = 'ask';
    play.trial = 1;
    return;
  }
  if(play.phase!=='ask') return;
  if(val!=='yes' && val!=='no') return;
  var cur = play.seq[play.trial];
  var prev = play.seq[play.trial-1];
  var same = cur.shape===prev.shape && cur.color===prev.color;
  var said = val==='yes';
  if(said===same) play.hits++;
  play.trial++;
  if(play.trial>=play.seq.length) play.phase='result';
}

function brainActGrid(play, val, btn){
  if(val==='hide'){ play.phase='answer'; play.picks=[]; return; }
  if(play.phase!=='answer') return;
  if(val==='cell'){
    var i = Number(btn.getAttribute('data-i'));
    var at = play.picks.indexOf(i);
    if(at>=0) play.picks.splice(at,1);
    else if(play.picks.length<play.cells.length) play.picks.push(i);
    return;
  }
  if(val==='check'){
    play.hits = play.picks.filter(function(i){ return play.cells.indexOf(i)>=0; }).length;
    play.phase='result';
  }
}

function brainActScan(play, btn){
  if(btn.getAttribute('data-val')!=='scan') return;
  var i = Number(btn.getAttribute('data-i'));
  if(play.found.indexOf(i)>=0) return;
  var need = play.order[play.found.length];
  if(i!==need){
    play.note = 'Not yet. Take the next '+play.target+' in reading order.';
    return;
  }
  play.note = '';
  play.found.push(i);
  play.hits = play.found.length;
  if(play.found.length>=play.order.length) play.phase='result';
}

function brainActPairs(play, btn){
  if(play.phase==='result') return;
  if(play.lock){
    play.up = [];
    play.lock = false;
    return;
  }
  var i = Number(btn.getAttribute('data-i'));
  if(play.known.indexOf(i)>=0 || play.up.indexOf(i)>=0) return;
  play.up.push(i);
  if(play.up.length<2) return;
  var a = play.up[0], b = play.up[1];
  if(play.deck[a]===play.deck[b]){
    play.known.push(a,b);
    play.up = [];
    play.hits = play.known.length/2;
    if(play.known.length>=play.deck.length) play.phase='result';
  } else {
    play.lock = true;
    setTimeout(function(){
      if(!state.brainPlay || state.brainPlay!==play) return;
      play.up = [];
      play.lock = false;
      try{ persistRender(); }catch(e){}
    }, 700);
  }
}

function brainActOrder(play, val, btn){
  if(val==='hide'){ play.phase='answer'; play.picks=[]; return; }
  if(play.phase!=='answer') return;
  if(val==='pad'){
    var i = Number(btn.getAttribute('data-i'));
    if(play.picks.indexOf(i)>=0) return;
    if(play.picks.length<play.seq.length) play.picks.push(i);
    return;
  }
  if(val==='check'){
    var ok = play.picks.length===play.seq.length && play.picks.every(function(n,ix){ return n===play.seq[ix]; });
    play.hits = ok ? 1 : 0;
    play.phase='result';
  }
}

function brainActWord(play, val, btn){
  if(val==='hide'){ play.phase='ask'; return; }
  if(play.phase!=='ask' || val!=='pick') return;
  var word = btn.getAttribute('data-word')||'';
  if(word===play.rounds[play.trial].word) play.hits++;
  play.trial++;
  play.phase = 'look';
  if(play.trial>=play.rounds.length) play.phase='result';
}

function brainActRule(play, val){
  if(play.phase==='result') return;
  if(val!=='yes' && val!=='no') return;
  var t = play.trials[play.trial];
  var said = val==='yes';
  if(said===t.yes) play.hits++;
  play.trial++;
  if(play.trial>=play.trials.length) play.phase='result';
}
