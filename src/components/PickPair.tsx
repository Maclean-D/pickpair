"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { PickTab } from './PickTab'
import { PairTab } from './PairTab'
import { ResultsTab } from './ResultsTab'
import { Card } from './types'

export default function PickPair() {
  const [cards, setCards] = useState<Card[]>([])
  const [activeTab, setActiveTab] = useState("pick")
  const [overallWins, setOverallWins] = useState<Record<string, number>>({})

  const addCard = (card: Omit<Card, 'id'>) => {
    setCards([...cards, { ...card, id: Date.now().toString() }])
  }

  const updateCard = (id: string, field: keyof Card, value: string) => {
    setCards(cards.map(card => (card.id === id ? { ...card, [field]: value } : card)))
  }

  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
  }

  const updateOverallWins = (id: string) => {
    setOverallWins(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex space-x-2 mb-4">
        {["pick", "pair", "results"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            className="flex-1 text-lg py-6"
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>
      {activeTab === "pick" && <PickTab cards={cards} addCard={addCard} updateCard={updateCard} removeCard={removeCard} />}
      {activeTab === "pair" && <PairTab cards={cards} updateOverallWins={updateOverallWins} setActiveTab={setActiveTab} />}
      {activeTab === "results" && <ResultsTab cards={cards} overallWins={overallWins} />}
    </div>
  )
}