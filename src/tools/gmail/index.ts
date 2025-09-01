export {
  getLatestEmails,
  searchEmails,
  getEmailDetails,
  getUnreadEmailCount,
  summarizeEmails,
  getAllEmails
} from "./reading";

export { composeAndSendEmail, forwardEmail, replyToEmail } from "./writing";

export {
  deleteEmail,
  markEmailAsReadOrUnread,
  manageEmailLabels,
  listEmailLabels
} from "./management";

export {
  deleteLatestEmail,
  getLatestEmailDetails,
  forwardLatestEmail,
  replyToLatestEmail
} from "./convenience";

export type * from "./types";
export * from "./helpers";
