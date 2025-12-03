import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Download, Save, X, Activity, Heart,
    Thermometer, Droplet, Wind, Zap, LayoutDashboard,
    ChevronRight, Trash2, FileText, ExternalLink, CheckCircle, Calendar
} from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue, push } from 'firebase/database';
import Papa from 'papaparse';
import ConsentForm from './ConsentForm';

const Dashboard = () => {
    const [sessionPatients, setSessionPatients] = useState([]);
    const [isAddingPatient, setIsAddingPatient] = useState(false);
    const [currentPatient, setCurrentPatient] = useState(null);
    const [sensorData, setSensorData] = useState({});

    // Form State
    const [formData, setFormData] = useState({
        // Personal
        fullName: '',
        patientId: '',
        age: '',
        gender: 'Male',
        height: '',
        weight: '',
        visitDay: 'Day 1',
        visitDate: new Date().toISOString().split('T')[0],
        hba1c: '',
        glucose_fg: '',
        glucose_pg: '',

        // Medical History
        hypertensive: 'No',
        family_hypertension: 'No',
        cardiovascular_disease: 'No',
        stroke: 'No',
        family_diabetes: 'No',
        diabetic: 'No',
    });

    // Live Data State
    const [capturedData, setCapturedData] = useState(null);
    const [showSurveyModal, setShowSurveyModal] = useState(false);

    // Fetch Live Data & Patient Records
    useEffect(() => {
        // Live Sensor Data
        const sensorRef = ref(db, 'sensor');
        const unsubscribeSensor = onValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const values = typeof Object.values(data)[0] === 'object'
                    ? Object.values(data)[0]
                    : data;
                setSensorData(values);
            }
        });

        // Patient Records (Persistence)
        const recordsRef = ref(db, 'patient_records');
        const unsubscribeRecords = onValue(recordsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const recordsArray = Object.values(data).reverse(); // Newest first
                setSessionPatients(recordsArray);
            } else {
                setSessionPatients([]);
            }
        });

        return () => {
            unsubscribeSensor();
            unsubscribeRecords();
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateBMI = () => {
        if (formData.height && formData.weight) {
            const h = parseFloat(formData.height) / 100;
            const w = parseFloat(formData.weight);
            return (w / (h * h)).toFixed(1);
        }
        return '--';
    };

    const handleCapture = () => {
        setCapturedData({ ...sensorData, timestamp: new Date().toISOString() });
    };

    const handleSavePatient = () => {
        if (!capturedData) {
            alert("Please capture sensor data before saving.");
            return;
        }

        const newRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...formData,
            bmi: calculateBMI(),
            ...capturedData
        };

        // Save to Firebase for persistence
        push(ref(db, 'patient_records'), newRecord)
            .then(() => {
                setShowSurveyModal(true);
                setIsAddingPatient(false);
                resetForm(false);
            })
            .catch((error) => {
                alert("Error saving data: " + error.message);
            });
    };

    const resetForm = (closeAddMode = true) => {
        if (closeAddMode) setIsAddingPatient(false);
        setCurrentPatient(null);
        setCapturedData(null);
        setFormData(prev => ({
            fullName: '', patientId: '', age: '', gender: 'Male',
            height: '', weight: '', visitDay: prev.visitDay || 'Day 1', visitDate: new Date().toISOString().split('T')[0], hba1c: '', glucose_fg: '', glucose_pg: '',
            hypertensive: 'No', family_hypertension: 'No',
            cardiovascular_disease: 'No', stroke: 'No', family_diabetes: 'No', diabetic: 'No'
        }));
    };

    const handleExportSession = () => {
        if (sessionPatients.length === 0) return;
        const csv = Papa.unparse(sessionPatients);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `session_export_${new Date().getTime()}.csv`);
        link.click();
    };

    const SensorCard = ({ icon: Icon, label, value, unit, color, isCaptured }) => (
        <div className={`relative overflow-hidden p-4 rounded-xl border transition-all duration-300 ${isCaptured
            ? 'bg-gray-50 border-gray-200 opacity-75'
            : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
            }`}>
            <div className={`absolute top-0 right-0 p-2 opacity-10 ${color.text}`}>
                <Icon className="w-16 h-16" />
            </div>
            <div className="relative z-10 flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color.bg} ${color.text}`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                    <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold text-gray-800">
                            {value !== undefined ? value : '--'}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">{unit}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const [showConsent, setShowConsent] = useState(false);

    const handleNewPatientClick = () => {
        setShowConsent(true);
    };

    const handleConsentConfirmed = () => {
        setShowConsent(false);
        setIsAddingPatient(true);
    };

    const handleConsentCancelled = () => {
        setShowConsent(false);
    };

    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const [sessionStartTime] = useState(Date.now());
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        const timer = setInterval(() => {
            const now = Date.now();
            const diff = now - sessionStartTime;
            const hours = Math.floor(diff / 3600000);
            const minutes = Math.floor((diff % 3600000) / 60000);
            const seconds = Math.floor((diff % 60000) / 1000);
            setElapsedTime(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);
        return () => clearInterval(timer);
    }, [sessionStartTime]);

    return (
        <div className="flex h-screen bg-gray-50 font-sans text-slate-800 overflow-hidden">
            {/* Consent Modal */}
            {showConsent && (
                <ConsentForm onConsent={handleConsentConfirmed} onCancel={handleConsentCancelled} />
            )}

            {/* Survey Modal */}
            {showSurveyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Patient Saved!</h2>
                            <p className="text-slate-500">The patient data has been recorded successfully. Would you like to open the patient survey now?</p>

                            <div className="pt-4 space-y-3">
                                <a
                                    href="https://forms.gle/3sTYxJVEBUCWtgGH9"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2"
                                    onClick={() => setShowSurveyModal(false)}
                                >
                                    <ExternalLink className="w-5 h-5" />
                                    <span>Open Survey Form</span>
                                </a>
                                <button
                                    onClick={() => setShowSurveyModal(false)}
                                    className="block w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold transition-colors"
                                >
                                    Close & Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Sidebar Overlay */}
            {!isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(true)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-20
        w-80 bg-white border-r border-gray-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 p-2 rounded-lg">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">MediRecord</h1>
                            <p className="text-xs text-slate-500 font-medium">Pro Data Logger</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-700">{sessionPatients.length}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 m-4">
                    <p className="text-xs text-slate-500 mb-1">Session Time</p>
                    <p className="text-lg font-bold text-slate-700 font-mono">{elapsedTime}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <button
                        onClick={handleNewPatientClick}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center space-x-2 group"
                    >
                        <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span>New Patient</span>
                    </button>

                    <div className="space-y-2 mt-6">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2">Session Records</h3>
                        {sessionPatients.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                                No patients recorded yet
                            </div>
                        ) : (
                            sessionPatients.map((p, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors">
                                    <div>
                                        <p className="font-semibold text-slate-700">{p.fullName}</p>
                                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                                            <span>ID: {p.patientId}</span>
                                            <span>•</span>
                                            <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium">{p.visitDay}</span>
                                            <span className="text-slate-300">|</span>
                                            <span>{p.visitDate}</span>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-1 hover:bg-red-50 text-red-400 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <button
                        onClick={handleExportSession}
                        disabled={sessionPatients.length === 0}
                        className="w-full py-3 px-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Download className="w-5 h-5" />
                        <span>Export Session CSV</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50 p-4 lg:p-8 relative">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center mb-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 mr-4 bg-white rounded-lg shadow-sm border border-gray-200 text-slate-600"
                    >
                        <LayoutDashboard className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-800">MediRecord</h1>
                </div>

                {!isAddingPatient ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-50">
                        <div className="bg-white p-6 rounded-full shadow-sm">
                            <LayoutDashboard className="w-16 h-16 text-slate-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-400">Ready to Record</h2>
                            <p className="text-slate-400">Click "New Patient" to start a data entry session</p>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Header */}
                        <header className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-800">New Patient Entry</h2>
                                <p className="text-slate-500 mt-1">Fill in details and capture live sensor data</p>
                            </div>
                            <button onClick={() => resetForm(true)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </header>

                        <div className="grid grid-cols-12 gap-6">
                            {/* Left Column: Manual Entry */}
                            <div className="col-span-12 lg:col-span-7 space-y-6">
                                {/* Personal Details Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                        <UserPlus className="w-5 h-5 mr-2 text-blue-500" />
                                        Personal Details
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                Visit Details
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Interval / Phase</label>
                                                    <div className="relative">
                                                        <select
                                                            name="visitDay"
                                                            value={formData.visitDay}
                                                            onChange={handleInputChange}
                                                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                                        >
                                                            <option value="Baseline">Baseline (Day 0)</option>
                                                            <option value="Day 1">Day 1</option>
                                                            <option value="Day 2">Day 2</option>
                                                            <option value="Day 3">Day 3</option>
                                                            <option value="Day 4">Day 4</option>
                                                            <option value="Day 5">Day 5</option>
                                                            <option value="Day 6">Day 6</option>
                                                            <option value="Day 7">Day 7</option>
                                                            <option value="Week 2">Week 2</option>
                                                            <option value="Week 4">Week 4</option>
                                                            <option value="Month 1">Month 1</option>
                                                            <option value="Month 3">Month 3</option>
                                                            <option value="Follow-up">Follow-up</option>
                                                        </select>
                                                        <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-3 rotate-90 pointer-events-none" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Visit Date</label>
                                                    <input
                                                        type="date"
                                                        name="visitDate"
                                                        value={formData.visitDate}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Full Name</label>
                                            <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. John Doe" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Patient ID</label>
                                            <input type="text" name="patientId" value={formData.patientId} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="PID-0000" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Gender</label>
                                            <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Age</label>
                                            <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">BMI</label>
                                            <div className="w-full px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 font-mono">
                                                {calculateBMI()}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Height (cm)</label>
                                            <input type="number" name="height" value={formData.height} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Weight (kg)</label>
                                            <input type="number" name="weight" value={formData.weight} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <div className="col-span-2 pt-4 border-t border-slate-100 mt-2">
                                                <h4 className="text-sm font-bold text-slate-700 mb-3">Clinical Record</h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="col-span-2">
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Diabetic Status</label>
                                                        <div className="flex space-x-4">
                                                            {['No', 'Yes', 'Pre-diabetic'].map((status) => (
                                                                <label key={status} className="flex items-center space-x-2 cursor-pointer">
                                                                    <input
                                                                        type="radio"
                                                                        name="diabetic"
                                                                        value={status}
                                                                        checked={formData.diabetic === status}
                                                                        onChange={handleInputChange}
                                                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                                                                    />
                                                                    <span className="text-sm text-slate-700">{status}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">HbA1c <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                                                        <input type="number" name="hba1c" value={formData.hba1c} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="%" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Glucose (FG) <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                                                        <input type="number" name="glucose_fg" value={formData.glucose_fg} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="mg/dL" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Glucose (PG) <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                                                        <input type="number" name="glucose_pg" value={formData.glucose_pg} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="mg/dL" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Medical History Card */}
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                                        <FileText className="w-5 h-5 mr-2 text-purple-500" />
                                        Medical History
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Hypertension', key: 'hypertensive' },
                                            { label: 'Family Hypertension', key: 'family_hypertension' },
                                            { label: 'Heart Disease', key: 'cardiovascular_disease' },
                                            { label: 'Stroke History', key: 'stroke' },
                                            { label: 'Family Diabetes', key: 'family_diabetes' },
                                        ].map((item) => (
                                            <div key={item.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                <div className="flex bg-white rounded-md border border-slate-200 p-0.5">
                                                    {['No', 'Yes'].map((opt) => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setFormData(prev => ({ ...prev, [item.key]: opt }))}
                                                            className={`px-3 py-1 text-xs font-bold rounded transition-colors ${formData[item.key] === opt
                                                                ? (opt === 'Yes' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600')
                                                                : 'text-slate-400 hover:text-slate-600'
                                                                }`}
                                                        >{opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Live Data */}
                            <div className="col-span-12 lg:col-span-5 space-y-6">
                                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sticky top-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-lg font-bold text-slate-800 flex items-center">
                                            <Activity className="w-5 h-5 mr-2 text-green-500 animate-pulse" />
                                            Live Sensor Data
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                            <span className="relative flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                            </span>
                                            <span className="text-xs font-medium text-green-600">Connected</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <SensorCard
                                            icon={Heart} label="Heart Rate" value={sensorData.heartRate} unit="bpm"
                                            color={{ bg: 'bg-red-100', text: 'text-red-600' }}
                                            isCaptured={!!capturedData}
                                        />
                                        <SensorCard
                                            icon={Activity} label="BP (Sys/Dia)" value={`${sensorData.systolic || '--'}/${sensorData.diastolic || '--'}`} unit="mmHg"
                                            color={{ bg: 'bg-blue-100', text: 'text-blue-600' }}
                                            isCaptured={!!capturedData}
                                        />
                                        <SensorCard
                                            icon={Thermometer} label="Temp" value={sensorData.temperature} unit="°C"
                                            color={{ bg: 'bg-orange-100', text: 'text-orange-600' }}
                                            isCaptured={!!capturedData}
                                        />
                                        <SensorCard
                                            icon={Wind} label="SPO2" value={sensorData.spo2} unit="%"
                                            color={{ bg: 'bg-cyan-100', text: 'text-cyan-600' }}
                                            isCaptured={!!capturedData}
                                        />
                                        {/* <SensorCard
                                            icon={Droplet} label="Glucose" value={sensorData.glucose} unit="mg/dL"
                                            color={{ bg: 'bg-pink-100', text: 'text-pink-600' }}
                                            isCaptured={!!capturedData}
                                        /> */}
                                        <SensorCard
                                            icon={Zap} label="Activity" value={sensorData.activity} unit="lvl"
                                            color={{ bg: 'bg-purple-100', text: 'text-purple-600' }}
                                            isCaptured={!!capturedData}
                                        />
                                        <SensorCard
                                            icon={Droplet} label="Acetone" value={sensorData.acetone} unit="mmol/L"
                                            color={{ bg: 'bg-yellow-100', text: 'text-yellow-600' }}
                                            isCaptured={!!capturedData}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        {!capturedData ? (
                                            <button
                                                onClick={handleCapture}
                                                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-200 transition-all flex items-center justify-center space-x-2"
                                            >
                                                <Save className="w-5 h-5" />
                                                <span>Capture Current Values</span>
                                            </button>
                                        ) : (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                                <p className="text-green-700 font-medium mb-2">Values Captured Successfully</p>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => setCapturedData(null)}
                                                        className="flex-1 py-2 bg-white border border-green-200 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition"
                                                    >
                                                        Retake
                                                    </button>
                                                    <button
                                                        onClick={handleSavePatient}
                                                        disabled={!formData.fullName || !formData.patientId}
                                                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold shadow-md hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Save Record
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
