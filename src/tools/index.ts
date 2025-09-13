import * as gmailTools from "./gmail";
import * as calendarTools from "./calendar";

import {
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask
} from "./general";

export const tools = {
  scheduleTask,
  getScheduledTasks,
  cancelScheduledTask,

  // Gmail tools
  getLatestEmails: gmailTools.getLatestEmails,
  getAllEmails: gmailTools.getAllEmails,
  searchEmails: gmailTools.searchEmails,
  getEmailDetails: gmailTools.getEmailDetails,
  getLatestEmailDetails: gmailTools.getLatestEmailDetails,
  getUnreadEmailCount: gmailTools.getUnreadEmailCount,
  summarizeEmails: gmailTools.summarizeEmails,

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

  // Calendar tools
  getUpcomingEvents: calendarTools.getUpcomingEvents,
  getTodayEvents: calendarTools.getTodayEvents,
  getEventDetails: calendarTools.getEventDetails,
  searchEvents: calendarTools.searchEvents,

  createEvent: calendarTools.createEvent,
  scheduleQuickMeeting: calendarTools.scheduleQuickMeeting,
  updateEvent: calendarTools.updateEvent,
  deleteEvent: calendarTools.deleteEvent
};

export type { tools as ToolSet };
export type ToolName = keyof typeof tools;
