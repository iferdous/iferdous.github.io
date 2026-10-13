/* An original, quiet ambient score. Audio is synthesized locally; no stream or tracking. */
(() => {
  class AmbientSound {
    constructor(button) {
      this.button = button;
      this.enabled = false;
      this.timer = null;
      this.nextNote = 0;
      this.noteIndex = 0;
      this.context = null;
      this.chords = [[73.42,110,146.83,220],[61.74,92.5,123.47,185],[49,73.42,98,146.83],[55,82.41,110,164.81]];
      button.addEventListener('click', () => this.toggle());
    }

    create() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      const filter = this.context.createBiquadFilter();
      filter.type='lowpass';filter.frequency.value=900;
      this.input = this.context.createGain();
      const delay = this.context.createDelay(3);
      delay.delayTime.value=.72;
      const feedback=this.context.createGain();feedback.gain.value=.28;
      const wet=this.context.createGain();wet.gain.value=.24;
      this.input.connect(filter);this.input.connect(delay);delay.connect(feedback);feedback.connect(delay);delay.connect(wet);wet.connect(filter);filter.connect(this.master);this.master.connect(this.context.destination);
      return true;
    }

    voice(frequency, at, duration, amplitude, pad=false) {
      const oscillator=this.context.createOscillator();
      const gain=this.context.createGain();
      oscillator.type='sine';oscillator.frequency.value=frequency;
      oscillator.detune.value=pad ? Math.sin(frequency)*3 : 0;
      gain.gain.setValueAtTime(0,at);
      gain.gain.linearRampToValueAtTime(amplitude,at+(pad?2.4:.08));
      gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
      oscillator.connect(gain);gain.connect(this.input);
      oscillator.start(at);oscillator.stop(at+duration+.1);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }

    schedule() {
      if(!this.enabled || this.context.state!=='running') return;
      while(this.nextNote<this.context.currentTime+.7){
        const chord=this.chords[Math.floor(this.noteIndex/4)%this.chords.length];
        if(this.noteIndex%4===0) {
          this.voice(chord[0]/1.35,this.nextNote,16,.07,true);
          chord.forEach((f,i)=>this.voice(f,this.nextNote+i*.17,15,.13,true));
        }
        const order=[2,1,3,0];
        this.voice(chord[order[this.noteIndex%4]]*2,this.nextNote,7,.1);
        this.nextNote+=3.6;this.noteIndex++;
      }
    }

    async start() {
      if (this.enabled) return;
      try {
        if(!this.context && !this.create()) throw new Error('Audio unavailable');
        await this.context.resume();
        if(this.context.state!=='running') throw new Error('Audio paused');
        this.enabled=true;
        this.nextNote=Math.max(this.nextNote,this.context.currentTime+.1);
        this.master.gain.cancelScheduledValues(this.context.currentTime);
        this.master.gain.setTargetAtTime(.1,this.context.currentTime,.6);
        this.schedule();clearInterval(this.timer);this.timer=setInterval(()=>this.schedule(),200);
        this.update();
      } catch {this.button.title='Ambient audio is unavailable in this browser';this.update();}
    }

    stop() {
      this.enabled=false;clearInterval(this.timer);
      if(this.context){this.master.gain.cancelScheduledValues(this.context.currentTime);this.master.gain.setTargetAtTime(0,this.context.currentTime,.12);}
      this.update();
    }

    toggle() {
      const next = !this.enabled;
      if(next)this.start();else this.stop();
    }

    feedback() {
      if(!this.enabled || this.context?.state!=='running')return;
      const now=this.context.currentTime;
      if(now-(this.lastFeedback||0)<.08)return;
      this.lastFeedback=now;
      const tone=this.context.createOscillator();const gain=this.context.createGain();
      tone.type='sine';tone.frequency.setValueAtTime(520,now);tone.frequency.exponentialRampToValueAtTime(300,now+.04);
      gain.gain.setValueAtTime(.006,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.045);
      tone.connect(gain);gain.connect(this.context.destination);tone.start(now);tone.stop(now+.05);
      tone.onended=()=>{tone.disconnect();gain.disconnect();};
    }

    update() {
      const label=this.enabled?'Turn low-frequency ambient sound off':'Turn low-frequency ambient sound on';
      this.button.setAttribute('aria-pressed',String(this.enabled));
      this.button.setAttribute('aria-label',label);this.button.title=label;
      this.button.querySelector('.icon').className=`icon ${this.enabled?'volume-2':'volume-x'}`;
    }
  }
  window.AmbientSound=AmbientSound;
})();
