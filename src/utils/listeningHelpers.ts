/**
 * Listening Feature Helper Functions
 * Handles trust score calculations, badge updates, usage limits, and matching logic
 */

// Badge configuration
const BADGE_MILESTONES = [
  { level: 0, title: "New Listener", minSessions: 0 },
  { level: 1, title: "Trusted Listener", minSessions: 25 },
  { level: 2, title: "Comfort Giver", minSessions: 50 },
  { level: 3, title: "Emotional Supporter", minSessions: 100 },
  { level: 4, title: "Safe Space Creator", minSessions: 150 },
  { level: 5, title: "Community Pillar", minSessions: 250 },
  { level: 6, title: "Vibess Guardian", minSessions: 500 },
];

/**
 * Update user's trust score based on feedback
 * @param currentScore - Current trust score (0-150)
 * @param feedbackType - Type of feedback: "positive", "negative", or "neutral"
 * @param rating - Optional rating (0-10) for positive/negative feedback
 * @returns Updated trust score (clamped between 0-150)
 */
export function calculateTrustScore(
  currentScore: number,
  feedbackType: "positive" | "negative" | "neutral",
  rating?: number
): number {
  let newScore = currentScore;

  if (feedbackType === "positive" && rating !== undefined) {
    newScore += rating * 0.8;
  } else if (feedbackType === "negative" && rating !== undefined) {
    newScore -= rating * 1.2;
  } else if (feedbackType === "neutral") {
    newScore += 2;
  }

  // Clamp between 0 and 150
  newScore = Math.max(0, Math.min(150, newScore));

  return Math.round(newScore);
}

/**
 * Determine badge level based on positive sessions count
 * @param positiveSessions - Number of positive sessions completed
 * @returns Badge object with level and title
 */
export function calculateListenerBadge(positiveSessions: number): {
  level: number;
  title: string;
} {
  // Find the highest badge the user qualifies for
  for (let i = BADGE_MILESTONES.length - 1; i >= 0; i--) {
    if (positiveSessions >= BADGE_MILESTONES[i].minSessions) {
      return {
        level: BADGE_MILESTONES[i].level,
        title: BADGE_MILESTONES[i].title,
      };
    }
  }

  // Default to New Listener
  return { level: 0, title: "New Listener" };
}

/**
 * Get next badge milestone information
 * @param positiveSessions - Current number of positive sessions
 * @returns Next badge info or null if at max level
 */
export function getNextBadgeMilestone(positiveSessions: number): {
  level: number;
  title: string;
  requiredSessions: number;
  progress: number;
} | null {
  for (let i = 0; i < BADGE_MILESTONES.length; i++) {
    if (positiveSessions < BADGE_MILESTONES[i].minSessions) {
      return {
        level: BADGE_MILESTONES[i].level,
        title: BADGE_MILESTONES[i].title,
        requiredSessions: BADGE_MILESTONES[i].minSessions,
        progress: positiveSessions,
      };
    }
  }

  return null; // User has reached max badge level
}

/**
 * Check if user has exceeded daily session limit (3 per day)
 * @param user - User document with listeningUsage field
 * @returns true if limit exceeded, false otherwise
 */
export function checkDailyLimit(user: any): boolean {
  if (!user.listeningUsage?.lastSessionDate) {
    return false; // No sessions yet
  }

  const lastSessionDate = new Date(user.listeningUsage.lastSessionDate);
  const today = new Date();

  // Check if last session was today
  const isSameDay =
    lastSessionDate.getDate() === today.getDate() &&
    lastSessionDate.getMonth() === today.getMonth() &&
    lastSessionDate.getFullYear() === today.getFullYear();

  if (isSameDay && user.listeningUsage.dailySessions >= 3) {
    return true; // Exceeded daily limit
  }

  return false;
}

/**
 * Check if user is in cooldown period (12 hours after 3 consecutive days)
 * @param user - User document with listeningCooldownUntil field
 * @returns true if in cooldown, false otherwise
 */
export function checkCooldown(user: any): boolean {
  if (!user.listeningCooldownUntil) {
    return false;
  }

  const cooldownEnd = new Date(user.listeningCooldownUntil);
  const now = new Date();

  return now < cooldownEnd;
}

/**
 * Check if user is temporarily blocked for misuse
 * @param user - User document with misuseTracking field
 * @returns true if blocked, false otherwise
 */
export function checkMisuseBlock(user: any): boolean {
  if (!user.misuseTracking?.blockedUntil) {
    return false;
  }

  const blockEnd = new Date(user.misuseTracking.blockedUntil);
  const now = new Date();

  return now < blockEnd;
}

/**
 * Update user's daily session tracking
 * @param user - User document
 * @returns Updated usage object
 */
export function updateDailyUsage(user: any): {
  dailySessions: number;
  lastSessionDate: Date;
  consecutiveDays: number;
  lastConsecutiveDate: Date;
} {
  const today = new Date();
  const lastSessionDate = user.listeningUsage?.lastSessionDate
    ? new Date(user.listeningUsage.lastSessionDate)
    : null;

  let dailySessions = 1;
  let consecutiveDays = 1;

  if (lastSessionDate) {
    const isSameDay =
      lastSessionDate.getDate() === today.getDate() &&
      lastSessionDate.getMonth() === today.getMonth() &&
      lastSessionDate.getFullYear() === today.getFullYear();

    if (isSameDay) {
      // Same day - increment daily count
      dailySessions = (user.listeningUsage.dailySessions || 0) + 1;
      consecutiveDays = user.listeningUsage.consecutiveDays || 1;
    } else {
      // Different day - check if consecutive
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isConsecutive =
        lastSessionDate.getDate() === yesterday.getDate() &&
        lastSessionDate.getMonth() === yesterday.getMonth() &&
        lastSessionDate.getFullYear() === yesterday.getFullYear();

      if (isConsecutive) {
        consecutiveDays = (user.listeningUsage.consecutiveDays || 0) + 1;
      } else {
        consecutiveDays = 1; // Reset consecutive days
      }
    }
  }

  return {
    dailySessions,
    lastSessionDate: today,
    consecutiveDays,
    lastConsecutiveDate: today,
  };
}

/**
 * Check if user should be put on cooldown (after 3 consecutive days)
 * @param consecutiveDays - Number of consecutive days
 * @returns Cooldown end date or null
 */
export function calculateCooldown(consecutiveDays: number): Date | null {
  if (consecutiveDays >= 3) {
    const cooldownEnd = new Date();
    cooldownEnd.setHours(cooldownEnd.getHours() + 12); // 12-hour cooldown
    return cooldownEnd;
  }
  return null;
}

/**
 * Format time remaining for display
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string (e.g., "14:32")
 */
export function formatTimeRemaining(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Get user-friendly cooldown message
 * @param cooldownEnd - Cooldown end date
 * @returns Formatted message
 */
export function getCooldownMessage(cooldownEnd: Date): string {
  const now = new Date();
  const remaining = cooldownEnd.getTime() - now.getTime();
  const hours = Math.ceil(remaining / (1000 * 60 * 60));

  return `You've been using this space a lot lately. Take a small break. We'll be here in ${hours} hour${
    hours > 1 ? "s" : ""
  } 🤍`;
}

/**
 * Get all badge milestones for display
 * @returns Array of badge milestones
 */
export function getAllBadgeMilestones() {
  return BADGE_MILESTONES;
}
