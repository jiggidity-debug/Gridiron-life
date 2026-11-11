/* v0.602: legacy character creation retired. Single canonical creator: 74-part9.js. */
function start(){ if(typeof window.part9Start!=='function') throw new Error('Character creator not loaded'); return window.part9Start(); }
function setDraftPos(position){ if(typeof window.part9ChangePosition!=='function') throw new Error('Character creator not loaded'); return window.part9ChangePosition(position); }
