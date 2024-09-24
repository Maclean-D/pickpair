"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card as CardType } from './types'

type PairTabProps = {
  cards: CardType[]
  updateOverallWins: (id: string) => void
  setActiveTab: (tab: string) => void
  addIndividualPick: (name: string, cardTitle: string) => void
}

export function PairTab({ cards, updateOverallWins, setActiveTab, addIndividualPick }: PairTabProps) {
  const [name, setName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [pairIndex, setPairIndex] = useState(0)
  const [winner, setWinner] = useState<CardType | null>(null)
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([])
  const [isPortrait, setIsPortrait] = useState(false)

  useEffect(() => {
    setShuffledCards([...cards].sort(() => Math.random() - 0.5))
    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth)
    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    return () => window.removeEventListener('resize', checkOrientation)
  }, [cards])

  const handleChoice = (chosenCard: CardType) => {
    if (pairIndex + 2 >= shuffledCards.length) {
      setWinner(chosenCard)
      updateOverallWins(chosenCard.id)
      addIndividualPick(name, chosenCard.title || 'Untitled')
      setActiveTab("results")
    } else {
      setPairIndex(pairIndex + 1)
      addIndividualPick(name, chosenCard.title || 'Untitled')
    }
  }

  const resetPairing = () => {
    setPairIndex(0)
    setWinner(null)
    setShuffledCards([...cards].sort(() => Math.random() - 0.5))
  }

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      setNameSubmitted(true)
    }
  }

  if (!nameSubmitted) {
    return (
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">Enter Your Name</h2>
        <Input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">Start</Button>
      </form>
    )
  }

  if (winner) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">We have a winner! 🥳</h2>
        <Card>
          <CardContent className="flex items-center space-x-4 p-4">
            {winner.image && <img src={winner.image} alt={winner.title} className="w-24 h-24 object-cover rounded" />}
            <div>
              {winner.title && <CardTitle>{winner.title}</CardTitle>}
              {winner.description && <p>{winner.description}</p>}
            </div>
          </CardContent>
        </Card>
        <Button onClick={resetPairing}>Pick Again</Button>
      </div>
    )
  }

  const card1 = shuffledCards[pairIndex]
  const card2 = shuffledCards[pairIndex + 1]

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Pick Your Preference</h2>
      <div className={`grid ${isPortrait ? 'grid-rows-2 gap-4' : 'grid-cols-2 gap-8'}`}>
        {[card1, card2].map((card) => (
          <Card key={card.id} className="cursor-pointer overflow-hidden" onClick={() => handleChoice(card)}>
            {card.image && (
              <div className="w-full aspect-video">
                <img src={card.image} alt={card.title} className="w-full h-full object-contain" />
              </div>
            )}
            <CardContent className="p-4">
              <div>
                {card.title && <CardTitle className="mb-2">{card.title}</CardTitle>}
                {card.description && <p>{card.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}