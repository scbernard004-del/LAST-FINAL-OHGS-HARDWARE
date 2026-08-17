
(function(){
  function qs(s){return document.querySelector(s)}
  function qsa(s){return Array.prototype.slice.call(document.querySelectorAll(s))}
  function storageGet(key,fallback){
    try{return localStorage.getItem(key)||fallback}catch(e){return fallback}
  }
  function storageSet(key,value){
    try{localStorage.setItem(key,value)}catch(e){}
  }
  function killLoader(){
    document.body.classList.add('ohgs-ready','ohgs-site-ready');
    document.documentElement.style.overflow=''; document.body.style.overflow='';
    qsa('.loader,#loader,.ohgs-loader-screen,[class*="preloader"],[class*="loading-screen"]').forEach(function(el){el.hidden=true;el.style.display='none';el.style.opacity='0';el.style.visibility='hidden';el.style.pointerEvents='none'});
    var main=qs('main'); if(main){main.style.display='block';main.style.opacity='1';main.style.visibility='visible'}
  }
  function applyTheme(mode){
    mode = mode || storageGet('ohgs-theme','dark');
    document.body.classList.toggle('light', mode==='light');
    document.documentElement.setAttribute('data-theme', mode);
    storageSet('ohgs-theme',mode);
    qsa('.theme-toggle').forEach(function(btn){btn.innerHTML='<span class="theme-icon" aria-hidden="true">'+(mode==='light'?'☀️':'🌙')+'</span>';btn.setAttribute('aria-label','Switch dark and light mode')});
  }
  function applyLang(lang){
    lang = lang || storageGet('ohgs-lang','en');
    document.documentElement.lang = lang==='sw'?'sw':'en';
    storageSet('ohgs-lang',lang);
    qsa('[data-en][data-sw]').forEach(function(el){el.textContent = el.getAttribute(lang==='sw'?'data-sw':'data-en') || el.textContent});
    qsa('.lang-toggle').forEach(function(btn){btn.textContent = lang==='sw'?'SW / EN':'EN / SW'});
  }
  function bind(){
    var menu=qs('.menu-toggle'), nav=qs('.nav-links');
    if(menu && nav && menu.dataset.bound!=='1'){
      function setMenu(open){
        nav.classList.toggle('open',open);
        menu.classList.toggle('is-open',open);
        menu.setAttribute('aria-expanded',open?'true':'false');
        menu.setAttribute('aria-label',open?'Close menu':'Open menu');
      }
      menu.dataset.bound='1';
      menu.setAttribute('aria-controls','ohgs-main-navigation');
      menu.setAttribute('aria-expanded','false');
      nav.id='ohgs-main-navigation';
      menu.addEventListener('click',function(e){e.preventDefault();setMenu(!nav.classList.contains('open'))});
      nav.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
      document.addEventListener('click',function(e){if(!e.target.closest('.site-header'))setMenu(false)});
      document.addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
    }
    qsa('.theme-toggle').forEach(function(btn){if(btn.dataset.bound==='1')return;btn.dataset.bound='1';btn.addEventListener('click',function(e){e.preventDefault();applyTheme(document.body.classList.contains('light')?'dark':'light')})});
    qsa('.lang-toggle').forEach(function(btn){if(btn.dataset.bound==='1')return;btn.dataset.bound='1';btn.addEventListener('click',function(e){e.preventDefault();applyLang(storageGet('ohgs-lang','en')==='en'?'sw':'en')})});
  }
  function header(){
    var h=qs('.site-header'); if(!h)return;
    h.classList.remove('hide','hidden','is-hidden','header-hidden','nav-hidden','scroll-hide');
    document.body.classList.remove('hide-header','header-hidden','nav-hidden');
    h.style.position='fixed';h.style.top='0';h.style.left='0';h.style.right='0';h.style.opacity='1';h.style.visibility='visible';h.style.transform='translateY(0)';h.style.zIndex='999999';
    if(window.scrollY>42) h.classList.add('ohgs-header-compact','scrolled'); else h.classList.remove('ohgs-header-compact');
  }
  function media(){
    qsa('img').forEach(function(img){
      img.style.opacity='1'; img.style.visibility='visible'; img.decoding='async';
      var aboveFold = !!img.closest('.site-header,.hero-media,.product-detail,.page-hero');
      img.loading = aboveFold ? 'eager' : 'lazy';
      img.fetchPriority = aboveFold ? 'high' : 'low';
      if(!img.dataset.fallbackBound){img.dataset.fallbackBound='1';img.addEventListener('error',function(){if(img.src.indexOf('ohgs-image-fallback.svg')<0){img.src='assets/ohgs-image-fallback.svg'}})}
    });
    qsa('video').forEach(function(v){v.preload=v.closest('.home-video-stage')?'auto':'metadata';v.playsInline=true;if(!v.controls)v.controls=true});
  }
  function run(){killLoader();applyTheme();applyLang();bind();header();media()}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  window.addEventListener('pageshow',killLoader);
  window.addEventListener('orientationchange',header,{passive:true});
  window.addEventListener('scroll',header,{passive:true});
  setTimeout(killLoader,1200);
})();
