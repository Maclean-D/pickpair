"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card as CardType } from './types'
import { useMemo, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Download, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"

type ResultsTabProps = {
  cards: CardType[]
  individualPicks: Record<string, string[]>
  eloHistory: Record<string, Record<string, number[]>>
  resetResults: () => void
  // Add these new props
  deleteUser: (userName: string) => void
  updateEloHistory: (newEloHistory: Record<string, Record<string, number[]>>) => void
  updateIndividualPicks: (newIndividualPicks: Record<string, string[]>) => void
}

export function ResultsTab({ 
  cards, 
  individualPicks, 
  eloHistory, 
  resetResults, 
  deleteUser, 
  updateEloHistory,
  updateIndividualPicks
}: ResultsTabProps) {
  const [selectedUser, setSelectedUser] = useState<string>("average");
  const [newUserName, setNewUserName] = useState<string>("");

  const initialElo = useMemo(() => {
    return Math.max(400, Math.round(1000 / Math.sqrt(cards.length || 1)));
  }, [cards.length]);

  const calculateAverageElo = (cardId: string) => {
    const userElos = Object.values(eloHistory[cardId]);
    if (userElos.length === 0) return initialElo; // Use initialElo instead of hardcoded 400
    const sum = userElos.reduce((acc, elos) => acc + (elos.at(-1) ?? initialElo), 0);
    return sum / userElos.length;
  };

  const calculateElo = (cardId: string, user: string) => {
    if (user === "average") {
      return calculateAverageElo(cardId);
    }
    const userElos = eloHistory[cardId][user];
    return userElos?.at(-1) ?? initialElo;
  };

  const getHighestEloItem = (userName: string): string => {
    let highestElo = -Infinity;
    let highestEloItem = "No pick";

    Object.entries(eloHistory).forEach(([cardId, userElos]) => {
      const userElo = userElos[userName]?.at(-1) ?? initialElo;
      if (userElo > highestElo) {
        highestElo = userElo;
        highestEloItem = cards.find(card => card.id === cardId)?.title ?? "Unknown";
      }
    });

    return highestEloItem;
  };

  const sortedCards = [...cards].sort((a, b) => calculateElo(b.id, selectedUser) - calculateElo(a.id, selectedUser));

  const chartData = sortedCards.map(card => ({
    title: card.title,
    elo: Math.round(calculateElo(card.id, selectedUser))
  }));

  const chartConfig = {
    elo: {
      label: "Average Elo Rating",
      color: "hsl(var(--primary))",
    },
    label: {
      color: "hsl(var(--background))",
    },
  }

  const userOptions = ["average", ...Object.keys(individualPicks)];

  const handleDeleteUser = (userName: string) => {
    if (window.confirm(`Are you sure you want to delete ${userName}'s data?`)) {
      deleteUser(userName);
      if (selectedUser === userName) {
        setSelectedUser("average");
      }
    }
  };

  const handleExportUser = (userName: string) => {
    const userEloData = Object.fromEntries(
      Object.entries(eloHistory).map(([cardId, userElos]) => [cardId, userElos[userName] || []])
    );
    const blob = new Blob([JSON.stringify(userEloData)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName}_elo_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportUser = (userName: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target?.result as string);
            const newEloHistory = { ...eloHistory };
            Object.entries(importedData).forEach(([cardId, eloArray]) => {
              if (!newEloHistory[cardId]) {
                newEloHistory[cardId] = {};
              }
              newEloHistory[cardId][userName] = eloArray as number[];
            });
            updateEloHistory(newEloHistory);

            // Update individualPicks for the new user
            const newIndividualPicks = { ...individualPicks, [userName]: [] };
            updateIndividualPicks(newIndividualPicks);

            setSelectedUser(userName);
            setNewUserName("");
          } catch (error) {
            console.error('Error importing data:', error);
            alert('Error importing data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Elo Ratings</CardTitle>
            <CardDescription>
              {selectedUser === "average" 
                ? "Average Elo rating for each option across all users" 
                : `Elo ratings for ${selectedUser}`}
            </CardDescription>
          </div>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {userOptions.map(user => (
                <SelectItem key={user} value={user}>
                  {user === "average" ? "Average of all users" : user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                right: 16,
                left: 16,
                bottom: 16,
              }}
              width={600}
              height={400}
            >
              <CartesianGrid horizontal={false} />
              <YAxis
                dataKey="title"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={120}
              />
              <XAxis type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="line" />}
              />
              <Bar
                dataKey="elo"
                fill="var(--primary)"
                radius={4}
              >
                <LabelList
                  dataKey="elo"
                  position="right"
                  offset={8}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual Highest Rated Picks</CardTitle>
          <CardDescription>Each user's highest rated item based on Elo</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {Object.keys(individualPicks).map((name) => (
              <li key={name} className="flex justify-between items-center">
                <span className="font-medium">{name}</span>
                <span>{getHighestEloItem(name)}</span>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleExportUser(name)}
                    title="Export user data"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteUser(name)}
                    title="Delete user"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import New User Data</CardTitle>
          <CardDescription>Import Elo ratings for a new user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="New user name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
            />
            <Button
              onClick={() => {
                if (newUserName.trim()) {
                  handleImportUser(newUserName.trim());
                } else {
                  alert("Please enter a valid user name");
                }
              }}
            >
              Import User Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reset Results</CardTitle>
          <CardDescription>Clear all rankings, users, and Elo ratings while keeping the cards</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={resetResults}
          >
            Reset All Results
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}