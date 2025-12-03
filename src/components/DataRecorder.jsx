import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import Papa from 'papaparse';
import { Activity, Heart, Thermometer, Droplet, Wind, Save, Download, LogOut } from 'lucide-react';

const DataRecorder = ({ patientData, onLogout }) => {
    const [sensorData, setSensorData] = useState(null);
    const [recordedData, setRecordedData] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [sessionStartTime] = useState(new Date().toISOString());

    useEffect(() => {
        const sensorRef = ref(db, 'sensor');
        const unsubscribe = onValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Handle nested or flat structure
                const values = typeof Object.values(data)[0] === 'object'
                    ? Object.values(data)[0]
                    : data;
                setSensorData(values);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRecordSnapshot = () => {
        if (!sensorData) return;

        const snapshot = {
            timestamp: new Date().toISOString(),
            patientId: patientData.patientId,
            patientName: patientData.fullName,
            ...sensorData
        };

        setRecordedData(prev => [...prev, snapshot]);
    };

    const handleExportCSV = () => {
        if (recordedData.length === 0) return;

        const csv = Papa.unparse(recordedData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `patient_data_${patientData.patientId}_${new Date().getTime()}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SensorCard = ({ icon: Icon, label, value, unit, color }) => (
        <div className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color} flex items-center space-x-4`}>
            <div className={`p-3 rounded-full ${color.replace('border-', 'bg-').replace('500', '100')}`}>
                <Icon className={`w-8 h-8 ${color.replace('border-', 'text-')}`} />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium uppercase">{label}</p>
                <p className="text-2xl font-bold text-gray-800">
                    {value !== undefined ? value : '--'} <span className="text-sm text-gray-400 font-normal">{unit}</span>
                </p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <header className="bg-white shadow-sm rounded-xl p-4 mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Live Data Monitor</h1>
                    <p className="text-gray-500">
                        Patient: <span className="font-semibold text-blue-600">{patientData.fullName}</span> (ID: {patientData.patientId})
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition"
                >
                    <LogOut className="w-5 h-5" />
                    <span>End Session</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <SensorCard
                    icon={Heart}
                    label="Heart Rate"
                    value={sensorData?.heartRate}
                    unit="bpm"
                    color="border-red-500"
                />
                <SensorCard
                    icon={Activity}
                    label="Blood Pressure"
                    value={`${sensorData?.systolic || '--'}/${sensorData?.diastolic || '--'}`}
                    unit="mmHg"
                    color="border-blue-500"
                />
                <SensorCard
                    icon={Thermometer}
                    label="Temperature"
                    value={sensorData?.temperature}
                    unit="°C"
                    color="border-orange-500"
                />
                <SensorCard
                    icon={Wind}
                    label="SPO2"
                    value={sensorData?.spo2}
                    unit="%"
                    color="border-cyan-500"
                />
                <SensorCard
                    icon={Droplet}
                    label="Glucose"
                    value={sensorData?.glucose}
                    unit="mg/dL"
                    color="border-pink-500"
                />
                {/* Add more cards as needed based on sensor data structure */}
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <Save className="w-6 h-6 mr-2 text-blue-600" />
                        Recorded Snapshots ({recordedData.length})
                    </h2>
                    <div className="space-x-4">
                        <button
                            onClick={handleRecordSnapshot}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-green-700 transition flex items-center space-x-2"
                        >
                            <Activity className="w-5 h-5" />
                            <span>Record Snapshot</span>
                        </button>
                        <button
                            onClick={handleExportCSV}
                            disabled={recordedData.length === 0}
                            className={`px-6 py-2 rounded-lg font-semibold shadow transition flex items-center space-x-2 ${recordedData.length > 0
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <Download className="w-5 h-5" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider">
                                <th className="p-4 border-b">Timestamp</th>
                                <th className="p-4 border-b">Heart Rate</th>
                                <th className="p-4 border-b">BP (Sys/Dia)</th>
                                <th className="p-4 border-b">Temp</th>
                                <th className="p-4 border-b">SPO2</th>
                                <th className="p-4 border-b">Glucose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recordedData.map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition">
                                    <td className="p-4 text-gray-600">{new Date(row.timestamp).toLocaleTimeString()}</td>
                                    <td className="p-4 font-medium">{row.heartRate}</td>
                                    <td className="p-4">{row.systolic}/{row.diastolic}</td>
                                    <td className="p-4">{row.temperature}</td>
                                    <td className="p-4">{row.spo2}</td>
                                    <td className="p-4">{row.glucose}</td>
                                </tr>
                            ))}
                            {recordedData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-400">
                                        No data recorded yet. Click "Record Snapshot" to save current readings.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataRecorder;
