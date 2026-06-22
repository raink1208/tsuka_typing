export interface Word {
  kanji: string
  hiragana: string
  romaji: string
  difficulty: 1 | 2 | 3
  points: number
}

export interface Enemy {
  id: string
  name: string
  emoji: string
  wave: number
  maxHp: number
  attackPower: number
  color: string
  description: string
}

export const WORDS: Word[] = [
  // ─── Difficulty 1: romaji 2–6 chars ───────────────────────────────────
  { kanji: '猫',   hiragana: 'ねこ',   romaji: 'neko',    difficulty: 1, points: 50 },
  { kanji: '犬',   hiragana: 'いぬ',   romaji: 'inu',     difficulty: 1, points: 40 },
  { kanji: '海',   hiragana: 'うみ',   romaji: 'umi',     difficulty: 1, points: 40 },
  { kanji: '山',   hiragana: 'やま',   romaji: 'yama',    difficulty: 1, points: 45 },
  { kanji: '空',   hiragana: 'そら',   romaji: 'sora',    difficulty: 1, points: 45 },
  { kanji: '花',   hiragana: 'はな',   romaji: 'hana',    difficulty: 1, points: 45 },
  { kanji: '水',   hiragana: 'みず',   romaji: 'mizu',    difficulty: 1, points: 45 },
  { kanji: '風',   hiragana: 'かぜ',   romaji: 'kaze',    difficulty: 1, points: 45 },
  { kanji: '雪',   hiragana: 'ゆき',   romaji: 'yuki',    difficulty: 1, points: 45 },
  { kanji: '月',   hiragana: 'つき',   romaji: 'tsuki',   difficulty: 1, points: 55 },
  { kanji: '星',   hiragana: 'ほし',   romaji: 'hoshi',   difficulty: 1, points: 55 },
  { kanji: '剣',   hiragana: 'けん',   romaji: 'ken',     difficulty: 1, points: 40 },
  { kanji: '盾',   hiragana: 'たて',   romaji: 'tate',    difficulty: 1, points: 45 },
  { kanji: '鬼',   hiragana: 'おに',   romaji: 'oni',     difficulty: 1, points: 40 },
  { kanji: '龍',   hiragana: 'りゅう', romaji: 'ryuu',    difficulty: 1, points: 55 },
  { kanji: '城',   hiragana: 'しろ',   romaji: 'shiro',   difficulty: 1, points: 55 },
  { kanji: '森',   hiragana: 'もり',   romaji: 'mori',    difficulty: 1, points: 45 },
  { kanji: '川',   hiragana: 'かわ',   romaji: 'kawa',    difficulty: 1, points: 45 },
  { kanji: '土',   hiragana: 'つち',   romaji: 'tsuchi',  difficulty: 1, points: 60 },
  { kanji: '炎',   hiragana: 'ほのお', romaji: 'honoo',   difficulty: 1, points: 65 },
  { kanji: '氷',   hiragana: 'こおり', romaji: 'koori',   difficulty: 1, points: 65 },
  { kanji: '虎',   hiragana: 'とら',   romaji: 'tora',    difficulty: 1, points: 45 },
  { kanji: '鷹',   hiragana: 'たか',   romaji: 'taka',    difficulty: 1, points: 45 },
  { kanji: '狼',   hiragana: 'おおかみ', romaji: 'ookami', difficulty: 1, points: 70 },

  // ─── Difficulty 2: romaji 6–9 chars ───────────────────────────────────
  { kanji: '桜',     hiragana: 'さくら',     romaji: 'sakura',   difficulty: 2, points: 100 },
  { kanji: '侍',     hiragana: 'さむらい',   romaji: 'samurai',  difficulty: 2, points: 120 },
  { kanji: '魔法',   hiragana: 'まほう',     romaji: 'mahou',    difficulty: 2, points: 100 },
  { kanji: '太陽',   hiragana: 'たいよう',   romaji: 'taiyou',   difficulty: 2, points: 110 },
  { kanji: '心',     hiragana: 'こころ',     romaji: 'kokoro',   difficulty: 2, points: 105 },
  { kanji: '力',     hiragana: 'ちから',     romaji: 'chikara',  difficulty: 2, points: 110 },
  { kanji: '勝利',   hiragana: 'しょうり',   romaji: 'shouri',   difficulty: 2, points: 110 },
  { kanji: '忍者',   hiragana: 'にんじゃ',   romaji: 'ninja',    difficulty: 2, points: 115 },
  { kanji: '天空',   hiragana: 'てんくう',   romaji: 'tenkuu',   difficulty: 2, points: 110 },
  { kanji: '花火',   hiragana: 'はなび',     romaji: 'hanabi',   difficulty: 2, points: 105 },
  { kanji: '神様',   hiragana: 'かみさま',   romaji: 'kamisama', difficulty: 2, points: 120 },
  { kanji: '富士山', hiragana: 'ふじさん',   romaji: 'fujisan',  difficulty: 2, points: 120 },
  { kanji: '稲妻',   hiragana: 'いなずま',   romaji: 'inazuma',  difficulty: 2, points: 125 },
  { kanji: '勇者',   hiragana: 'ゆうしゃ',   romaji: 'yuusha',   difficulty: 2, points: 110 },
  { kanji: '魔王',   hiragana: 'まおう',     romaji: 'maou',     difficulty: 2, points: 100 },
  { kanji: '冒険',   hiragana: 'ぼうけん',   romaji: 'bouken',   difficulty: 2, points: 110 },
  { kanji: '迷宮',   hiragana: 'めいきゅう', romaji: 'meikyuu',  difficulty: 2, points: 130 },
  { kanji: '宝剣',   hiragana: 'ほうけん',   romaji: 'houken',   difficulty: 2, points: 110 },
  { kanji: '運命',   hiragana: 'うんめい',   romaji: 'unmei',    difficulty: 2, points: 110 },
  { kanji: '覚悟',   hiragana: 'かくご',     romaji: 'kakugo',   difficulty: 2, points: 105 },
  { kanji: '疾風',   hiragana: 'はやて',     romaji: 'hayate',   difficulty: 2, points: 105 },
  { kanji: '妖精',   hiragana: 'ようせい',   romaji: 'yousei',   difficulty: 2, points: 115 },
  { kanji: '伝承',   hiragana: 'でんしょう', romaji: 'denshou',  difficulty: 2, points: 115 },
  { kanji: '誓い',   hiragana: 'ちかい',     romaji: 'chikai',   difficulty: 2, points: 105 },

  // ─── Difficulty 3: romaji 8+ chars ────────────────────────────────────
  { kanji: '魔法使い',  hiragana: 'まほうつかい',     romaji: 'mahoutsukai',     difficulty: 3, points: 200 },
  { kanji: '伝説',      hiragana: 'でんせつ',         romaji: 'densetsu',        difficulty: 3, points: 160 },
  { kanji: '世界一',    hiragana: 'せかいいち',       romaji: 'sekaiichi',       difficulty: 3, points: 190 },
  { kanji: '幻想郷',    hiragana: 'げんそうきょう',   romaji: 'gensoukyou',      difficulty: 3, points: 220 },
  { kanji: '無敵艦隊',  hiragana: 'むてきかんたい',   romaji: 'mutekikantai',    difficulty: 3, points: 210 },
  { kanji: '最強の剣',  hiragana: 'さいきょうのけん', romaji: 'saikyounoken',    difficulty: 3, points: 215 },
  { kanji: '絶対勝利',  hiragana: 'ぜったいしょうり', romaji: 'zettaishouri',    difficulty: 3, points: 240 },
  { kanji: '領国つかさ',hiragana: 'りょうごくつかさ', romaji: 'ryougokutsukasa', difficulty: 3, points: 300 },
  { kanji: '超能力者',  hiragana: 'ちょうのうりょくしゃ', romaji: 'chounouryokusha', difficulty: 3, points: 280 },
  { kanji: '神秘的',    hiragana: 'しんぴてき',       romaji: 'shinpiteki',      difficulty: 3, points: 175 },
  { kanji: '圧倒的',    hiragana: 'あっとうてき',     romaji: 'attouteki',       difficulty: 3, points: 190 },
  { kanji: '破壊神',    hiragana: 'はかいしん',       romaji: 'hakaishin',       difficulty: 3, points: 170 },
  { kanji: '不死鳥',    hiragana: 'ふしちょう',       romaji: 'fushichou',       difficulty: 3, points: 175 },
  { kanji: '龍の咆哮',  hiragana: 'りゅうのほうこう', romaji: 'ryuunohookou',    difficulty: 3, points: 230 },
]

export const ENEMIES: Enemy[] = [
  {
    id: 'slime',
    name: 'スライム',
    emoji: '🫧',
    wave: 1,
    maxHp: 150,
    attackPower: 0,
    color: '#44ff88',
    description: 'よわよわの敵',
  },
  {
    id: 'goblin',
    name: 'ゴブリン',
    emoji: '👺',
    wave: 2,
    maxHp: 300,
    attackPower: 3,
    color: '#88cc44',
    description: '素早く動く悪党',
  },
  {
    id: 'wizard',
    name: '闇の魔術師',
    emoji: '🧙',
    wave: 3,
    maxHp: 480,
    attackPower: 7,
    color: '#aa44ff',
    description: '呪文で攻撃してくる',
  },
  {
    id: 'dragon',
    name: 'ドラゴン',
    emoji: '🐉',
    wave: 4,
    maxHp: 700,
    attackPower: 12,
    color: '#ff6644',
    description: '伝説の炎龍',
  },
  {
    id: 'demon',
    name: '大魔王',
    emoji: '👿',
    wave: 5,
    maxHp: 1000,
    attackPower: 20,
    color: '#ff0044',
    description: '究極の悪魔',
  },
]
