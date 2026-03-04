/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar,
  Search,
  Stethoscope,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Represents the status of a patient appointment.
 */
enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  COMPLETED = 'Completed'
}

/**
 * Represents the priority of an appointment.
 */
enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

/**
 * Data model for a Patient Appointment.
 */
interface Appointment {
  id: string;
  patientName: string;
  age: number;
  appointmentDate: string;
  appointmentTime: string;
  priority: Priority;
  reason: string;
  status: AppointmentStatus;
  createdAt: number;
}

/**
 * Senior Java Developer style: Clean, typed, and structured Patient Appointment Dashboard.
 */
export default function App() {
  // --- State Management ---
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('meditrack_appointments');
    return saved ? JSON.parse(saved) : [];
  });
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    appointmentTime: '',
    priority: Priority.MEDIUM,
    reason: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | AppointmentStatus>('All');
  const [sortBy, setSortBy] = useState<'time' | 'priority' | 'name'>('time');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Persistence Effect
  React.useEffect(() => {
    localStorage.setItem('meditrack_appointments', JSON.stringify(appointments));
  }, [appointments]);

  // --- Handlers ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.patientName || !formData.age || !formData.appointmentTime || !formData.appointmentDate) {
      return;
    }

    const newAppointment: Appointment = {
      id: crypto.randomUUID(),
      patientName: formData.patientName,
      age: parseInt(formData.age, 10),
      appointmentDate: formData.appointmentDate,
      appointmentTime: formData.appointmentTime,
      priority: formData.priority as Priority,
      reason: formData.reason,
      status: AppointmentStatus.SCHEDULED,
      createdAt: Date.now()
    };

    setAppointments(prev => [newAppointment, ...prev]);
    setFormData({ 
      patientName: '', 
      age: '', 
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: '',
      priority: Priority.MEDIUM,
      reason: ''
    });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Age', 'Date', 'Time', 'Priority', 'Reason', 'Status'];
    const rows = appointments.map(a => [
      a.patientName,
      a.age,
      a.appointmentDate,
      a.appointmentTime,
      a.priority,
      a.reason.replace(/,/g, ';'),
      a.status
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
  };

  const toggleStatus = (id: string) => {
    setAppointments(prev => prev.map(app => {
      if (app.id === id) {
        return {
          ...app,
          status: app.status === AppointmentStatus.SCHEDULED 
            ? AppointmentStatus.COMPLETED 
            : AppointmentStatus.SCHEDULED
        };
      }
      return app;
    }));
  };

  // --- Computed Data ---
  const filteredAppointments = useMemo(() => {
    let result = appointments.filter(app => {
      const matchesSearch = app.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           app.reason.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'time') {
        const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime();
        const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime();
        return dateA - dateB;
      }
      if (sortBy === 'priority') {
        const priorityOrder = { [Priority.HIGH]: 0, [Priority.MEDIUM]: 1, [Priority.LOW]: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.patientName.localeCompare(b.patientName);
    });
  }, [appointments, searchQuery, filterStatus, sortBy]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === AppointmentStatus.SCHEDULED).length,
      completed: appointments.filter(a => a.status === AppointmentStatus.COMPLETED).length
    };
  }, [appointments]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Stethoscope className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              Medi<span className="text-blue-600">Track</span> Pro
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
            <div className="hidden sm:flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Stats */}
          <div className="lg:col-span-4 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">Total</p>
                <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-blue-500 uppercase font-semibold tracking-wider mb-1">Pending</p>
                <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-xs text-emerald-500 uppercase font-semibold tracking-wider mb-1">Done</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
            </div>

            {/* Appointment Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wide">
                  <Plus className="w-4 h-4 text-blue-600" />
                  New Appointment
                </h2>
              </div>
              <form onSubmit={handleAddAppointment} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Patient Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      placeholder="Full Name"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Age</label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="Age"
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm appearance-none"
                    >
                      <option value={Priority.LOW}>Low</option>
                      <option value={Priority.MEDIUM}>Medium</option>
                      <option value={Priority.HIGH}>High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Date</label>
                    <input
                      type="date"
                      name="appointmentDate"
                      value={formData.appointmentDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Time</label>
                    <input
                      type="time"
                      name="appointmentTime"
                      value={formData.appointmentTime}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 ml-1">Reason for Visit</label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-2 active:scale-[0.98]"
                >
                  <Plus className="w-5 h-5" />
                  Schedule Appointment
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Table */}
          <div className="lg:col-span-8 space-y-4">
            {/* Filters & Search */}
            <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or reason..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={exportToCSV}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Export CSV
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                  {(['All', AppointmentStatus.SCHEDULED, AppointmentStatus.COMPLETED] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        filterStatus === status
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Sort By:</span>
                  {(['time', 'priority', 'name'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all capitalize ${
                        sortBy === sort
                          ? 'bg-slate-800 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {sort}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient & Reason</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {filteredAppointments.length > 0 ? (
                        filteredAppointments.map((app) => (
                          <motion.tr
                            key={app.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="hover:bg-slate-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${
                                  app.status === AppointmentStatus.COMPLETED ? 'bg-slate-100 text-slate-400' : 'bg-blue-50 text-blue-600'
                                }`}>
                                  {app.patientName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className={`font-bold truncate ${app.status === AppointmentStatus.COMPLETED ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                    {app.patientName}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">{app.age}y • {app.reason || 'No reason provided'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col text-xs font-medium text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  {new Date(app.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {app.appointmentTime}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                                app.priority === Priority.HIGH 
                                  ? 'bg-red-50 text-red-600 border-red-100' 
                                  : app.priority === Priority.MEDIUM
                                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                                  : 'bg-slate-50 text-slate-600 border-slate-100'
                              }`}>
                                {app.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button 
                                onClick={() => toggleStatus(app.id)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                                  app.status === AppointmentStatus.COMPLETED
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {app.status === AppointmentStatus.COMPLETED ? (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                ) : (
                                  <Clock className="w-3.5 h-3.5" />
                                )}
                                {app.status}
                              </button>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => setShowDeleteConfirm(app.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="Delete Appointment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <motion.tr
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td colSpan={5} className="px-6 py-20 text-center">
                            <div className="flex flex-col items-center gap-3 text-slate-400">
                              <Calendar className="w-12 h-12 opacity-20" />
                              <p className="text-sm font-medium">No appointments found</p>
                              <p className="text-xs">Try adjusting your search or add a new patient.</p>
                            </div>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-400 font-medium">
            &copy; 2026 MediTrack Pro. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-slate-400 hover:text-blue-600 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-200"
            >
              <h3 className="text-lg font-bold text-slate-800 mb-2">Delete Appointment?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. Are you sure you want to remove this patient record?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    handleDeleteAppointment(showDeleteConfirm);
                    setShowDeleteConfirm(null);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
