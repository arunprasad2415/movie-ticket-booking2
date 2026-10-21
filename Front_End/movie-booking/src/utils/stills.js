export const BACKDROPS = [
  "inception", "dune2", "spiderverse", "oppenheimer", "endgame", "barbie", "interstellar", "joker",
  "thebatman", "avatar2", "topgun", "johnwick4", "darkknight", "insideout2", "madmax", "gladiator2",
  "deadpool", "godzillakong", "garfield", "despicable4", "simpsons",
].map((name) => `/images/backdrops/${name}.jpg`);

export const shuffle = (list) => {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};
