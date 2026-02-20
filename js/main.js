document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle) {
    toggle.addEventListener('click', () => links.classList.toggle('active'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('active')));
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); window.scrollTo({ top: t.offsetTop - nav.offsetHeight - 16, behavior: 'smooth' }); }
    });
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));

  document.querySelectorAll('[data-count]').forEach(el => {
    const cObs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animate(e.target); cObs.unobserve(e.target); } });
    }, { threshold: 0.5 });
    cObs.observe(el);
  });

  function animate(el) {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const start = performance.now();
    (function update(now) {
      const p = Math.min((now - start) / 1800, 1);
      el.textContent = prefix + Math.floor((1 - Math.pow(1 - p, 3)) * target).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(update);
    })(start);
  }

  // --- Referral Modal ---
  const refs = {
    'kim-jensen': {
      name: 'Kim Jensen',
      title: 'EVP, Head of Global Recommerce & Sourcing \u2013 GM EMEA/APAC at ReMarkets',
      quote: 'I had the pleasure of working closely with Jerry Lambert during his time as VP of IT at ReMarkets, where he was a peer of mine on the leadership team and reported directly to the CEO. Jerry is one of those rare IT executives who combines deep technical expertise with an incredibly positive, energetic, and people-focused approach.\n\nJerry has a natural ability to make everyone feel heard. He is approachable, collaborative, and genuinely enjoyable to work with. What always stood out to me was his mindset: Jerry saw every department in the company as his customer. He constantly asked how his team and the IT function could better support, simplify, and empower the rest of the organization. This customer-centric philosophy made him an invaluable partner across Sales, Finance, Operations, and Logistics.\n\nBeyond being highly capable and solutions-oriented, Jerry brings an infectious optimism and a strong \u201Clet\u2019s make it happen\u201D attitude. He elevates the culture around him, builds trust quickly, and consistently follows through on what he promises.\n\nI would recommend Jerry without hesitation for any senior technology or IT leadership role. Any organization would be fortunate to have him.'
    },
    'brian-socolofsky': {
      name: 'Brian Socolofsky',
      title: 'Vice President of FP&A at America\u2019s Group',
      quote: 'Jerry was a great partner to the finance team. He took the time to dig deep and understand the existing data and structures to support the analytics team in how best to approach questions and report development. Jerry also made data easily available to finance to enable better understanding of the business. He was always willing to roll up his sleeves and do detailed research and analysis, as well as explain results to non technical team members.'
    },
    'kelly-fleischer': {
      name: 'Kelly Fleischer',
      title: 'Business Integration & People Strategy Executive',
      quote: 'I had the pleasure of working with Jerry at Syntegra, where he served as a talented C-level technical executive. When I joined the company to lead HR and partner with Jerry on an ERP implementation, Jerry had already orchestrated all corporate formations and was deeply involved in creating the organizational and corporate structure, alongside technical frameworks. His leadership extended over diverse areas, including development, data management, customer support, and 3rd party integrations.\n\nJerry\u2019s responsibilities also encompassed service delivery, billing, and all Microsoft administration. Throughout our collaboration, I found Jerry to be not only highly competent but also exceptionally personable and helpful. His team held him in high regard, respecting and adoring his leadership. I would welcome any opportunity to work with Jerry again. His expertise and character make him a valuable asset to any team.'
    },
    'ignacio-tamarit': {
      name: 'Ignacio Tamarit',
      title: 'Business Leader \u2013 Intl Billing, Payments & Telecom',
      quote: 'This is to recommend Jerry Lambert for any organization. Jerry has amazing executive skills. He helped closing business, negotiated at the highest level and managed complex teams located all over the world. Also Jerry excelled as vendor management in the telecom space. We were his software supplier in the billing field and were impressed to see Jerry in action. His technical skills, attention to detail and management of urgent scenarios were amazing. More than anything he is a true team player, super trust worthy and great person work with.'
    },
    'rolf-koster': {
      name: 'Rolf Koster',
      title: 'Cybersecurity Project Manager',
      quote: 'I reported to Jerry between 2020 and 2022 and worked on several cybersecurity and compliance related projects, including the implementation of various tools giving us a better view on open vulnerabilities and risks, and the audit of assets and processes to ensure we could achieve compliance with information- and cybersecurity frameworks that were prioritized by Sr management. We worked for the corporate area as well as the integration of various local branches in different geographies.\n\nDuring that time I got to know Jerry as a capable leader, able to motivate involved staff and someone who can get the job done fast and effectively. I\u2019d highly recommend Jerry for his spirited leadership and his ability to obtain solid results, even when the project seems daunting.'
    },
    'ramu-kambalapuram': {
      name: 'Ramu Kambalapuram',
      title: 'CEO @CloudTem | Generative AI, DevOps & Cloud Services',
      quote: 'I have worked with Jerry for a number of years across several companies. As an executive, he has a keen understanding of all of the technology involved in any project and is usually the person that provides directional design and, at times, low level designs directly to the developers. He is respectful to the team members and to off-shore administration as well.\n\nFrom budgets to contracts or development and everything in between. Jerry is a great person to work with on off-shore projects.'
    },
    'cesar-serrano': {
      name: 'Cesar Serrano',
      title: 'Director of Technology and Customer Operations',
      quote: 'Jerry and I built very quickly a respectful and trustworthy relationship within a harsh, high pressure environment. To me, it showed his empathy for cultural and geographical differences of which I will always be grateful.\n\nHe\u2019s able to pull the extra mile from you keeping the cool and the fairness. He was managing lots of different situations at the same time and we were always able to balance the priority and the expectations with realism.\n\nI\u2019d be happy to jump on board with him anytime.'
    },
    'matias-ruiz': {
      name: 'Mat\u00EDas F\u00E9lix Ruiz',
      title: 'Chief Administrative Officer @ Skywire Networks | Harvard Leadership',
      quote: 'I had the pleasure of collaborating with Jerry on various initiatives, including billing, IT, service delivery, and other areas essential to our business. Without hesitation, I can attest that he is an invaluable asset. His technical expertise is exceptional, matched only by his profound business acumen, unwavering drive, and ability to inspire true leadership in others.\n\nIn his executive role, Jerry not only drove positive change and effectively managed internal and external stakeholders but also demonstrated a strong customer orientation, always ensuring their needs were met. He mastered the art of tackling challenges head-on, consistently finding innovative solutions that propelled our business forward.'
    },
    'keith-colfer': {
      name: 'Keith Colfer',
      title: 'Director of Billing Operations',
      quote: 'I had the pleasure of working as a Director for Jerry over several years at Pareteum Corporation and Syntegra Systems. Jerry firmly believes leadership is about empowering others, and he leads by example consistently demonstrating integrity, humility, and respect for all team members. He gives his employees room to grow and redirects constructively.\n\nHis commitment to ensuring every individual\u2019s responsibilities align with their authority is a standard of excellence that inspires and empowers. At the same time, he\u2019s not afraid to get his hands into the core of an issue and will go out of his way to help. He is pivotal in shaping not only the trajectory of his organization but also the culture and ethos. He fosters a culture of accountability, transparency, and collaboration within his team, and in doing so, across the organization.\n\nAdditionally, he is extremely knowledgeable, and makes himself so. He navigates various complex challenges with strategic vision, seamlessly driving positive change and fostering a culture of continuous improvement. To top things off, Jerry is a human being. He\u2019s fun, sincere, respectful of people\u2019s time, and understanding of their work/life balance.'
    },
    'shane-atherton': {
      name: 'Shane Atherton, MBA',
      title: 'FP&A Manager at America\u2019s Group',
      quote: 'I had the pleasure of working with Jerry at Americas Group, where he served as the Director of Development. Throughout his tenure, Jerry was instrumental in revolutionizing our approach to data, significantly enhancing our decision-making processes and operational efficiency.\n\nJerry possesses a rare blend of technical expertise and visionary leadership, which enabled him to lead our development team. His strategic foresight to \u201Copen the book on data access\u201D has not only streamlined our decision-making processes but also provided us with critical insights that will help drive business growth.\n\nWhat sets Jerry apart is his ability to translate complex data into actionable strategies. His dedication to fostering a culture of innovation and continuous improvement has made a lasting impact to the organization. Jerry\u2019s leadership and mentorship have also greatly contributed to the professional growth of our team, inspiring us to strive for \u201Cperfect\u201D.\n\nI have no doubt that Jerry will continue to make significant contributions to any organization fortunate enough to have him. He is a true asset, and I wholeheartedly recommend him for any future endeavors in data analytics and beyond.'
    },
    'drew-rule': {
      name: 'Drew Rule',
      title: 'Strategic HR Management | Real Estate Investor',
      quote: 'Jerry is a forward-thinking, detail-oriented visionary. I say that one of the greatest blessings of the sales profession is the ability to learn from the bright customers and leaders I get to work with. No one represents that more than Jerry. He builds teams and processes for scale, challenges the status quo in the best way, and at the same time ensures that those he is leading/working feel appreciated and understood (he led a group of 80 at Pareteum across 5 departments and several acquisitions).\n\nHe is very thorough in his analysis and is one of the most educated/researched individuals I\u2019ve had the pleasure to work with. He is also a talented negotiator and is very clear in his asks.\n\nWith that said, the best part of Jerry though is the person he is. He\u2019s incredibly trustworthy, honest, and cares about those he is working with not just in a professional manner, but in a human one.'
    },
    'steve-wycoff': {
      name: 'Steve Wycoff',
      title: 'Senior Systems Engineer at Americas Auto Group',
      quote: 'Having worked side by side with Jerry for the last year, Jerry has shown me why he was hired as Director of Development. His willingness to get down in the trenches, work with technical staff to dig through terabytes of data, millions of lines of code and guide our development team to deliver projects on schedule.\n\nHis professionalism, knowledge and experience will set him up for success with any size company or project. I would recommend Jerry to any company needing those solid leadership skills. I\u2019m thankful for the things he\u2019s taught me.'
    },
    'shubha-md': {
      name: 'Shubha M.D',
      title: 'Senior Manager QA | API Testing & Automation | Kubernetes',
      quote: 'I had the pleasure of working alongside Jerry at Syntegra and highly recommend him for his exceptional leadership qualities. He\u2019s a people-centered leader who listens attentively and provides unwavering support during challenges. His encouragement and enthusiasm are truly commendable, driving our team to achieve remarkable results. Jerry also ensures that his team adds value and generously provides opportunities for growth.\n\nJerry\u2019s leadership at Syntegra was instrumental in fostering a collaborative and supportive work environment. His dedication to both the team\u2019s success and individual growth is evident in his approachable nature and unwavering encouragement. I wholeheartedly recommend Jerry for any leadership role, as his passion and commitment undoubtedly elevate any team he leads.'
    },
    'rajeeb-ghosh': {
      name: 'Rajeeb Ghosh',
      title: 'CEO @ Shift Ahead Technologies',
      quote: 'Have been working with Jerry for over a decade now and he\u2019s been managing development teams in India and have done a fantastic job managing teams & turning them around. Have helped him in many of these development projects. A core professional to count for sure.'
    }
  };

  const modal = document.getElementById('refModal');
  const modalQuote = document.getElementById('refModalQuote');
  const modalName = document.getElementById('refModalName');
  const modalTitle = document.getElementById('refModalTitle');
  const modalClose = modal.querySelector('.ref-modal-close');

  document.querySelectorAll('.ref-more').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.dataset.ref;
      const ref = refs[id];
      if (!ref) return;
      modalQuote.innerHTML = '\u201C' + ref.quote.replace(/\n\n/g, '</p><p style="margin-top:16px">') + '\u201D';
      modalName.textContent = ref.name;
      modalTitle.textContent = ref.title;
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });
});
