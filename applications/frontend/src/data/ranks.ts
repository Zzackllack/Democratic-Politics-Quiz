export interface Rank {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  minScore: number;
  maxPosition?: number; // Only for position-based ranks
}

// Position-based ranks (top performers regardless of score)
export const positionRanks: Rank[] = [
  {
    id: "champion",
    name: "Demokratie-Champion",
    icon: "👑",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    description: "Der absolute Spitzenreiter!",
    minScore: 0,
    maxPosition: 1,
  },
  {
    id: "master",
    name: "Verfassungsmeister",
    icon: "🥇",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-300",
    description: "Unter den Top 3 der besten Spieler",
    minScore: 0,
    maxPosition: 3,
  },
  {
    id: "expert",
    name: "Politik-Experte",
    icon: "🥈",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Unter den Top 10 der besten Spieler",
    minScore: 0,
    maxPosition: 10,
  },
  {
    id: "scholar",
    name: "Demokratie-Gelehrter",
    icon: "🥉",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-300",
    description: "Unter den Top 25 der besten Spieler",
    minScore: 0,
    maxPosition: 25,
  },
];

// Score-based ranks (achievement levels)
export const scoreRanks: Rank[] = [
  {
    id: "grandmaster",
    name: "Großmeister der Demokratie",
    icon: "🏆",
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-300",
    description: "Legendärer Status erreicht!",
    minScore: 1500,
  },
  {
    id: "supreme",
    name: "Oberster Verfassungsrichter",
    icon: "⚖️",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-300",
    description: "Meisterliches Wissen bewiesen",
    minScore: 1200,
  },
  {
    id: "chancellor",
    name: "Bundeskanzler",
    icon: "🏛️",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-300",
    description: "Führungsqualitäten bewiesen",
    minScore: 1000,
  },
  {
    id: "minister",
    name: "Minister",
    icon: "📋",
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-300",
    description: "Umfassendes politisches Verständnis",
    minScore: 800,
  },
  {
    id: "senator",
    name: "Senator",
    icon: "🎭",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-300",
    description: "Solide Kenntnisse der Demokratie",
    minScore: 600,
  },
  {
    id: "representative",
    name: "Abgeordneter",
    icon: "🗳️",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-300",
    description: "Gutes Verständnis der Politik",
    minScore: 400,
  },
  {
    id: "citizen",
    name: "Aktiver Bürger",
    icon: "👥",
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    description: "Grundlegendes politisches Wissen",
    minScore: 200,
  },
  {
    id: "newcomer",
    name: "Demokratie-Neuling",
    icon: "🌱",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-300",
    description: "Erste Schritte in die Politik",
    minScore: 0,
  },
];

/**
 * Get the appropriate rank for a player based on their position and score
 * Position ranks take priority over score ranks if both conditions are met
 */
export function getPlayerRank(position: number, score: number, _totalPlayers: number): Rank {
  // First check position-based ranks (these are more prestigious)
  for (const rank of positionRanks) {
    if (rank.maxPosition && position <= rank.maxPosition) {
      return rank;
    }
  }

  // Then check score-based ranks
  for (const rank of scoreRanks) {
    if (score >= rank.minScore) {
      return rank;
    }
  }

  // Fallback to the lowest rank
  return scoreRanks[scoreRanks.length - 1];
}

/**
 * Get rank statistics for display
 */
export function getRankStats(players: Array<{ score: number }>) {
  const stats = {
    totalPlayers: players.length,
    rankDistribution: {} as Record<string, number>,
    averageScore: 0,
    topScore: 0,
  };

  if (players.length === 0) return stats;

  // Calculate average and top score
  const scores = players.map((p) => p.score);
  stats.averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  stats.topScore = Math.max(...scores);

  // Calculate rank distribution
  players.forEach((player, index) => {
    const rank = getPlayerRank(index + 1, player.score, players.length);
    stats.rankDistribution[rank.id] = (stats.rankDistribution[rank.id] || 0) + 1;
  });

  return stats;
}

/**
 * Get all unique ranks present in the current leaderboard
 */
export function getActiveRanks(players: Array<{ score: number }>): Rank[] {
  const activeRankIds = new Set<string>();

  players.forEach((player, index) => {
    const rank = getPlayerRank(index + 1, player.score, players.length);
    activeRankIds.add(rank.id);
  });

  // Return both position and score ranks that are active
  const allRanks = [...positionRanks, ...scoreRanks];
  return allRanks.filter((rank) => activeRankIds.has(rank.id));
}
