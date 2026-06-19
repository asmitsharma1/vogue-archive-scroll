export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function levenshteinDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const distances: number[][] = Array.from({ length: rows }, () => new Array(cols).fill(0));

  for (let i = 0; i < rows; i++) distances[i][0] = i;
  for (let j = 0; j < cols; j++) distances[0][j] = j;

  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      distances[i][j] = Math.min(
        distances[i - 1][j] + 1,
        distances[i][j - 1] + 1,
        distances[i - 1][j - 1] + cost,
      );
    }
  }

  return distances[rows - 1][cols - 1];
}

/**
 * Scores how well `query` matches `target`: exact substring hits score highest,
 * shared tokens next, and a close fuzzy (typo-tolerant) match scores lowest but
 * still above zero. Returns 0 when there's no meaningful match.
 */
export function scoreTextMatch(query: string, target: string): number {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTarget = target.toLowerCase();
  if (!normalizedQuery) return 1;

  if (normalizedTarget.includes(normalizedQuery)) {
    return 100;
  }

  const queryTokens = tokenize(normalizedQuery);
  const targetTokens = tokenize(normalizedTarget);
  if (queryTokens.length === 0) return 0;

  let tokenScore = 0;
  for (const queryToken of queryTokens) {
    if (targetTokens.some((targetToken) => targetToken === queryToken)) {
      tokenScore += 10;
      continue;
    }
    const closeMatch = targetTokens.find((targetToken) => {
      const maxLen = Math.max(queryToken.length, targetToken.length);
      const distance = levenshteinDistance(queryToken, targetToken);
      return maxLen > 0 && distance / maxLen <= 0.3;
    });
    if (closeMatch) {
      tokenScore += 4;
    }
  }

  return tokenScore;
}

export function rankBySearch<T>(items: T[], query: string, getText: (item: T) => string): T[] {
  if (!query.trim()) return items;
  return items
    .map((item) => ({ item, score: scoreTextMatch(query, getText(item)) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
