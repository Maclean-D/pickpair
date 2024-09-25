"use client"

import { useState, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { PickTab } from './PickTab'
import { PairTab } from './PairTab'
import { ResultsTab } from './ResultsTab'
import { Card } from './types'

const K_FACTOR = 32;

export default function PickPair() {
  const [cards, setCards] = useState<Card[]>([])
  const [activeTab, setActiveTab] = useState("pick")
  const [individualPicks, setIndividualPicks] = useState<Record<string, string[]>>({})
  const [eloHistory, setEloHistory] = useState<Record<string, Record<string, number[]>>>({})
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const initialElo = useMemo(() => {
    // This formula provides a higher initial Elo for fewer cards
    // and a lower initial Elo for more cards
    return Math.max(400, Math.round(1000 / Math.sqrt(cards.length || 1)));
  }, [cards.length]);

  useEffect(() => {
    setEloHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      cards.forEach(card => {
        if (!newHistory[card.id]) {
          newHistory[card.id] = {};
        }
      });
      return newHistory;
    });
  }, [cards]);

  const addCard = (card: Omit<Card, 'id' | 'elo'>) => {
    const newCard = { ...card, id: Date.now().toString(), elo: initialElo };
    setCards(prevCards => [...prevCards, newCard]);
    setEloHistory(prevHistory => ({
      ...prevHistory,
      [newCard.id]: {}
    }));
  }

  const updateCard = (id: string, field: keyof Card, value: string) => {
    setCards(cards.map(card => (card.id === id ? { ...card, [field]: value } : card)))
  }

  const removeCard = (id: string) => {
    setCards(cards.filter(card => card.id !== id))
    setEloHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      delete newHistory[id];
      return newHistory;
    });
  }

  const updateElo = (winnerId: string, loserId: string) => {
    if (!currentUser) return;

    setEloHistory(prevHistory => {
      const newHistory = { ...prevHistory };
      const winnerElo = newHistory[winnerId][currentUser]?.at(-1) ?? initialElo;
      const loserElo = newHistory[loserId][currentUser]?.at(-1) ?? initialElo;

      const expectedScoreWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
      const expectedScoreLoser = 1 - expectedScoreWinner;

      const newWinnerElo = winnerElo + K_FACTOR * (1 - expectedScoreWinner);
      const newLoserElo = loserElo + K_FACTOR * (0 - expectedScoreLoser);

      if (!newHistory[winnerId][currentUser]) newHistory[winnerId][currentUser] = [];
      if (!newHistory[loserId][currentUser]) newHistory[loserId][currentUser] = [];

      newHistory[winnerId][currentUser].push(newWinnerElo);
      newHistory[loserId][currentUser].push(newLoserElo);

      return newHistory;
    });
  }

  const addIndividualPick = (name: string, cardTitle: string) => {
    setIndividualPicks(prev => ({
      ...prev,
      [name]: [...(prev[name] || []), cardTitle]
    }))
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
      {activeTab === "pair" && <PairTab cards={cards} updateElo={updateElo} setActiveTab={setActiveTab} addIndividualPick={addIndividualPick} setCurrentUser={setCurrentUser} />}
      {activeTab === "results" && <ResultsTab cards={cards} individualPicks={individualPicks} eloHistory={eloHistory} />}
    </div>
  )
}