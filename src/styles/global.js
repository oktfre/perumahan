const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  html { scroll-behavior:smooth; }

  :root {
    --sand:     #F5F0E8;
    --clay:     #C8B49A;
    --earth:    #8C6F5A;
    --espresso: #2C1F14;
    --white:    #FDFCFA;
    --mist:     #EAE5DC;
    --accent:   #B5844A;
    --text:     #3A2E25;
    --light:    #7A7065;
    --green:    #4A7C59;
    --red:      #A04040;
    --serif:    'Cormorant Garamond', serif;
    --sans:     'DM Sans', sans-serif;
  }

  body { font-family:var(--sans); background:var(--white); color:var(--text); overflow-x:hidden; }
  input, select, textarea, button { font-family:var(--sans); }
  input:focus, select:focus, textarea:focus { outline:none; }
  a { text-decoration:none; }

  input[type=range] { -webkit-appearance:none; width:100%; height:4px; background:var(--mist); border-radius:2px; outline:none; }
  input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:var(--accent); cursor:pointer; border:3px solid var(--white); box-shadow:0 2px 8px rgba(181,132,74,.4); transition:transform .2s; }
  input[type=range]::-webkit-slider-thumb:hover { transform:scale(1.2); }
  input[type=number]::-webkit-inner-spin-button,
  input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }

  /* ── Animations */
  @keyframes fadeUp    { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes fadeLeft  { from{opacity:0;transform:translateX(28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes fadeRight { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
  @keyframes backdropIn{ from{opacity:0} to{opacity:1} }
  @keyframes marquee   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
  @keyframes pulse     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }

  .fade-up    { animation:fadeUp  .6s ease both; }
  .fade-in    { animation:fadeIn  .4s ease both; }
  .fade-left  { animation:fadeLeft  .6s ease both; }
  .fade-right { animation:fadeRight .6s ease both; }

  /* Reveal on scroll */
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .7s ease, transform .7s ease; }
  .reveal.vis { opacity:1; transform:translateY(0); }
  .reveal-l { opacity:0; transform:translateX(-30px); transition:opacity .7s ease, transform .7s ease; }
  .reveal-l.vis { opacity:1; transform:translateX(0); }
  .reveal-r { opacity:0; transform:translateX(30px); transition:opacity .7s ease, transform .7s ease; }
  .reveal-r.vis { opacity:1; transform:translateX(0); }

  /* KPR sheet */
  .kpr-backdrop { position:fixed; inset:0; z-index:999; background:rgba(44,31,20,.7); backdrop-filter:blur(8px); animation:backdropIn .3s ease; display:flex; align-items:flex-end; justify-content:center; }
  .kpr-sheet { width:100%; max-width:1300px; height:93vh; background:var(--espresso); border-radius:20px 20px 0 0; display:flex; flex-direction:column; overflow:hidden; animation:slideUp .45s cubic-bezier(.16,1,.3,1); }

  /* Page transition */
  .page-enter { animation:fadeIn .35s ease both; }
`;

export default CSS;
