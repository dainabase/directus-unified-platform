// src/frontend/src/portals/superadmin/marketing/components/ContentCalendar.jsx
import React, { useState } from 'react';
import {
  Calendar, ChevronLeft, ChevronRight, Plus, Edit2,
  Mail, FileText, Image, Video, MessageSquare
} from 'lucide-react';

const CONTENT_TYPES = {
  email: { icon: Mail, color: 'primary', label: 'Email' },
  blog: { icon: FileText, color: 'success', label: 'Article' },
  social: { icon: Image, color: 'info', label: 'Social' },
  video: { icon: Video, color: 'danger', label: 'Video' },
  newsletter: { icon: MessageSquare, color: 'warning', label: 'Newsletter' }
};

// Mock content items
const mockContent = [
  { id: 1, title: 'Newsletter Decembre', type: 'newsletter', date: '2024-12-15', status: 'scheduled' },
  { id: 2, title: 'Article SEO: Guide 2025', type: 'blog', date: '2024-12-16', status: 'draft' },
  { id: 3, title: 'Promo LinkedIn', type: 'social', date: '2024-12-17', status: 'published' },
  { id: 4, title: 'Email Nouveaux Clients', type: 'email', date: '2024-12-18', status: 'scheduled' },
  { id: 5, title: 'Video Temoignage Client', type: 'video', date: '2024-12-20', status: 'draft' },
  { id: 6, title: 'Post Instagram', type: 'social', date: '2024-12-14', status: 'published' },
  { id: 7, title: 'Campagne Voeux', type: 'email', date: '2024-12-24', status: 'scheduled' }
];

const ContentCalendar = ({ selectedCompany }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getContentForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return mockContent.filter(c => c.date === dateStr);
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('fr-CH', { month: 'long', year: 'numeric' });
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDay) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const day = i - startingDay + 1;
      const isValidDay = day > 0 && day <= daysInMonth;
      const content = isValidDay ? getContentForDate(day) : [];

      days.push(
        <div
          key={i}
          className={`calendar-cell border p-2 ${
            isValidDay ? 'cursor-pointer hover-bg-light' : 'bg-light'
          } ${isToday(day) ? 'bg-primary-lt' : ''}`}
          style={{ minHeight: '100px', cursor: isValidDay ? 'pointer' : 'default' }}
          onClick={() => isValidDay && setSelectedDate(day)}
        >
          {isValidDay && (
            <>
              <div className={`fw-bold mb-1 ${isToday(day) ? 'text-primary' : ''}`}>
                {day}
              </div>
              <div className="d-flex flex-column gap-1">
                {content.slice(0, 3).map(item => {
                  const typeInfo = CONTENT_TYPES[item.type];
                  const Icon = typeInfo.icon;
                  return (
                    <div
                      key={item.id}
                      className={`badge bg-${typeInfo.color}-lt text-${typeInfo.color} text-truncate w-100`}
                      style={{ fontSize: '10px' }}
                      title={item.title}
                    >
                      <Icon size={10} className="me-1" />
                      {item.title}
                    </div>
                  );
                })}
                {content.length > 3 && (
                  <small className="text-muted">+{content.length - 3} de plus</small>
                )}
              </div>
            </>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div>
      {/* Calendar Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-outline-secondary btn-sm" onClick={prevMonth}>
            <ChevronLeft size={16} />
          </button>
          <h4 className="mb-0 text-capitalize">{formatMonth(currentDate)}</h4>
          <button className="btn btn-outline-secondary btn-sm" onClick={nextMonth}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>
            Aujourd'hui
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
            <Plus size={14} className="me-1" />
            Nouveau contenu
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="d-flex gap-3 mb-3">
        {Object.entries(CONTENT_TYPES).map(([key, value]) => {
          const Icon = value.icon;
          return (
            <div key={key} className="d-flex align-items-center">
              <span className={`badge bg-${value.color}-lt text-${value.color} me-1`}>
                <Icon size={12} />
              </span>
              <small>{value.label}</small>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="card">
        <div className="card-body p-0">
          {/* Week Headers */}
          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="text-center py-2 border bg-light fw-medium">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {renderCalendar()}
          </div>
        </div>
      </div>

      {/* Selected Day Panel */}
      {selectedDate && (
        <div className="card mt-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              Contenu du {selectedDate} {formatMonth(currentDate)}
            </h5>
            <button className="btn-close" onClick={() => setSelectedDate(null)}></button>
          </div>
          <div className="card-body">
            {getContentForDate(selectedDate).length > 0 ? (
              <div className="list-group list-group-flush">
                {getContentForDate(selectedDate).map(item => {
                  const typeInfo = CONTENT_TYPES[item.type];
                  const Icon = typeInfo.icon;
                  return (
                    <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <span className={`avatar bg-${typeInfo.color}-lt text-${typeInfo.color} me-3`}>
                          <Icon size={20} />
                        </span>
                        <div>
                          <h6 className="mb-0">{item.title}</h6>
                          <small className="text-muted">{typeInfo.label}</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className={`badge ${
                          item.status === 'published' ? 'bg-success' :
                          item.status === 'scheduled' ? 'bg-warning' : 'bg-secondary'
                        }`}>
                          {item.status === 'published' ? 'Publie' :
                           item.status === 'scheduled' ? 'Planifie' : 'Brouillon'}
                        </span>
                        <button className="btn btn-sm btn-ghost-primary">
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                Aucun contenu planifie pour cette date
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentCalendar;
