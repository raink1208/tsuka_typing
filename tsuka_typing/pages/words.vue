<template>
  <div class="words-screen">
    <!-- ヘッダー -->
    <header class="words-header">
      <div class="crest" aria-hidden="true">
        <span class="crest-line" /><span class="crest-icon">📖</span><span class="crest-line" />
      </div>
      <h1 class="words-title">{{ t('words.title') }}</h1>
      <p class="words-sub">{{ t('words.count', { shown: filteredWords.length, total: WORDS.length }) }}</p>
    </header>

    <!-- 絞り込み -->
    <section class="filters">
      <input
        v-model="keyword"
        class="search-input"
        type="search"
        :placeholder="t('words.searchPlaceholder')"
        :aria-label="t('words.searchPlaceholder')"
      />
      <div class="diff-filters" role="group" :aria-label="t('words.difficultyLabel')">
        <button
          v-for="f in diffFilters"
          :key="f.value"
          :class="['filter-btn', { active: selectedDiff === f.value }]"
          @click="selectedDiff = f.value"
        >
          {{ t(`words.filters.${f.key}`) }}
        </button>
      </div>
      <div class="diff-filters" role="group" :aria-label="t('words.categoryLabel')">
        <button
          :class="['filter-btn', { active: selectedCategory === 'all' }]"
          @click="selectedCategory = 'all'"
        >
          {{ t('words.filters.all') }}
        </button>
        <button
          v-for="c in categories"
          :key="c"
          :class="['filter-btn', { active: selectedCategory === c }]"
          @click="selectedCategory = c"
        >
          {{ categoryLabel(c) }}
        </button>
      </div>
    </section>

    <!-- 一覧 -->
    <div class="table-wrap">
      <table class="words-table">
        <thead>
          <tr>
            <th scope="col" class="col-no">#</th>
            <th scope="col">{{ t('words.header.kanji') }}</th>
            <th scope="col">{{ t('words.header.hiragana') }}</th>
            <th scope="col">{{ t('words.header.romaji') }}</th>
            <th scope="col" class="col-category">{{ t('words.header.category') }}</th>
            <th scope="col" class="col-diff">{{ t('words.header.difficulty') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(w, i) in filteredWords" :key="w.romaji">
            <td class="col-no">{{ i + 1 }}</td>
            <td class="cell-kanji">{{ w.kanji }}</td>
            <td class="cell-hiragana">{{ w.hiragana }}</td>
            <td class="cell-romaji">{{ w.romaji }}</td>
            <td class="col-category">
              <span class="category-badge">{{ categoryLabel(w.category) }}</span>
            </td>
            <td class="col-diff">
              <span :class="['diff-badge', `diff-${w.difficulty}`]">
                {{ t(`words.difficulty.${w.difficulty}`) }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredWords.length === 0">
            <td class="empty" colspan="6">{{ t('words.empty') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 戻る -->
    <NuxtLink to="/" class="back-btn">
      <span aria-hidden="true">←</span>
      {{ t('words.backButton') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { WORDS } from '~/data/words'

const { t, te } = useI18n()

type DiffFilter = 'all' | 1 | 2 | 3

const diffFilters: { value: DiffFilter; key: string }[] = [
  { value: 'all', key: 'all' },
  { value: 1, key: 'd1' },
  { value: 2, key: 'd2' },
  { value: 3, key: 'd3' },
]

const keyword = ref('')
const selectedDiff = ref<DiffFilter>('all')
const selectedCategory = ref<string>('all')

/** words.json に含まれるカテゴリ一覧（出現順） */
const categories = [...new Set(WORDS.map(w => w.category))]

/** i18n にラベルがあれば使い、無ければカテゴリ名をそのまま表示する */
function categoryLabel(category: string) {
  const key = `words.categories.${category}`
  return te(key) ? t(key) : category
}

const filteredWords = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  return WORDS.filter((w) => {
    if (selectedDiff.value !== 'all' && w.difficulty !== selectedDiff.value) return false
    if (selectedCategory.value !== 'all' && w.category !== selectedCategory.value) return false
    if (!q) return true
    return w.kanji.toLowerCase().includes(q)
      || w.hiragana.toLowerCase().includes(q)
      || w.romaji.toLowerCase().includes(q)
  })
})
</script>

<style scoped>
.words-screen {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1.6rem 1rem 1.4rem;
  overflow: hidden;
}

/* ── ヘッダー ─────────────────────────── */
.words-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.crest {
  display: flex;
  align-items: center;
  gap: 14px;
}
.crest-line {
  display: block;
  width: 64px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #7a5c28, transparent);
}
.crest-icon {
  font-size: 1.1rem;
}
.words-title {
  font-family: 'Cinzel', 'Noto Serif JP', serif;
  font-size: 1.5rem;
  letter-spacing: 0.16em;
  color: #e8c85a;
  text-shadow: 0 0 18px rgba(200,160,40,0.35);
}
.words-sub {
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  color: #b3a173;
}

/* ── 絞り込み ─────────────────────────── */
.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.search-input {
  width: 260px;
  padding: 8px 12px;
  background: #1a1208;
  border: 1px solid #4a3218;
  color: #ece2bc;
  font-family: 'Noto Serif JP', serif;
  font-size: 0.92rem;
  outline: none;
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: #c8a028;
}
.search-input::placeholder {
  color: #8f7c4c;
}
.diff-filters {
  display: flex;
  gap: 6px;
}
.filter-btn {
  padding: 8px 14px;
  background: #1a1208;
  border: 1px solid #4a3218;
  color: #b3a173;
  font-family: 'Noto Serif JP', serif;
  font-size: 0.84rem;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.filter-btn:hover {
  border-color: #7a5c28;
  color: #ece2bc;
}
.filter-btn.active {
  border-color: #c8a028;
  color: #e8c85a;
  background: linear-gradient(145deg, #2a1e0a 0%, #1a1208 100%);
}

/* ── 一覧テーブル ─────────────────────── */
.table-wrap {
  flex: 1;
  width: min(920px, 100%);
  overflow-y: auto;
  border: 1px solid #4a3218;
  background: rgba(26, 18, 8, 0.92);
  user-select: text;
}
.words-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.words-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 10px 12px;
  background: #241a0c;
  border-bottom: 1px solid #7a5c28;
  color: #bda265;
  font-family: 'Cinzel', 'Noto Serif JP', serif;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-align: left;
}
.words-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(90, 60, 20, 0.4);
  color: #ece2bc;
  vertical-align: middle;
}
.words-table tbody tr:hover td {
  background: rgba(200, 160, 40, 0.06);
}
.col-no {
  width: 3.5rem;
  color: #8f7c4c;
  font-family: var(--font-mono);
  text-align: right;
}
.col-diff {
  width: 7rem;
  text-align: center;
}
.col-category {
  width: 7rem;
  text-align: center;
}
.cell-hiragana {
  color: #b7a878;
}
.cell-romaji {
  font-family: var(--font-mono);
  color: #a9c8d8;
  letter-spacing: 0.04em;
  word-break: break-all;
}
.empty {
  padding: 2rem 0 !important;
  color: #8f7c4c;
  text-align: center;
}

.diff-badge {
  display: inline-block;
  min-width: 5.2rem;
  padding: 3px 8px;
  border: 1px solid currentColor;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-align: center;
}
.diff-1 { color: #5cbc80; }
.diff-2 { color: #d4ac34; }
.diff-3 { color: #e05a48; }

.category-badge {
  display: inline-block;
  min-width: 5.2rem;
  padding: 3px 8px;
  background: rgba(122, 92, 40, 0.18);
  border: 1px solid rgba(122, 92, 40, 0.7);
  color: #c4b48a;
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-align: center;
}

/* ── 戻るボタン ───────────────────────── */
.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 28px;
  background: linear-gradient(145deg, #2a1e0a 0%, #1a1208 100%);
  border: 1px solid #7a5c28;
  color: #c8a63c;
  font-family: 'Cinzel', 'Noto Serif JP', serif;
  font-size: 0.9rem;
  letter-spacing: 0.16em;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, box-shadow 0.2s;
}
.back-btn:hover {
  border-color: #c8a028;
  color: #fff8d8;
  box-shadow: 0 0 24px rgba(200,160,40,0.25);
}
</style>