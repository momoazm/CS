/* Shared Tailwind CDN config — include right after the Tailwind CDN script. */
tailwind.config = {
  theme: { extend: {
    colors: {
      navy:'#05090F', 'navy-2':'#0A1422', panel:'#0B1828', 'panel-2':'#0E2236',
      line:'#173049', gold:'#D4AF37', 'gold-l':'#ECD27E', 'gold-d':'#9C7C28',
      scarab:'#A33B37', teal:'#1C4D63', silver:'#B5B5B5', ink:'#F2E9D8', muted:'#E6DBC3',
    },
    fontFamily: {
      display:['Cinzel','Georgia','serif'], body:['Poppins','system-ui','sans-serif'], mono:['"Space Mono"','monospace'],
    },
  } }
};
