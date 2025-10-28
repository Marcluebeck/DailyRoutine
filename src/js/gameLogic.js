import { addPoints, getState, markTaskActive, markTaskComplete, purchaseItem, spendPoints } from './storage.js';

export function startTask(taskId) {
  markTaskActive(taskId);
  const task = getState().tasks.find((entry) => entry.id === taskId);
  return task || null;
}

export function completeTask(taskId) {
  const { tasks } = getState();
  const task = tasks.find((entry) => entry.id === taskId);
  if (!task) {
    return { pointsAwarded: 0, rewardEarned: null };
  }
  const pointsAwarded = Math.max(5, task.duration * 2);
  addPoints(pointsAwarded);
  markTaskComplete(taskId);
  return { pointsAwarded, rewardEarned: null };
}

export function evaluateRewards(rewardDefinitions) {
  const { progression } = getState();
  const completedCount = progression.completedTaskIds.length;
  return rewardDefinitions.map((reward) => ({
    ...reward,
    earned: completedCount >= reward.threshold
  }));
}

export function calculateProgress(tasks) {
  const { progression } = getState();
  const completedCount = progression.completedTaskIds.length;
  const total = tasks.length || 1;
  return Math.min(1, completedCount / total);
}

export function canPurchase(cost) {
  return getState().points >= cost;
}

export function buyItem(item) {
  if (!spendPoints(item.cost)) {
    return false;
  }
  purchaseItem(item.id);
  return true;
}

export function getMotivationMessage(customMessages = []) {
  const { settings } = getState();
  const pool = customMessages.length ? customMessages : settings.motivationMessages;
  if (!pool.length) {
    return 'Du bist spitze!';
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

export function nextTask(tasks) {
  const { progression } = getState();
  const remaining = tasks.filter((task) => !progression.completedTaskIds.includes(task.id));
  return remaining[0] || null;
}
