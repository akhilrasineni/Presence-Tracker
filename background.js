
/**
 * Background Service Worker for Presence & Break Tracker
 * Handles reminders and persistent timers using unified local storage keys.
 */

const BREAK_ALARM_NAME = 'break-reminder';
const REMINDERS_KEY = 'rpt_reminders'; // Unified key

// Initialize alarms on installation
chrome.runtime.onInstalled.addListener(() => {
  // Set up break reminder every 60 minutes
  chrome.alarms.create(BREAK_ALARM_NAME, { periodInMinutes: 60 });
});

// Listen for storage changes to sync alarms for new reminders
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[REMINDERS_KEY]) {
    syncReminderAlarms(changes[REMINDERS_KEY].newValue);
  }
});

function syncReminderAlarms(reminders) {
  if (!reminders) return;
  // Simplified logic: Clear and recreate alarms for incomplete tasks
  reminders.forEach(r => {
    if (!r.completed && !r.notified) {
      const scheduledTime = new Date(r.dateTime).getTime();
      if (scheduledTime > Date.now()) {
        chrome.alarms.create(`reminder-${r.id}`, { when: scheduledTime });
      }
    }
  });
}

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
    iconUrl: 'icon.png',
    title: 'Time for a Break!',
    message: msg,
    priority: 2
  });
}

async function handleTaskReminder(id) {
  // Read from unified key
  const data = await chrome.storage.local.get([REMINDERS_KEY]);
  const reminders = data[REMINDERS_KEY] || [];
  const reminder = reminders.find(r => r.id === id);

  if (reminder && !reminder.completed) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Mission Objective Alert',
      message: reminder.title,
      priority: 2
    });

    // Mark as notified in storage
    const updated = reminders.map(r => r.id === id ? { ...r, notified: true } : r);
    await chrome.storage.local.set({ [REMINDERS_KEY]: updated });
  }
}
