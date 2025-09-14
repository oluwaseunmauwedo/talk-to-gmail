
import * as gmailTools from "./gmail";
import * as calendarTools from "./calendar";

// Import generative UI tools
import {
  getLatestEmailsUI,
  searchEmailsUI,
  getEmailDetailsUI,
  summarizeEmailsUI,
  getAllEmailsUI
} from "./gmail/generative-ui";

import {
  getUpcomingEventsUI,
  getTodayEventsUI,
  getEventDetailsUI,
  searchEventsUI
} from "./calendar/generative-ui";

import {
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask
} from "./general";

export const tools = {
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask,

  // Gmail tools with Generative UI
  getLatestEmails: getLatestEmailsUI,
  getAllEmails: getAllEmailsUI,
  searchEmails: searchEmailsUI,
  getEmailDetails: getEmailDetailsUI,
  summarizeEmails: summarizeEmailsUI,

  // Original Gmail tools (fallback)
  getLatestEmailsOriginal: gmailTools.getLatestEmails,
  getAllEmailsOriginal: gmailTools.getAllEmails,
  searchEmailsOriginal: gmailTools.searchEmails,
  getEmailDetailsOriginal: gmailTools.getEmailDetails,
  summarizeEmailsOriginal: gmailTools.summarizeEmails,

  // Other Gmail tools (unchanged)
  getLatestEmailDetails: gmailTools.getLatestEmailDetails,
  getUnreadEmailCount: gmailTools.getUnreadEmailCount,

  composeAndSendEmail: gmailTools.composeAndSendEmail,
  forwardEmail: gmailTools.forwardEmail,
  forwardLatestEmail: gmailTools.forwardLatestEmail,
  replyToEmail: gmailTools.replyToEmail,
  replyToLatestEmail: gmailTools.replyToLatestEmail,

  deleteEmail: gmailTools.deleteEmail,
  deleteLatestEmail: gmailTools.deleteLatestEmail,
  markEmailAsReadOrUnread: gmailTools.markEmailAsReadOrUnread,
  manageEmailLabels: gmailTools.manageEmailLabels,
  listEmailLabels: gmailTools.listEmailLabels,

  // Calendar tools with Generative UI
  getUpcomingEvents: getUpcomingEventsUI,
  getTodayEvents: getTodayEventsUI,
  getEventDetails: getEventDetailsUI,
  searchEvents: searchEventsUI,

  // Original Calendar tools (fallback)
  getUpcomingEventsOriginal: calendarTools.getUpcomingEvents,
  getTodayEventsOriginal: calendarTools.getTodayEvents,
  getEventDetailsOriginal: calendarTools.getEventDetails,
  searchEventsOriginal: calendarTools.searchEvents,

  // Other Calendar tools (unchanged)
  createEvent: calendarTools.createEvent,
  scheduleQuickMeeting: calendarTools.scheduleQuickMeeting,
  updateEvent: calendarTools.updateEvent,
  deleteEvent: calendarTools.deleteEvent
};

export type { tools as ToolSet };
export type ToolName = keyof typeof tools;
