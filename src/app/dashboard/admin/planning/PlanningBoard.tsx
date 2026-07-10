"use client";

import React, { useState } from "react";
import { Plus, Calendar as CalendarIcon, User, CheckCircle, Clock, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

import { Assignment, CalendarEvent, User as PrismaUser } from "@prisma/client";

interface PlanningBoardProps {
  initialAssignments: Assignment[];
  initialEvents: CalendarEvent[];
  reporters: Pick<PrismaUser, "id" | "name" | "email">[];
}

export default function PlanningBoard({ initialAssignments, initialEvents, reporters }: PlanningBoardProps) {
  const router = useRouter();
  const [assignments, setAssignments] = useState(initialAssignments);
  const [events, setEvents] = useState(initialEvents);
  
  // Assignment Form State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [assignmentReporterId, setAssignmentReporterId] = useState("");
  const [assignmentPriority, setAssignmentPriority] = useState("MEDIUM");
  const [assignmentDeadline, setAssignmentDeadline] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  // Event Form State
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventType, setEventType] = useState("EVENT");

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assignmentTitle,
          reporterId: assignmentReporterId,
          priority: assignmentPriority,
          deadline: new Date(assignmentDeadline).toISOString(),
          notes: assignmentNotes
        })
      });
      if (res.ok) {
        const newAssignment = await res.json();
        setAssignments([...assignments, newAssignment]);
        setShowAssignmentModal(false);
        setAssignmentTitle("");
        setAssignmentReporterId("");
        setAssignmentPriority("MEDIUM");
        setAssignmentDeadline("");
        setAssignmentNotes("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription,
          startDate: new Date(eventStartDate).toISOString(),
          endDate: new Date(eventEndDate).toISOString(),
          type: eventType
        })
      });
      if (res.ok) {
        const newEvent = await res.json();
        setEvents([...events, newEvent]);
        setShowEventModal(false);
        setEventTitle("");
        setEventDescription("");
        setEventStartDate("");
        setEventEndDate("");
        setEventType("EVENT");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/40";
      case "HIGH":
        return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/40";
      case "MEDIUM":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/40";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800/40 dark:text-slate-400 border-slate-200 dark:border-slate-700/40";
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      
      {/* ASSIGNMENTS */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Assignments</h2>
            <p className="text-xs text-slate-400 mt-0.5">Stories currently tracked for reporters</p>
          </div>
          <button 
            onClick={() => setShowAssignmentModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-blue-500/10"
          >
            <Plus size={16} /> New Assignment
          </button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {assignments.map((a: Assignment) => {
            const reporter = reporters.find(r => r.id === a.reporterId);
            return (
              <div 
                key={a.id} 
                className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition duration-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{a.title}</h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getPriorityStyle(a.priority)}`}>
                    {a.priority}
                  </span>
                </div>
                
                {a.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-white/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {a.notes}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="font-medium truncate">{reporter?.name || reporter?.email || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Due {new Date(a.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 col-span-2">
                    <CheckCircle size={14} className="text-slate-400" />
                    <span className="font-medium">
                      Status: <span className="text-blue-600 dark:text-blue-400 font-semibold">{a.status}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {assignments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <FileText size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-slate-400 text-sm">No active editorial assignments.</p>
            </div>
          )}
        </div>
      </div>

      {/* EVENTS CALENDAR */}
      <div className="bg-white dark:bg-slate-900 rounded-[28px] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upcoming Events</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track press conferences, live logs, & launches</p>
          </div>
          <button 
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition shadow-md shadow-violet-500/10"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {events.map((e: CalendarEvent) => (
            <div key={e.id} className="p-4 rounded-2xl border border-violet-100 dark:border-violet-950/40 bg-violet-50/20 dark:bg-violet-950/10 hover:border-violet-200 dark:hover:border-violet-800 transition duration-200">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-violet-955 dark:text-violet-200">{e.title}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100/60 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border border-violet-200/40">
                  {e.type}
                </span>
              </div>
              {e.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{e.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-violet-700/80 dark:text-violet-400/80">
                <CalendarIcon size={14} />
                <span className="font-medium">
                  {new Date(e.startDate).toLocaleDateString()} - {new Date(e.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <CalendarIcon size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-slate-400 text-sm">No upcoming events.</p>
            </div>
          )}
        </div>
      </div>

      {/* ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1">Title</label>
                <input required type="text" value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Reporter</label>
                <select required value={assignmentReporterId} onChange={e => setAssignmentReporterId(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-white dark:bg-slate-950 outline-none focus:border-blue-500">
                  <option value="">Select a reporter</option>
                  {reporters.map((r: Pick<PrismaUser, "id" | "name" | "email">) => (
                    <option key={r.id} value={r.id}>{r.name || r.email}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1">Priority</label>
                  <select value={assignmentPriority} onChange={e => setAssignmentPriority(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-white dark:bg-slate-950 outline-none focus:border-blue-500">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Deadline</label>
                  <input required type="date" value={assignmentDeadline} onChange={e => setAssignmentDeadline(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Notes</label>
                <textarea value={assignmentNotes} onChange={e => setAssignmentNotes(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-blue-500 h-24 resize-none" />
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm">Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-200 dark:border-slate-800 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add Upcoming Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-1">Event Title</label>
                <input required type="text" value={eventTitle} onChange={e => setEventTitle(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Description</label>
                <textarea value={eventDescription} onChange={e => setEventDescription(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-violet-500 h-20 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold block mb-1">Start Date</label>
                  <input required type="date" value={eventStartDate} onChange={e => setEventStartDate(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">End Date</label>
                  <input required type="date" value={eventEndDate} onChange={e => setEventEndDate(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-transparent outline-none focus:border-violet-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1">Event Type</label>
                <select value={eventType} onChange={e => setEventType(e.target.value)} className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 bg-white dark:bg-slate-950 outline-none focus:border-violet-500">
                  <option value="EVENT">General Event</option>
                  <option value="PRESS_CONF">Press Conference</option>
                  <option value="MILESTONE">Editorial Milestone</option>
                  <option value="LAUNCH">Product/Policy Launch</option>
                </select>
              </div>
              
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={() => setShowEventModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-sm">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm">Add Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
