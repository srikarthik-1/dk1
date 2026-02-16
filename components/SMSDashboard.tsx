
import React from 'react';
import type { SMSLog } from '../types';

interface SMSLogViewerProps {
  smsLogs: SMSLog[];
}

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white border border-neutral-200 p-6 transition-colors hover:border-neutral-300 ${className}`}>
        {children}
    </div>
);

export const SMSLogViewer: React.FC<SMSLogViewerProps> = ({ smsLogs }) => {
  return (
    <Card>
      <h3 className="text-2xl text-black">Automated SMS Log</h3>
      <p className="text-neutral-500 mt-1">History of all automated messages sent to customers.</p>
      
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="table-header">Timestamp</th>
              <th className="table-header">Recipient</th>
              <th className="table-header">Message</th>
              <th className="table-header text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {smsLogs.length > 0 ? smsLogs.map((log) => (
              <tr key={log.date} className="border-b border-neutral-200 last:border-b-0">
                <td className="table-cell text-xs text-neutral-500 whitespace-nowrap">
                  {new Date(log.date).toLocaleString()}
                </td>
                <td className="table-cell">
                  <p className="font-semibold text-black">{log.recipientName}</p>
                  <p className="text-xs text-neutral-500 font-mono">{log.recipientMobile}</p>
                </td>
                <td className="table-cell text-sm text-neutral-700 max-w-sm">
                  <p>{log.message}</p>
                </td>
                <td className="table-cell text-right">
                    <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">
                        {log.status}
                    </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="text-center py-12 text-neutral-400">
                  No SMS logs found. <br/> Perform a transaction to generate a log.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
