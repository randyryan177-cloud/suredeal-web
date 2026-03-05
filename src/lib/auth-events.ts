// lib/auth-events.ts
import { EventEmitter } from "eventemitter3";

export const authEvents = new EventEmitter();

export const AUTH_EVENTS = {
  LOGOUT: "AUTH_EVENT_LOGOUT",
};