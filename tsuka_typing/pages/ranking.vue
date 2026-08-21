<template>
  <div class="ranking-screen">
    <!-- ヘッダー -->
    <header class="ranking-header">
      <div class="crest" aria-hidden="true">
        <span class="crest-line" /><span class="crest-icon">👑</span><span class="crest-line" />
      </div>
      <h1 class="ranking-title">{{ t('ranking.title') }}</h1>
      <p class="ranking-sub">{{ t('ranking.subtitle', { limit: RANKING_LIMIT }) }}</p>
    </header>

    <!-- 難易度・モード切り替え -->
    <section class="filters">
      <div class="filter-group" role="group" :aria-label="t('ranking.difficultyLabel')">
        <button
          v-for="d in DIFFICULTIES"
          :key="d"
          :class="['filter-btn', { active: selectedDiff === d }]"
          @click="selectedDiff = d"
        >
          {{ t(`difficulty.${d}.label`) }}
        </button>
      </div>
      <div class="filter-group" role="group" :aria-label="t('ranking.modeLabel')">
        <button
          v-for="m in MODES"
          :key="m.value"
          :class="['filter-btn', 'mode', { active: selectedMode === m.value }]"
          @click="selectedMode = m.value"
        >
          {{ t(`ranking.modes.${m.key}`) }}
        </button>
      </div>
      <button class="reload-btn" :disabled="status === 'pending'" @click="reload">
        <span aria-hidden="true">⟳</span>
        {{ t('ranking.reload') }}
      </button>
    </section>

    <!-- 一覧 -->
    <div class="table-wrap">
      <table class="ranking-table">
        <thead>
          <tr>
            <th scope="col" class="col-rank">{{ t('ranking.header.rank') }}</th>
            <th scope="col">{{ t('ranking.header.player') }}</th>
            <th scope="col" class="col-num">{{ t('ranking.header.score') }}</th>
            <th scope="col" class="col-num">{{ t('ranking.header.kps') }}</th>
            <th scope="col" class="col-num">{{ t('ranking.header.accuracy') }}</th>
            <th scope="col" class="col-date">{{ t('ranking.header.playedAt') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in entries" :key="`${e.rank}-${e.playedAt}`" :class="rankClass(e.rank)">
            <td class="col-rank">
              <span class="rank-medal" aria-hidden="true">{{ medal(e.rank) }}</span>
              <span class="rank-num">{{ e.rank }}</span>
            </td>
            <td class="cell-player">{{ e.playerName }}</td>
            <td class="col-num cell-score">{{ e.score.toLocaleString() }}</td>
            <td class="col-num cell-kps">{{ e.kps.toFixed(1) }}</td>
            <td class="col-num cell-accuracy">{{ Math.round(e.accuracy) }}<span class="unit">%</span></td>
            <td class="col-date cell-date">{{ formatDate(e.playedAt) }}</td>
          </tr>
          <tr v-if="status === 'pending' && entries.length === 0">
            <td class="placeholder" colspan="6">{{ t('ranking.loading') }}</td>
          </tr>
          <tr v-else-if="status === 'error'">
            <td class="placeholder error" colspan="6">{{ t('ranking.error') }}</td>
          </tr>
          <tr v-else-if="status === 'loaded' && entries.length === 0">
            <td class="placeholder" colspan="6">{{ t('ranking.empty') }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 戻る -->
    <NuxtLink to="/" class="back-btn">
      <span aria-hidden="true">←</span>
      {{ t('ranking.backButton') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Difficulty } from '~/utils/wordShuffle'
import type { GameMode } from '~/stores/game'

definePageMeta({ ssr: false })

const { t } = useI18n()
const route = useRoute()

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']
const MODES: { value: GameMode; key: string }[] = [
  { value: 'normal', key: 'normal' },
  { value: 'ra-na',  key: 'raNa'   },
]

/**
 * 初期表示する難易度・モードは URL クエリで指定できる
 * （リザルト画面から「今プレイした難易度＋モード」のランキングへ直接飛ぶために使う）。
 */
function queryValue<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  const raw = route.query[name]
  const value = Array.isArray(raw) ? raw[0] : raw
  return allowed.includes(value as T) ? (value as T) : fallback
}

const selectedDiff = ref<Difficulty>(queryValue('difficulty', DIFFICULTIES, 'normal'))
const selectedMode = ref<GameMode>(queryValue('gameMode', MODES.map(m => m.value), 'normal'))

const { entries, status, load } = useRanking()

watch([selectedDiff, selectedMode], ([d, m]) => load(d, m), { immediate: true })

function reload() {
  load(selectedDiff.value, selectedMode.value, true)
}

function medal(rank: number) {
  return rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : ''
}
function rankClass(rank: number) {
  return rank <= 3 ? `top-${rank}` : ''
}

/** ISO8601 の playedAt を「YYYY/MM/DD HH:mm」形式（ローカル時刻）で表示する */
function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
</script>

<style scoped>
.ranking-screen {
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
.ranking-header {
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
.ranking-title {
  font-family: 'Cinzel', 'Noto Serif JP', serif;
  font-size: 1.5rem;
  letter-spacing: 0.16em;
  color: #e8c85a;
  text-shadow: 0 0 18px rgba(200,160,40,0.35);
}
.ranking-sub {
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
.filter-group {
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
.filter-btn.mode.active {
  border-color: #8b5cf6;
  color: #c4b5fd;
  background: linear-gradient(145deg, #1e1230 0%, #150e20 100%);
}
.reload-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #1a1208;
  border: 1px solid #4a3218;
  color: #b3a173;
  font-family: 'Noto Serif JP', serif;
  font-size: 0.84rem;
  letter-spacing: 0.06em;
  transition: border-color 0.2s, color 0.2s;
}
.reload-btn:hover:not(:disabled) {
  border-color: #c8a028;
  color: #e8c85a;
}
.reload-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* ── 一覧テーブル ─────────────────────── */
.table-wrap {
  flex: 1;
  width: min(860px, 100%);
  overflow-y: auto;
  border: 1px solid #4a3218;
  background: rgba(26, 18, 8, 0.92);
  user-select: text;
}
.ranking-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.ranking-table thead th {
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
.ranking-table thead th.col-num,
.ranking-table thead th.col-rank { text-align: right; }
.ranking-table thead th.col-date { text-align: center; }
.ranking-table tbody td {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(90, 60, 20, 0.4);
  color: #ece2bc;
  vertical-align: middle;
}
.ranking-table tbody tr:hover td {
  background: rgba(200, 160, 40, 0.06);
}

.col-rank {
  width: 5.5rem;
  text-align: right;
  white-space: nowrap;
}
.rank-medal { margin-right: 4px; }
.rank-num {
  font-family: var(--font-mono);
  color: #8f7c4c;
}
.col-num {
  width: 6rem;
  text-align: right;
  font-family: var(--font-mono);
}
.col-date {
  width: 10rem;
  text-align: center;
}
.cell-player {
  font-family: 'Noto Serif JP', serif;
  letter-spacing: 0.04em;
  word-break: break-all;
}
.cell-score { color: #f2d472; }
.cell-kps { color: #a9c8d8; }
.cell-accuracy { color: #b7a878; }
.cell-date {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: #8f7c4c;
}
.unit {
  font-size: 0.76rem;
  color: #8f7c4c;
  margin-left: 1px;
}

/* ── 上位3位の強調 ─────────────────────── */
.top-1 td { background: rgba(200, 160, 40, 0.10); }
.top-2 td { background: rgba(200, 200, 210, 0.055); }
.top-3 td { background: rgba(190, 120, 60, 0.06); }
.top-1 .rank-num, .top-2 .rank-num, .top-3 .rank-num { font-weight: 700; }
.top-1 .rank-num, .top-1 .cell-player { color: #f2d472; }
.top-2 .rank-num, .top-2 .cell-player { color: #dfe2e8; }
.top-3 .rank-num, .top-3 .cell-player { color: #e0b48a; }
.top-1 .cell-player { font-weight: 700; }
.top-1 .cell-score { text-shadow: 0 0 12px rgba(200,160,40,0.45); }

.placeholder {
  padding: 2rem 0 !important;
  color: #8f7c4c;
  text-align: center;
}
.placeholder.error { color: #e05a48; }

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
