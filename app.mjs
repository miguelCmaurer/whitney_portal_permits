import { getAvailability } from "./controllers/availability.mjs";

const second = 1000;
const minute = 60 * second;
const hour = 60 * minute;

(function pollWhitneyPermits() {
  let pollingActive = true;
  console.log("running...");
  async function pollData() {
    if (!pollingActive) {
      console.log("Polling stopped.");
      return;
    }
    try {
      pollingActive = await getAvailability();
    } catch (error) {
      console.error("Error during polling:", error);
      pollingActive = false;
    } finally {
      setTimeout(pollData, 5 * minute);
    }
  }
  pollData();
})();
