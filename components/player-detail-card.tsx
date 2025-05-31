"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { TrendingUp, Calendar, Bookmark, Share2 } from "lucide-react"

interface PlayerDetailCardProps {
  playerName: string
  onClose: () => void
}

export default function PlayerDetailCard({ playerName, onClose }: PlayerDetailCardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data
  const playerStats = {
    points: {
      average: 25.3,
      last5: [28, 22, 31, 26, 24],
      trend: "up",
    },
    rebounds: {
      average: 7.8,
      last5: [8, 6, 9, 7, 10],
      trend: "up",
    },
    assists: {
      average: 6.2,
      last5: [5, 8, 4, 7, 6],
      trend: "neutral",
    },
    minutes: {
      average: 34.5,
      last5: [36, 32, 35, 38, 33],
      trend: "neutral",
    },
  }

  const propHistory = [
    { date: "Nov 12", opponent: "DEN", line: "24.5", actual: 28, result: "Over" },
    { date: "Nov 10", opponent: "PHX", line: "25.5", actual: 22, result: "Under" },
    { date: "Nov 8", opponent: "MIA", line: "26.5", actual: 31, result: "Over" },
    { date: "Nov 6", opponent: "BOS", line: "24.5", actual: 26, result: "Over" },
    { date: "Nov 4", opponent: "GSW", line: "25.5", actual: 24, result: "Under" },
  ]

  const matchupData = {
    team: "DEN",
    vsPosition: "12th",
    paceRank: "18th",
    defRating: "5th",
    lastMatchup: {
      date: "Oct 24",
      points: 22,
      rebounds: 6,
      assists: 5,
      minutes: 32,
    },
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-16 w-16 rounded-full bg-gray-700 overflow-hidden">
          <img
            src={`https://cdn.nba.com/headshots/nba/latest/1040x760/${Math.floor(Math.random() * 1000) + 1000}.png`}
            alt={playerName}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{playerName}</h2>
          <p className="text-gray-400">LAL • SF • #6</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview" onClick={() => setActiveTab("overview")}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="props" onClick={() => setActiveTab("props")}>
            Props
          </TabsTrigger>
          <TabsTrigger value="matchup" onClick={() => setActiveTab("matchup")}>
            Matchup
          </TabsTrigger>
          <TabsTrigger value="news" onClick={() => setActiveTab("news")}>
            News
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Points</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{playerStats.points.average}</div>
                <div className="flex items-center text-xs">
                  {playerStats.points.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-gray-400 mr-1" />
                  )}
                  Last 5
                </div>
              </div>
              <div className="flex mt-2 gap-1">
                {playerStats.points.last5.map((val, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 bg-gray-700 rounded-sm flex items-end overflow-hidden"
                    title={`${val} points`}
                  >
                    <div
                      className="bg-blue-500 w-full"
                      style={{ height: `${(val / Math.max(...playerStats.points.last5)) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Rebounds</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{playerStats.rebounds.average}</div>
                <div className="flex items-center text-xs">
                  {playerStats.rebounds.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingUp className="w-3 h-3 text-gray-400 mr-1" />
                  )}
                  Last 5
                </div>
              </div>
              <div className="flex mt-2 gap-1">
                {playerStats.rebounds.last5.map((val, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 bg-gray-700 rounded-sm flex items-end overflow-hidden"
                    title={`${val} rebounds`}
                  >
                    <div
                      className="bg-purple-500 w-full"
                      style={{ height: `${(val / Math.max(...playerStats.rebounds.last5)) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Assists</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{playerStats.assists.average}</div>
                <div className="flex items-center text-xs">
                  <TrendingUp className="w-3 h-3 text-gray-400 mr-1" />
                  Last 5
                </div>
              </div>
              <div className="flex mt-2 gap-1">
                {playerStats.assists.last5.map((val, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 bg-gray-700 rounded-sm flex items-end overflow-hidden"
                    title={`${val} assists`}
                  >
                    <div
                      className="bg-green-500 w-full"
                      style={{ height: `${(val / Math.max(...playerStats.assists.last5)) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Minutes</div>
              <div className="flex justify-between items-center">
                <div className="text-2xl font-bold">{playerStats.minutes.average}</div>
                <div className="flex items-center text-xs">
                  <TrendingUp className="w-3 h-3 text-gray-400 mr-1" />
                  Last 5
                </div>
              </div>
              <div className="flex mt-2 gap-1">
                {playerStats.minutes.last5.map((val, i) => (
                  <div
                    key={i}
                    className="h-8 flex-1 bg-gray-700 rounded-sm flex items-end overflow-hidden"
                    title={`${val} minutes`}
                  >
                    <div
                      className="bg-orange-500 w-full"
                      style={{ height: `${(val / Math.max(...playerStats.minutes.last5)) * 100}%` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Tonight's Projection</h3>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-400">Points</div>
                <div className="font-bold">26.5</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Rebounds</div>
                <div className="font-bold">7.5</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Assists</div>
                <div className="font-bold">6.5</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">PRA</div>
                <div className="font-bold">39.5</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">AI Analysis</h3>
            <p className="text-sm">
              {playerName} has been on an upward trend in scoring, exceeding his points prop in 3 of his last 5 games.
              Tonight's matchup against Denver presents a favorable opportunity as they've struggled defending his
              position recently. His minutes have been consistent, and his usage rate has increased to 29.8% over the
              last 3 games. The projected game pace and close spread suggest a competitive game with full minutes.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="props" className="flex-1 space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Available Props</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <div className="font-medium">Points</div>
                  <div className="text-sm text-gray-300">Over/Under 25.5</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-110</div>
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-110</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <div className="font-medium">Rebounds</div>
                  <div className="text-sm text-gray-300">Over/Under 7.5</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-115</div>
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-105</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <div className="font-medium">Assists</div>
                  <div className="text-sm text-gray-300">Over/Under 6.5</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">+100</div>
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-120</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700 rounded">
                <div>
                  <div className="font-medium">PRA</div>
                  <div className="text-sm text-gray-300">Over/Under 39.5</div>
                </div>
                <div className="flex gap-2">
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-110</div>
                  <div className="text-xs px-2 py-1 bg-gray-600 rounded">-110</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Prop History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-700">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Opp</th>
                    <th className="text-left py-2">Line</th>
                    <th className="text-left py-2">Actual</th>
                    <th className="text-left py-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {propHistory.map((game, i) => (
                    <tr key={i} className="border-b border-gray-700">
                      <td className="py-2">{game.date}</td>
                      <td className="py-2">{game.opponent}</td>
                      <td className="py-2">{game.line}</td>
                      <td className="py-2">{game.actual}</td>
                      <td
                        className={`py-2 ${
                          game.result === "Over" ? "text-green-500" : game.result === "Under" ? "text-red-500" : ""
                        }`}
                      >
                        {game.result}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Prop Trends</h3>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-green-500">•</span> Hit the Over on Points in 3 of last 5 games
              </div>
              <div className="text-sm">
                <span className="text-green-500">•</span> Averaging 2.5 points above the line in last 10 games
              </div>
              <div className="text-sm">
                <span className="text-green-500">•</span> Hit the Over on Rebounds in 3 of last 5 games
              </div>
              <div className="text-sm">
                <span className="text-red-500">•</span> Hit the Under on Assists in 3 of last 5 games
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="matchup" className="flex-1 space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Tonight's Matchup</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src="/lakers-logo.png"
                    alt="LAL"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                    }}
                  />
                </div>
                <div className="text-lg font-bold">LAL</div>
              </div>
              <div className="text-sm">vs</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold">{matchupData.team}</div>
                <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                  <img
                    src={`/${matchupData.team.toLowerCase()}-logo.png`}
                    alt={matchupData.team}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=40&width=40"
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">Spread</div>
                <div className="font-medium">LAL -2.5</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">Total</div>
                <div className="font-medium">224.5</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">Implied Total</div>
                <div className="font-medium">LAL 113.5</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Matchup Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-xs text-gray-400">vs Position</div>
                <div className="font-medium">{matchupData.vsPosition}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-xs text-gray-400">Pace Rank</div>
                <div className="font-medium">{matchupData.paceRank}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-xs text-gray-400">Def Rating</div>
                <div className="font-medium">{matchupData.defRating}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded">
                <div className="text-xs text-gray-400">Last 10 Games</div>
                <div className="font-medium">7-3</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <h3 className="font-medium mb-2">Last Matchup</h3>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{matchupData.lastMatchup.date}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">PTS</div>
                <div className="font-medium">{matchupData.lastMatchup.points}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">REB</div>
                <div className="font-medium">{matchupData.lastMatchup.rebounds}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">AST</div>
                <div className="font-medium">{matchupData.lastMatchup.assists}</div>
              </div>
              <div className="bg-gray-700 p-2 rounded text-center">
                <div className="text-xs text-gray-400">MIN</div>
                <div className="font-medium">{matchupData.lastMatchup.minutes}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="news" className="flex-1 space-y-4">
          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Latest News</h3>
              <div className="text-xs text-gray-400">2 hours ago</div>
            </div>
            <p className="text-sm">
              Coach confirmed that {playerName} will not be on any minutes restriction for tonight's game against the
              Nuggets.
            </p>
            <div className="text-xs text-gray-400 mt-2">Source: RotoBaller</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Injury Update</h3>
              <div className="text-xs text-gray-400">1 day ago</div>
            </div>
            <p className="text-sm">
              {playerName} was a full participant in practice on Tuesday after dealing with minor knee soreness.
            </p>
            <div className="text-xs text-gray-400 mt-2">Source: Lakers Nation</div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Performance Note</h3>
              <div className="text-xs text-gray-400">3 days ago</div>
            </div>
            <p className="text-sm">
              {playerName} recorded his third straight game with 20+ points on Sunday, finishing with 26 points, 7
              rebounds and 5 assists against Boston.
            </p>
            <div className="text-xs text-gray-400 mt-2">Source: ESPN</div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-2 mt-4">
        <Button className="flex-1 bg-[#b8562f] hover:bg-[#c96a43]">
          <Bookmark className="w-4 h-4 mr-2" />
          Save Player
        </Button>
        <Button variant="outline" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" />
          Share Analysis
        </Button>
      </div>
    </div>
  )
}
