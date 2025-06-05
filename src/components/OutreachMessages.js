import React from 'react';

export default function OutreachMessages({ messages = [], prospectName }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <h2 className="text-lg font-semibold mb-1">📧 Personalized Outreach Messages</h2>
      <p className="text-sm text-gray-600 mb-4">
        AI-generated messages tailored for <strong>{prospectName}</strong> based on their profile and role.
      </p>

      {messages.length === 0 && (
        <p className="text-gray-400 italic">No outreach messages available.</p>
      )}

      {messages.map((msg, idx) => (
        <div
          key={idx}
          className="border rounded-lg p-4 mb-4 bg-gray-50 hover:bg-gray-100 transition"
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-gray-800">From: {msg.sender}</p>
              <p className="text-xs text-gray-500">{msg.focus}</p>
              <p className="font-medium mt-2">
                <span className="text-gray-600">Subject:</span> {msg.subject}
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(msg.message)}
              className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700 transition"
            >
              📋 Copy
            </button>
          </div>
          <div className="mt-3 text-sm text-gray-800 whitespace-pre-wrap">
            {msg.message ? msg.message : '⚠️ No message content available.'}
          </div>
        </div>
      ))}
    </div>
  );
}
