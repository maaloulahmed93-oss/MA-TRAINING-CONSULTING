import React, { useEffect, useMemo, useState } from 'react';
import { AdminNotification, getNotifications, clearNotifications, markAllRead, subscribeNotifications } from '../data/adminNotifications';

const NotificationsPage: React.FC = () => {
  const [rows, setRows] = useState<AdminNotification[]>(getNotifications());

  useEffect(() => {
    const unsub = subscribeNotifications((all) => setRows(all));
    return () => unsub();
  }, []);

  const unread = useMemo(() => rows.filter(r => !r.isRead).length, [rows]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { markAllRead(); setRows([...getNotifications()]); }}
            className="px-3 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Marquer tout comme lu
          </button>
          <button
            onClick={() => { clearNotifications(); setRows([...getNotifications()]); }}
            className="px-3 py-2 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Vider
          </button>
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-600">Non lus: <span className="font-medium">{unread}</span></div>

      <div className="overflow-x-auto bg-white shadow-sm ring-1 ring-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-500 text-sm">Aucune notification</td>
              </tr>
            )}
            {rows.map((n) => (
              <tr key={n.id} className={n.isRead ? '' : 'bg-yellow-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{n.title}</td>
                <td className="px-4 py-3 text-sm text-gray-700 max-w-xl">
                  <div className="line-clamp-2">{n.message}</div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${n.type === 'job' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {n.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{new Date(n.date).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-sm">
                  <a
                    href={n.actionUrl || '#'}
                    className="text-blue-600 hover:text-blue-800"
                  >Voir</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsPage;
