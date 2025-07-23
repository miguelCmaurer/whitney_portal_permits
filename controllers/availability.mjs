import { sendNotification } from "../utility/sendEmail.mjs";

const whitneyPermits =
  "https://www.recreation.gov/api/permitinyo/445860/availabilityv2?start_date=2025-07-01&end_date=2025-07-31&commercial_acct=false";

let lastSent = [];

export async function getAvailability() {
  console.log("getAvailability");

  try {
    const resp = await fetch(whitneyPermits);
    if (!resp.ok) {
      console.error(`Failed to fetch permits: ${resp.statusText}`);
      return false;
    }
    const data = await resp.json();
    const userDates = ["2025-07-23", "2025-07-22", "2025-08-03", "2025-08-04"];
    const availableDays = [];

    for (const [date, payload] of Object.entries(data.payload)) {
      if (isReservable(userDates, date, data) && isNew({ [date]: payload })) {
        availableDays.push({ [date]: payload });
        updateLastSent(date, payload);
      }
    }

    if (availableDays.length > 0) {
      console.log("Sending email: ", availableDays);
      sendNotification(
        "miguelmaurer456@gmail.com",
        "Mt. Whitney portal permits Available",
        availableDays,
      );
    }

    return true;
  } catch (error) {
    console.error("Error in getAvailability:", error);
    return false;
  }
}

function isReservable(userDates, date, data) {
  if (userDates.includes(date)) {
    if (
      data.payload[date]["166"] &&
      data.payload[date]["166"].quota_usage_by_member_daily.remaining > 1
    ) {
      return true;
    }
    return true;
  }
  return false;
}

function deepEqual(obj1, obj2) {
  // Check if both are the same reference or primitive value
  if (obj1 === obj2) return true;

  // Check if either is null or not an object
  if (
    obj1 == null ||
    obj2 == null ||
    typeof obj1 !== "object" ||
    typeof obj2 !== "object"
  ) {
    console.log("either is null or not an object");
    return false;
  }

  // Get keys of both objects
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  // Check if the number of keys is different
  if (keys1.length !== keys2.length) return false;

  // Recursively compare each key and value
  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

function isNew(newObj) {
  return !lastSent.some((obj) => deepEqual(obj, newObj));
}

function updateLastSent(date, newObj) {
  const index = lastSent.findIndex((item) => Object.keys(item)[0] === date);
  if (index !== -1) {
    lastSent[index] = { [date]: newObj };
  } else {
    lastSent.push({ [date]: newObj });
  }
}
