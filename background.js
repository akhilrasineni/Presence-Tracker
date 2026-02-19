
/**
 * Background Service Worker for Presence & Break Tracker
 * Handles reminders and persistent timers
 */

const BREAK_ALARM_NAME = 'break-reminder';

// Initialize alarms on installation
chrome.runtime.onInstalled.addListener(() => {
  // Set up break reminder every 60 minutes
  chrome.alarms.create(BREAK_ALARM_NAME, { periodInMinutes: 60 });
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === BREAK_ALARM_NAME) {
    showBreakNotification();
  } else if (alarm.name.startsWith('reminder-')) {
    const reminderId = alarm.name.split('reminder-')[1];
    handleTaskReminder(reminderId);
  }
});

function showBreakNotification() {
  const messages = [
    "Human.exe needs a reboot! Stand up and stretch.",
    "Hydrate or Diedrate! Go grab some water.",
    "Your back is currently a shrimp. Un-shrimp yourself!",
    "Eye fatigue alert! Look at something 20ft away."
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];

  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon.png', // Fallback to generic if not found
    title: 'Time for a Break!',
    message: msg,
    priority: 2
  });
}

async function handleTaskReminder(id) {
  const data = await chrome.storage.local.get(['presence_tracker_reminders']);
  const reminders = data.presence_tracker_reminders || [];
  const reminder = reminders.find(r => r.id === id);

  if (reminder && !reminder.completed) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Task Reminder',
      message: reminder.title,
      priority: 2
    });

    // Mark as notified in storage
    const updated = reminders.map(r => r.id === id ? { ...r, notified: true } : r);
    await chrome.storage.local.set({ presence_tracker_reminders: updated });
  }
}
