import { Resend } from "resend";
import "dotenv/config";

const resend = new Resend(process.env.RESEND_KEY);

const keyTolocationObj = {
  406: "Mt. Whitney Day Use (All Routes)",
  166: "Mt. Whitney Trail (Overnight)",
};

export function sendNotification(toEmail, subject, availableDatesObjects) {
  resend.emails.send({
    from: "onboarding@resend.dev",
    to: [toEmail],
    subject,
    html: buildEmailHTML(availableDatesObjects),
  });
}

function buildEmailHTML(datesArray) {
  const entries = datesArray
    .map((obj) => {
      const date = Object.keys(obj)[0];
      const dayData = obj[date];

      return Object.keys(dayData)
        .map((key) => {
          const keyNum = parseInt(key);
          const loc = keyTolocationObj[keyNum];
          const { remaining, total } = dayData[key].quota_usage_by_member_daily;

          if (remaining > 0) {
            return formatHTMLBlock(date, loc, remaining, total);
          }
          return "";
        })
        .join("");
    })
    .join("");

  return `
    <div style="font-family: 'Segoe UI', sans-serif; color: #333;">
      <h1 style="color: #2E86AB;">🌄 Mt. Whitney Permit Availability Alert</h1>
      <p>Here are the latest available permit slots we found for you:</p>
      ${entries || "<p>No spots available right now.</p>"}
      <hr style="margin-top: 30px;" />
      <footer style="font-size: 0.85em; color: #777;">
        You received this notification because you signed up for Mt. Whitney permit alerts.<br/>
        Data sourced from <a href="https://recreation.gov" target="_blank">Recreation.gov</a>.
      </footer>
    </div>
  `;
}

function formatHTMLBlock(dateStr, location, available, total) {
  const formattedDate = new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <div style="border: 1px solid #e0e0e0; padding: 16px; margin: 20px 0; border-radius: 8px; background: #f9f9f9;">
      <h2 style="margin: 0 0 8px;">📅 ${formattedDate}</h2>
      <p style="margin: 0;">
        Location: <strong>${location}</strong><br/>
        Available: <strong style="color: green;">${available}</strong> / ${total} total
      </p>
    </div>
  `;
}
