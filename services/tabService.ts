
import { PageContent } from "../types";

declare const chrome: any;

export const getActiveTabContent = async (): Promise<PageContent> => {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    // Fallback for development/testing outside of extension context
    return {
      title: "Local Development Environment",
      url: window.location.href,
      body: "Running in non-extension environment. Real-time tab analysis is disabled."
    };
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) throw new Error("No active tab found");

    // Execute script to get page content
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return {
          title: document.title,
          url: window.location.href,
          body: document.body.innerText.slice(0, 15000) // Truncate for Gemini limits
        };
      }
    });

    return results[0].result;
  } catch (error) {
    console.error("Failed to extract tab content:", error);
    return {
      title: "Access Restricted",
      url: "N/A",
      body: "Could not read page content. Check browser permissions."
    };
  }
};
