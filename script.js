(function(){
  const MOVES = ['rock','paper','scissors'];
  const EMOJI = { rock:'🪨', paper:'📄', scissors:'✂️' };
  const BEATS = { rock:'scissors', paper:'rock', scissors:'paper' };

  let targetWins = 2; // best of 3 -> first to 2
  let youScore = 0, cpuScore = 0, streak = 0, lastWinner = null;
  let roundBusy = false;

  const el = id => document.getElementById(id);
  const titleScreen = el('titleScreen');
  const arenaScreen = el('arenaScreen');
  const overScreen = el('overScreen');
  const youScoreEl = el('youScore');
  const cpuScoreEl = el('cpuScore');
  const targetWinsEl = el('targetWins');
  const streakLine = el('streakLine');
  const youCombatant = el('youCombatant');
  const cpuCombatant = el('cpuCombatant');
  const countdownEl = el('countdown');
  const resultLine = el('resultLine');
  const historyRow = el('historyRow');
  const picksRow = el('picksRow');
  const clashRow = el('clashRow');

  // ---- sound (tiny synthesized beeps, no external files) ----
  let soundOn = true;
  let audioCtx = null;
  function beep(freq, dur, type='sine', vol=0.05){
    if(!soundOn) return;
    try{
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type; o.frequency.value = freq;
      g.gain.value = vol;
      o.connect(g); g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      o.stop(audioCtx.currentTime + dur);
    }catch(e){ /* audio not available, fail silently */ }
  }
  el('soundToggle').addEventListener('click', () => {
    soundOn = !soundOn;
    el('soundToggle').textContent = soundOn ? '🔊 Sound on' : '🔇 Sound off';
  });

  // ---- mode select ----
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const n = parseInt(btn.dataset.target, 10);
      targetWins = Math.ceil(n/2);
    });
  });

  el('startBtn').addEventListener('click', () => {
    titleScreen.classList.add('hidden');
    arenaScreen.classList.remove('hidden');
    overScreen.classList.add('hidden');
    resetMatch();
  });

  el('rematchBtn').addEventListener('click', () => {
    overScreen.classList.add('hidden');
    arenaScreen.classList.remove('hidden');
    resetMatch();
  });

  el('menuBtn').addEventListener('click', () => {
    overScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
  });

  function resetMatch(){
    youScore = 0; cpuScore = 0; streak = 0; lastWinner = null;
    youScoreEl.textContent = '0';
    cpuScoreEl.textContent = '0';
    targetWinsEl.textContent = targetWins;
    streakLine.textContent = '\u00a0';
    historyRow.innerHTML = '';
    youCombatant.textContent = '❔';
    cpuCombatant.textContent = '❔';
    youCombatant.className = 'combatant you';
    cpuCombatant.className = 'combatant cpu';
    resultLine.textContent = 'Choose your move';
    resultLine.className = 'result-line';
    countdownEl.textContent = '\u00a0';
    setPicksEnabled(true);
  }

  function setPicksEnabled(enabled){
    document.querySelectorAll('.pick-btn').forEach(b => {
      b.disabled = !enabled;
      b.classList.remove('chosen');
    });
  }

  document.querySelectorAll('.pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if(roundBusy) return;
      playRound(btn.dataset.move);
    });
  });

  window.addEventListener('keydown', (e) => {
    if(arenaScreen.classList.contains('hidden')) return;
    if(roundBusy) return;
    const k = e.key.toLowerCase();
    if(k === 'r') playRound('rock');
    if(k === 'p') playRound('paper');
    if(k === 's') playRound('scissors');
  });

  function playRound(youMove){
    roundBusy = true;
    setPicksEnabled(false);
    const chosenBtn = document.querySelector('.pick-btn[data-move="'+youMove+'"]');
    if(chosenBtn) chosenBtn.classList.add('chosen');

    resultLine.textContent = '';
    resultLine.className = 'result-line';

    let count = 3;
    countdownEl.textContent = count;
    beep(300, 0.08, 'square', 0.03);

    const tick = setInterval(() => {
      count -= 1;
      if(count > 0){
        countdownEl.textContent = count;
        beep(300 + (3-count)*40, 0.08, 'square', 0.03);
      } else {
        clearInterval(tick);
        countdownEl.textContent = 'THROW!';
        beep(520, 0.12, 'square', 0.05);
        setTimeout(() => resolveRound(youMove), 260);
      }
    }, 420);
  }

  function resolveRound(youMove){
    const cpuMove = MOVES[Math.floor(Math.random()*3)];

    youCombatant.textContent = EMOJI[youMove];
    cpuCombatant.textContent = EMOJI[cpuMove];
    youCombatant.classList.remove('slide-you'); void youCombatant.offsetWidth;
    cpuCombatant.classList.remove('slide-cpu'); void cpuCombatant.offsetWidth;
    youCombatant.classList.add('slide-you');
    cpuCombatant.classList.add('slide-cpu');

    countdownEl.textContent = '\u00a0';

    setTimeout(() => {
      let outcome; // 'win' | 'lose' | 'tie'
      if(youMove === cpuMove){ outcome = 'tie'; }
      else if(BEATS[youMove] === cpuMove){ outcome = 'win'; }
      else { outcome = 'lose'; }

      youCombatant.classList.add('shake');
      cpuCombatant.classList.add('shake');
      setTimeout(() => {
        youCombatant.classList.remove('shake');
        cpuCombatant.classList.remove('shake');
      }, 360);

      if(outcome === 'win'){
        youScore++; youScoreEl.textContent = youScore;
        resultLine.textContent = 'YOU WIN THIS ROUND';
        resultLine.className = 'result-line win';
        beep(660, 0.18, 'sawtooth', 0.05);
        streak = (lastWinner === 'you') ? streak+1 : 1;
        lastWinner = 'you';
      } else if(outcome === 'lose'){
        cpuScore++; cpuScoreEl.textContent = cpuScore;
        resultLine.textContent = 'CPU TAKES IT';
        resultLine.className = 'result-line lose';
        beep(160, 0.22, 'sawtooth', 0.05);
        streak = (lastWinner === 'cpu') ? streak+1 : 1;
        lastWinner = 'cpu';
      } else {
        resultLine.textContent = 'DRAW — GO AGAIN';
        resultLine.className = 'result-line tie';
        beep(340, 0.15, 'triangle', 0.04);
        streak = 0; lastWinner = null;
      }

      if(streak >= 2 && lastWinner){
        streakLine.textContent = (lastWinner === 'you' ? 'You' : 'CPU') + ' — ' + streak + ' in a row 🔥';
      } else {
        streakLine.textContent = '\u00a0';
      }

      addHistoryChip(outcome);

      if(youScore >= targetWins || cpuScore >= targetWins){
        setTimeout(() => endMatch(youScore >= targetWins), 900);
      } else {
        setTimeout(() => {
          resultLine.textContent = 'Choose your move';
          resultLine.className = 'result-line';
          setPicksEnabled(true);
          roundBusy = false;
        }, 1000);
      }
    }, 500);
  }

  function addHistoryChip(outcome){
    const chip = document.createElement('div');
    chip.className = 'chip ' + outcome;
    chip.textContent = outcome === 'win' ? '✓' : outcome === 'lose' ? '✕' : '·';
    historyRow.appendChild(chip);
  }

  function endMatch(youWon){
    arenaScreen.classList.add('hidden');
    overScreen.classList.remove('hidden');
    const title = el('overTitle');
    const sub = el('overSub');
    if(youWon){
      title.textContent = 'YOU WIN THE MATCH';
      title.className = 'you-win';
      beep(700, 0.2, 'square', 0.05);
      setTimeout(()=>beep(880,0.25,'square',0.05), 150);
    } else {
      title.textContent = 'CPU WINS THE MATCH';
      title.className = 'cpu-win';
      beep(220, 0.3, 'sawtooth', 0.05);
    }
    sub.textContent = 'Final score ' + youScore + ' – ' + cpuScore;
  }
})();