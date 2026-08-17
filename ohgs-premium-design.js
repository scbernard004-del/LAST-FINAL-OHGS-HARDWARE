(function(){
  'use strict';

  function currentLanguage(){
    return document.documentElement.lang === 'sw' ? 'sw' : 'en';
  }

  function addScrollProgress(){
    if(document.querySelector('.scroll-progress')) return;
    var bar=document.createElement('div');
    bar.className='scroll-progress';
    bar.setAttribute('aria-hidden','true');
    document.body.appendChild(bar);
    function update(){
      var root=document.documentElement;
      var total=Math.max(1,root.scrollHeight-root.clientHeight);
      bar.style.width=Math.min(100,(root.scrollTop/total)*100)+'%';
    }
    update();
    window.addEventListener('scroll',update,{passive:true});
    window.addEventListener('resize',update,{passive:true});
  }

  function polishMenu(){
    var menu=document.querySelector('.menu-toggle');
    if(!menu || menu.dataset.premiumMenu==='1') return;
    menu.dataset.premiumMenu='1';
    menu.innerHTML='<span></span><span></span><span></span>';
  }

  function addHomeDetails(){
    var hero=document.querySelector('.hero');
    if(!hero) return;
    var actions=hero.querySelector('.actions');
    if(actions && !hero.querySelector('.hero-trust')){
      var trust=document.createElement('div');
      trust.className='hero-trust';
      trust.setAttribute('aria-label','OHGS service benefits');
      var items=[
        ['Arusha-based support','Huduma ya Arusha'],
        ['Fast WhatsApp ordering','Oda ya haraka WhatsApp'],
        ['Practical product guidance','Ushauri wa bidhaa']
      ];
      items.forEach(function(item){
        var span=document.createElement('span');
        span.setAttribute('data-en',item[0]);
        span.setAttribute('data-sw',item[1]);
        span.textContent=item[currentLanguage()==='sw'?1:0];
        trust.appendChild(span);
      });
      actions.insertAdjacentElement('afterend',trust);
    }
    var media=hero.querySelector('.hero-media');
    if(media && !media.querySelector('.premium-media-badge')){
      var badge=document.createElement('div');
      badge.className='premium-media-badge';
      badge.setAttribute('data-en','Tools • Pumps • Site equipment');
      badge.setAttribute('data-sw','Zana • Pampu • Vifaa vya site');
      badge.textContent=currentLanguage()==='sw'?'Zana • Pampu • Vifaa vya site':'Tools • Pumps • Site equipment';
      media.appendChild(badge);
    }
  }

  function wrapProductImages(){
    document.querySelectorAll('.product-card > img').forEach(function(img){
      if(img.parentElement && img.parentElement.classList.contains('product-image-frame')) return;
      var frame=document.createElement('div');
      frame.className='product-image-frame';
      img.parentNode.insertBefore(frame,img);
      frame.appendChild(img);
    });
  }

  function numberTextCards(){
    document.querySelectorAll('.text-card').forEach(function(card,index){
      var heading=card.querySelector('h3');
      if(!heading || heading.querySelector('.premium-card-number')) return;
      var badge=document.createElement('span');
      badge.className='premium-card-number';
      badge.setAttribute('aria-hidden','true');
      badge.textContent=String(index+1).padStart(2,'0');
      heading.insertBefore(badge,heading.firstChild);
    });
  }

  function addRevealMotion(){
    var reduce=window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce || !('IntersectionObserver' in window)) return;
    var items=Array.prototype.slice.call(document.querySelectorAll('.card,.gallery img,.feature-list>div,.location-card,.map-card,.contact-form,.video-frame,.video-copy'));
    if(!items.length) return;
    document.body.classList.add('premium-motion');
    items.forEach(function(item){item.classList.add('reveal-item')});
    var observer=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{rootMargin:'0px 0px -7% 0px',threshold:.08});
    items.forEach(function(item,index){
      item.style.transitionDelay=Math.min(index%6,4)*55+'ms';
      observer.observe(item);
    });
  }

  function identifyPage(){
    var path=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'');
    document.body.classList.add('page-'+path.replace(/[^a-z0-9-]/gi,'-').toLowerCase());
  }

  function protectVideoControls(){
    var videos=Array.prototype.slice.call(document.querySelectorAll('video'));
    if(!videos.length) return;

    function syncPlaying(){
      document.body.classList.toggle('premium-video-playing',videos.some(function(video){
        return !video.paused && !video.ended;
      }));
    }

    videos.forEach(function(video){
      video.addEventListener('playing',syncPlaying);
      video.addEventListener('pause',syncPlaying);
      video.addEventListener('ended',syncPlaying);
    });

    if('IntersectionObserver' in window){
      var observer=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          entry.target.dataset.premiumInView=entry.isIntersecting?'1':'0';
        });
        document.body.classList.toggle('premium-video-in-view',videos.some(function(video){
          return video.dataset.premiumInView==='1';
        }));
      },{threshold:.12});
      videos.forEach(function(video){observer.observe(video)});
    }
  }

  function run(){
    identifyPage();
    addScrollProgress();
    polishMenu();
    addHomeDetails();
    wrapProductImages();
    numberTextCards();
    addRevealMotion();
    protectVideoControls();
    document.body.classList.add('premium-ready');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();
})();
