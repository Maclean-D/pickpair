"use client"

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card as CardType } from './types'
import { Play } from "lucide-react"

type PairTabProps = {
  cards: CardType[]
  updateElo: (winnerId: string, loserId: string) => void
  setActiveTab: (tab: string) => void
  addIndividualPick: (name: string, cardTitle: string) => void
  setCurrentUser: (name: string) => void
}

export function PairTab({ cards, updateElo, setActiveTab, addIndividualPick, setCurrentUser }: PairTabProps) {
  const [name, setName] = useState('')
  const [nameSubmitted, setNameSubmitted] = useState(false)
  const [comparisons, setComparisons] = useState<[CardType, CardType][]>([])
  const [comparisonIndex, setComparisonIndex] = useState(0)
  const [currentPair, setCurrentPair] = useState<[CardType, CardType] | null>(null)
  const [isPortrait, setIsPortrait] = useState(false)

  const filteredCards = useMemo(() => {
    return cards.filter(card => card.title.toLowerCase() !== name.toLowerCase());
  }, [cards, name]);

  // Calculate the number of comparisons based on the number of cards
  const calculateComparisons = (cardCount: number) => {
    return cardCount * 3; // 3 times the number of cards
  };

  useEffect(() => {
    if (!nameSubmitted) return;

    const totalComparisons = calculateComparisons(filteredCards.length);
    const allPairs: [CardType, CardType][] = [];
    
    for (let i = 0; i < filteredCards.length; i++) {
      for (let j = i + 1; j < filteredCards.length; j++) {
        allPairs.push([filteredCards[i], filteredCards[j]]);
      }
    }

    // Repeat and shuffle to get desired number of comparisons
    const repeatedPairs = Array(Math.ceil(totalComparisons / allPairs.length))
      .fill(allPairs)
      .flat()
      .slice(0, totalComparisons);

    setComparisons(shuffleArray(repeatedPairs));
    setComparisonIndex(0);

    const checkOrientation = () => setIsPortrait(window.innerHeight > window.innerWidth);
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, [filteredCards, nameSubmitted]);

  useEffect(() => {
    if (comparisons.length > 0) {
      // Fix the type mismatch by explicitly creating a tuple
      const shuffledPair = shuffleArray([...comparisons[comparisonIndex]]);
      setCurrentPair([shuffledPair[0], shuffledPair[1]]);
    }
  }, [comparisonIndex, comparisons]);

  const handleChoice = (chosenCard: CardType) => {
    if (!currentPair) return;
    const [card1, card2] = currentPair;
    const otherCard = chosenCard.id === card1.id ? card2 : card1;

    addIndividualPick(name, chosenCard.title || 'Untitled');
    updateElo(chosenCard.id, otherCard.id);
    
    if (comparisonIndex + 1 >= comparisons.length) {
      setActiveTab("results");
    } else {
      setComparisonIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      setNameSubmitted(true);
      setCurrentUser(name.trim());
    }
  };

  if (!nameSubmitted) {
    return (
      <form onSubmit={handleNameSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold">Enter Your Name</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This helps prevent voting for yourself and allows for personalized results.
        </p>
        <div className="flex space-x-2">
          <Input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Play className="h-4 w-4 mr-2" />
            Start
          </Button>
        </div>
      </form>
    );
  }

  if (!currentPair) return null;

  const [card1, card2] = currentPair;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]"> {/* Adjust for approximate header height */}
      <h2 className="text-2xl font-bold mb-4">Pick Your Preference ({comparisonIndex + 1}/{comparisons.length})</h2>
      <div className={`flex-grow flex ${isPortrait ? 'flex-col' : 'flex-row'} gap-4 overflow-hidden`}>
        {[card1, card2].map((card) => (
          <Card 
            key={card.id} 
            className="cursor-pointer overflow-hidden flex-1 flex flex-col" 
            onClick={() => handleChoice(card)}
          >
            {card.image && (
              <div className="flex-grow relative">
                <img 
                  src={card.image} 
                  alt={card.title} 
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            )}
            <CardContent className="p-4 flex-shrink-0">
              <div className="overflow-y-auto max-h-32"> {/* Allow scrolling for long content */}
                {card.title && <CardTitle className="mb-2 text-xl">{card.title}</CardTitle>}
                {card.description && <p className="text-base">{card.description}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}