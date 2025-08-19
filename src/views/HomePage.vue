<template>
  <main class="ttt">
    <div class="panel">
      <h1>Tic Tac Toe</h1>

      <div class="controls">
        <label class="toggle">
          <input type="checkbox" v-model="vsBot" />
          <span>Bilgisayara karşı</span>
        </label>

        <button class="btn" @click="reset">Sıfırla</button>
      </div>

      <div class="status" :class="{ win: !!winner, draw: isDraw }">
        <span v-if="winner">Kazanan: {{ winner }}</span>
        <span v-else-if="isDraw">Berabere!</span>
        <span v-else>Sıradaki: {{ currentPlayer }}</span>
      </div>
    </div>

    <div class="board" role="grid" aria-label="Tic Tac Toe">
      <button
        v-for="(cell, i) in board"
        :key="i"
        class="cell"
        role="gridcell"
        :aria-label="'Hücre ' + (i + 1)"
        :disabled="isCellDisabled(i)"
        @click="handleClick(i)"
      >
        {{ cell }}
      </button>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// --- Oyun durumu ---
const board = ref(Array(9).fill('')) // 3x3 tahta ('' | 'X' | 'O')
const xIsNext = ref(true)
const winner = ref('') // 'X' | 'O' | ''
const isDraw = ref(false)
const vsBot = ref(false) // Bilgisayara karşı oyna (O bot)

const humanMark = 'X'
const botMark = 'O'

const currentPlayer = computed(() => (xIsNext.value ? 'X' : 'O'))

// --- Yardımcılar ---
const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
]

function calculateWinner(b) {
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a]
  }
  return ''
}

function evaluateBoard() {
  const w = calculateWinner(board.value)
  winner.value = w
  isDraw.value = !w && board.value.every((c) => c !== '')
}

function emptyIndices(b) {
  const out = []
  for (let i = 0; i < b.length; i++) if (!b[i]) out.push(i)
  return out
}

function isCellDisabled(i) {
  return (
    !!board.value[i] || !!winner.value || (vsBot.value && currentPlayer.value === botMark) // Bot sırasındayken kullanıcı tıklamasın
  )
}

// --- Hamleler ---
function handleClick(i) {
  if (board.value[i] || winner.value) return
  board.value[i] = currentPlayer.value
  evaluateBoard()
  if (!winner.value && !isDraw.value) {
    xIsNext.value = !xIsNext.value
  }
}

// Basit akıllı bot: kazan > blokla > merkez > köşe > kenar
function makeAIMove() {
  if (!vsBot.value || winner.value || isDraw.value || currentPlayer.value !== botMark) return

  const b = board.value.slice()
  const empties = emptyIndices(b)

  if (empties.length === 0) return

  // 1) Kazanacak hamleyi bul
  for (const i of empties) {
    b[i] = botMark
    if (calculateWinner(b) === botMark) return commitBotMove(i)
    b[i] = ''
  }

  // 2) Oyuncunun kazanmasını engelle
  for (const i of empties) {
    b[i] = humanMark
    if (calculateWinner(b) === humanMark) return commitBotMove(i)
    b[i] = ''
  }

  // 3) Merkez
  if (b[4] === '') return commitBotMove(4)

  // 4) Köşeler
  for (const i of [0, 2, 6, 8]) if (b[i] === '') return commitBotMove(i)

  // 5) Kenarlar
  for (const i of [1, 3, 5, 7]) if (b[i] === '') return commitBotMove(i)
}

function commitBotMove(i) {
  board.value[i] = botMark
  evaluateBoard()
  if (!winner.value && !isDraw.value) xIsNext.value = !xIsNext.value
}

function reset() {
  board.value = Array(9).fill('')
  xIsNext.value = true
  winner.value = ''
  isDraw.value = false
}

// Oyuncu hamlesinden sonra bot sırası geldiyse oynasın
watch(
  () => [board.value.join(''), xIsNext.value, vsBot.value],
  () => {
    if (vsBot.value && !winner.value && !isDraw.value && currentPlayer.value === botMark) {
      // Küçük bir gecikme ile daha doğal hissettirelim
      setTimeout(makeAIMove, 200)
    }
  },
)
</script>

<style scoped>
.ttt {
  display: grid;
  gap: 1.25rem;
  justify-items: center;
  padding: 1.5rem 1rem 3rem;
}

.panel {
  display: grid;
  gap: 0.75rem;
  text-align: center;
}

h1 {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
}

.controls {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.toggle {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  user-select: none;
}

.btn {
  border: 1px solid var(--color-border, #e2e8f0);
  padding: 0.5rem 0.9rem;
  border-radius: 0.6rem;
  cursor: pointer;
  background: var(--color-bg-soft, #fff);
}
.btn:hover {
  filter: brightness(0.98);
}

.status {
  min-height: 1.5rem;
  font-weight: 600;
}
.status.win {
  color: #0f9133;
}
.status.draw {
  color: #666;
}

/* Tahta */
.board {
  display: grid;
  grid-template-columns: repeat(3, min(26vw, 110px));
  grid-template-rows: repeat(3, min(26vw, 110px));
  gap: 0.5rem;
}

.cell {
  font:
    700 2rem/1 system-ui,
    -apple-system,
    Segoe UI,
    Roboto,
    'Helvetica Neue',
    Arial,
    'Noto Sans',
    'Apple Color Emoji',
    'Segoe UI Emoji';
  display: grid;
  place-items: center;
  border: 2px solid var(--color-border, #cbd5e1);
  border-radius: 0.8rem;
  background: var(--color-bg, #f8fafc);
  cursor: pointer;
  transition:
    transform 0.06s ease,
    background 0.15s ease;
}
.cell:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #f1f5f9;
}
.cell:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
