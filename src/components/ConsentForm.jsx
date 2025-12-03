import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckSquare, X } from 'lucide-react';

const ConsentForm = ({ onConsent, onCancel }) => {
    const [agreed, setAgreed] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (agreed) {
            onConsent();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-blue-700 p-6 text-white shrink-0">
                    <div className="flex items-center space-x-3">
                        <ShieldCheck className="w-8 h-8" />
                        <div>
                            <h1 className="text-xl font-bold">Participant Consent Form</h1>
                            <p className="text-blue-100 text-sm">Health Monitoring & Diabetes Prediction Study</p>
                        </div>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                        <p className="text-blue-900 font-medium">
                            You are invited to participate in a Health Monitoring test using an IoT-based portable device that records your vital parameters for Diabetes Prediction.
                        </p>
                    </div>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-blue-600" />
                            Purpose of the Study
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                            This data will be used for the research project: <br />
                            <span className="font-semibold text-gray-800">“Intelligent Healthcare System for Vital Monitoring and Diabetes Detection Using Machine Learning.”</span>
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-800">Data Collected</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                            <li><span className="font-semibold text-gray-700">Vital signs:</span> heart rate, SpO₂, temperature, blood pressure, glucose/acetone level, activity</li>
                            <li><span className="font-semibold text-gray-700">Clinical data:</span> HbA1c, glucose level</li>
                            <li><span className="font-semibold text-gray-700">Demographics:</span> age, gender, height, weight</li>
                            <li><span className="font-semibold text-gray-700">Medical history</span> and lifestyle information</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h3 className="text-lg font-bold text-gray-800">Use of Data</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-600 ml-2">
                            <li>Academic research and data analysis</li>
                            <li>Machine learning model development and validation</li>
                            <li>No personal identity will be disclosed; data will be securely stored and used only for research purposes.</li>
                        </ul>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Voluntary Participation</h4>
                            <p className="text-sm text-gray-600">Your participation is voluntary. You may stop at any time.</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-bold text-gray-800 mb-2">Privacy & Confidentiality</h4>
                            <p className="text-sm text-gray-600">Your data will remain confidential, and no personal identifiers will be shared outside the research team.</p>
                        </div>
                    </section>

                    <div className="border-t border-gray-200 pt-6">
                        <p className="font-semibold text-gray-800 mb-4">By proceeding, you confirm that:</p>
                        <ul className="space-y-2 text-gray-600 mb-6">
                            <li className="flex items-start">
                                <CheckSquare className="w-5 h-5 mr-2 text-green-500 shrink-0" />
                                You have read and understood this information
                            </li>
                            <li className="flex items-start">
                                <CheckSquare className="w-5 h-5 mr-2 text-green-500 shrink-0" />
                                You voluntarily agree to participate
                            </li>
                            <li className="flex items-start">
                                <CheckSquare className="w-5 h-5 mr-2 text-green-500 shrink-0" />
                                You consent to the collection of your demographic, clinical, and vital data for research
                            </li>
                        </ul>

                        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <label className="flex items-start space-x-3 cursor-pointer mb-6 group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                    />
                                    <div className="w-6 h-6 border-2 border-gray-400 rounded peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors"></div>
                                    <CheckSquare className="w-4 h-4 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <span className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors">
                                    I agree to participate in this research study and consent to data collection.
                                </span>
                            </label>

                            <div className="flex space-x-4">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 hover:border-gray-400 transition flex items-center justify-center"
                                >
                                    <X className="w-5 h-5 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!agreed}
                                    className={`flex-1 py-3 rounded-lg font-bold text-white shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center ${agreed
                                            ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                                            : 'bg-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    <CheckSquare className="w-5 h-5 mr-2" />
                                    Start Test
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConsentForm;
