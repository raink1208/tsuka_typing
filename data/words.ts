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
  maxHp: number
  attackPower: number
  color: string
  description: string
}

export const WORDS: Word[] = [
  // { kanji: '', hiragana: '', romaji: '', difficulty: 1, points: 0 },
  { kanji: 'すぺしゃりて', hiragana: 'すぺしゃりて', romaji: 'supesyarite', difficulty: 1, points: 0 },
  { kanji: '領国つかさ', hiragana: 'りょうごくつかさ', romaji: 'ryougokutsukasa', difficulty: 1, points: 0 },
  { kanji: '額ずけ諸君！', hiragana: 'ぬかずけしょくん！', romaji: 'nukazukesyokun!', difficulty: 1, points: 0 },
  { kanji: '最強天才中学生', hiragana: 'さいきょうてんさいちゅうがくせい', romaji: 'saikyoutennsaityuugakusei', difficulty: 1, points: 0 },
  { kanji: 'つかさキングダム', hiragana: 'つかさきんぐだむ', romaji: 'tsukasakingudamu', difficulty: 1, points: 0 },
  { kanji: '人類皆ドM理論', hiragana: 'じんるいみんなどえむりろん', romaji: 'jinnruiminnnadoemurironn', difficulty: 1, points: 0 },
  { kanji: '破滅願望', hiragana: 'はめつがんぼう', romaji: 'hametugannbou', difficulty: 1, points: 0 },
  { kanji: 'チンチンのホットミルク', hiragana: 'ちんちんのほっとみるく', romaji: 'tintinnohottomiruku', difficulty: 1, points: 0 },
  { kanji: 'ファナモ', hiragana: 'ふぁなも', romaji: 'fanamo', difficulty: 1, points: 0 },
  { kanji: 'メスガキ', hiragana: 'めすがき', romaji: 'mesugaki', difficulty: 1, points: 0 },
  { kanji: 'マイクロビキニ', hiragana: 'まいくろびきに', romaji: 'maikurobikini', difficulty: 1, points: 0 },
  { kanji: '脾臓2倍', hiragana: 'ひぞうにばい', romaji: 'hizou2bai', difficulty: 1, points: 0 },
  // ─── ハッシュタグ ───────────────────────────────────
  { kanji: 'つかさ国営放送', hiragana: 'つかさこくえいほうそう', romaji: 'tsukasakokueihousou', difficulty: 1, points: 0 },
  { kanji: 'つかさ肖像画', hiragana: 'つかさしょうぞうが', romaji: 'tsukasasyouzouga', difficulty: 1, points: 0 },
  { kanji: '領国大使館', hiragana: 'りょうごくたいしかん', romaji: 'ryougokutaisikan', difficulty: 1, points: 0 },
  { kanji: '切り抜け諸君', hiragana: 'きりぬけしょくん', romaji: 'kirinukesyokunn', difficulty: 1, points: 0 },
  // ─── イベント ───────────────────────────────────
  { kanji: '絶対ぼくの領域', hiragana: 'ぜったいぼくのきんぐだむ', romaji: 'zettaibokunokingudamu', difficulty: 1, points: 0 },
  { kanji: '禁断ノ幻想郷', hiragana: 'きんだんのあるかでぃあ', romaji: 'kindannnoarukadhia', difficulty: 1, points: 0 },
  { kanji: '神臨ノ前奏曲', hiragana: 'かみりんのぷれりゅーど', romaji: 'kamirinnnopureryu-do', difficulty: 1, points: 0 },
  { kanji: '領国つかさの深夜通信', hiragana: 'りょうごくつかさのしんやつうしん', romaji: 'ryougokutsukasanoshinyatushin', difficulty: 1, points: 0 },
  { kanji: '謁見ティ～タイム', hiragana: 'えっけんてぃーたいむ', romaji: 'ekkenteli-taimu', difficulty: 1, points: 0 },
  // ─── 好物 ───────────────────────────────────
  { kanji: 'うなぎ', hiragana: 'うなぎ', romaji: 'unagi', difficulty: 1, points: 0 },
  { kanji: '朝マクー', hiragana: 'あさまくー', romaji: 'asamaku-', difficulty: 1, points: 0 },
  { kanji: 'ハートチップル焼肉にんにく焙煎味', hiragana: 'はーとちっぷるやきにくにんにくばいせんあじ', romaji: 'ha-totippuruyakinikuninnnikubaisennaji', difficulty: 1, points: 0 },
  // ─── コラボタグ ───────────────────────────────────
  { kanji: 'つかにゃあず', hiragana: 'つかにゃあず', romaji: 'tsukanyaazu', difficulty: 1, points: 0 },
  { kanji: 'なのでつかｗ', hiragana: 'なのでつかw', romaji: 'nanodetukaw', difficulty: 1, points: 0 },
  { kanji: 'つかぷー', hiragana: 'つかぷー', romaji: 'tsukapu-', difficulty: 1, points: 0 },
  { kanji: '神回量産機', hiragana: 'かみかいりょうさんき', romaji: 'kamikairyousannki', difficulty: 1, points: 0 },
  { kanji: '罪', hiragana: 'つみ', romaji: 'tumi', difficulty: 1, points: 0 },
  { kanji: 'ぼくのいぬ', hiragana: 'ぼくのいぬ', romaji: 'bokunoinu', difficulty: 1, points: 0 },
  // ─── セリフ ───────────────────────────────────
  { kanji: 'でかいケツで解決', hiragana: 'でかいけつでかいけつ', romaji: 'dekaiketudekaiketu', difficulty: 1, points: 0 },
  { kanji: 'GOD', hiragana: 'god', romaji: 'god', difficulty: 1, points: 0 },
  { kanji: '御意', hiragana: 'ぎょい', romaji: 'gyoi', difficulty: 1, points: 0 },
  { kanji: 'おつかさ', hiragana: 'おつかさ', romaji: 'otsukasa', difficulty: 1, points: 0 },
  { kanji: 'でっかぁ', hiragana: 'でっかぁ', romaji: 'dekkala', difficulty: 1, points: 0 },
  { kanji: 'よわよわ～', hiragana: 'よわよわー', romaji: 'yowayowa-', difficulty: 1, points: 0 },
  { kanji: 'すやすやぷぅぷぅ', hiragana: 'すやすやぷぅぷぅ', romaji: 'suyasuyapulupulu', difficulty: 1, points: 0 },
  // ─── すぺしゃりてメンバー セリフ ───────────────────────────────────
  { kanji: 'その前に水を飲む！', hiragana: 'そのまえにみずをのむ！', romaji: 'sonomaenimizuwonomu!', difficulty: 1, points: 0 }
]

export const ENEMIES: Enemy[] = [
  {
    id: 'tsukasa',
    name: '領国つかさ',
    emoji: '🐱',
    maxHp: 150,
    attackPower: 0,
    color: '#44ff88',
    description: 'よわよわの敵',
  },
]