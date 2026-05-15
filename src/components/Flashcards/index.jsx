import { useState } from 'react'
import { DECKS } from '../../data/flashcards'

export default function Flashcards() {
  const [deckIdx,    setDeckIdx]    = useState(0)
  const [cardIdx,    setCardIdx]    = useState(0)
  const [correct,    setCorrect]    = useState(0)
  const [incorrect,  setIncorrect]  = useState(0)
  const [flipped,    setFlipped]    = useState(false)
  const [done,       setDone]       = useState(false)
  const [graded,     setGraded]     = useState(false)

  const deck  = DECKS[deckIdx]
  const total = deck.cards.length
  const current = done ? total : cardIdx

  function reset() {
    setCardIdx(0); setCorrect(0); setIncorrect(0)
    setFlipped(false); setDone(false); setGraded(false)
  }

  function changeDeck(e) { setDeckIdx(parseInt(e.target.value)); reset() }

  function flip() {
    if (done || graded) return
    setFlipped(v => !v)
  }

  function grade(isCorrect) {
    if (graded) return
    setGraded(true)
    if (isCorrect) setCorrect(c => c + 1)
    else setIncorrect(c => c + 1)

    if (cardIdx + 1 >= total) {
      setTimeout(() => setDone(true), 300)
    } else {
      setTimeout(() => { setCardIdx(i => i + 1); setFlipped(false); setGraded(false) }, 200)
    }
  }

  const card = deck.cards[cardIdx]
  const pct  = done ? Math.round(correct / total * 100) : 0

  return (
    <section>
      <div className="sec-head">
        <span className="sec-title">Flashcards</span>
        <span className="sec-count">{total} cards</span>
      </div>

      <div className="fc-deck-bar">
        <div style={{ flex: 1 }}>
          <label className="field-label">Deck</label>
          <select className="field" style={{ resize: 'none' }} value={deckIdx} onChange={changeDeck}>
            {DECKS.map((d, i) => <option key={d.name} value={i}>{d.name}</option>)}
          </select>
        </div>
        <button className="btn btn-sm" onClick={reset} style={{ marginTop: 18 }}>↺ Restart</button>
      </div>

      <div className="fc-progress mt8">
        <div className="fc-progress-label">{current} / {total}</div>
        <div className="progress-bar-wrap">
          <div className="progress-bar-fill" style={{ width: `${total ? current / total * 100 : 0}%` }} />
        </div>
      </div>

      <div className="fc-arena">
        {done
          ? <div className="fc-score">
              <div className={`fc-score-pct ${pct >= 70 ? 'good' : 'needs'}`}>{pct}%</div>
              <div className="fc-score-tally">
                <strong>{correct}</strong> correct &nbsp;·&nbsp;
                <strong>{incorrect}</strong> missed &nbsp;·&nbsp;
                <strong>{total}</strong> total
              </div>
              {incorrect > 0 && (
                <div className="fc-score-prompt">
                  You missed {incorrect} card{incorrect > 1 ? 's' : ''}. Consider adding those to your Answer Bank for extra practice.
                </div>
              )}
              <div className="fc-score-btns">
                <button className="btn btn-solid" onClick={reset}>Study Again →</button>
              </div>
            </div>
          : <>
              <div className="fc-card-wrap" onClick={flip}>
                <div className={`fc-card-inner${flipped ? ' flipped' : ''}`}>
                  <div className="fc-card-face front">
                    <div className="fc-eyebrow">Question — {deck.name}</div>
                    <div className="fc-question">{card.question}</div>
                    <div className="fc-hint">click to reveal answer</div>
                  </div>
                  <div className="fc-card-face back">
                    <div className="fc-eyebrow">Answer</div>
                    <div className="fc-answer">{card.answer}</div>
                  </div>
                </div>
              </div>
              {flipped && (
                <div className="fc-grade-btns">
                  <button className="btn btn-wrong" onClick={() => grade(false)}>✕ Missed it</button>
                  <button className="btn btn-right" onClick={() => grade(true)}>✓ Got it</button>
                </div>
              )}
            </>
        }
      </div>
    </section>
  )
}
