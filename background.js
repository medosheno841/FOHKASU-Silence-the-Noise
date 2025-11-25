// FOHKASU BACKGROUND SERVICE
// Handles uninstall redirection

// Set the uninstall URL (Must be a live http/https URL for Chrome to open it)
// Since we are local, this won't work perfectly until you host the goodbye.html file.
// For now, we set a placeholder.
const UNINSTALL_URL = "https://fohkasu-goodbye.vercel.app"; // Example URL

chrome.runtime.setUninstallURL(UNINSTALL_URL, () => {
    console.log("FOHKASU: Uninstall URL set.");
});

// On Install, open options or welcome? (Optional, skipping for now to keep it clean)
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === "install") {
        console.log("FOHKASU: System Installed. The watch begins.");
    }
});