import { useState, useRef, useEffect } from 'react';
import { CalendarIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

interface DateTimePickerProps {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24h)
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export default function DateTimePicker({ date, time, onDateChange, onTimeChange }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current
  const currentDate = date ? new Date(date) : new Date();
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // format to YYYY-MM-DD
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
  };

  const handleSetToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    onDateChange(`${yyyy}-${mm}-${dd}`);
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Time handling
  const [hourStr, minuteStr] = time ? time.split(':') : ['12', '00'];
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;

  const handleHourSelect = (h12: number, ap: 'AM'|'PM') => {
    let h24 = h12;
    if (ap === 'AM' && h12 === 12) h24 = 0;
    if (ap === 'PM' && h12 < 12) h24 += 12;
    onTimeChange(`${String(h24).padStart(2, '0')}:${minuteStr}`);
  };

  const handleMinuteSelect = (m: number) => {
    let h24 = hour;
    onTimeChange(`${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="relative w-full" ref={containerRef}>
      <div 
        className="flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 font-medium cursor-pointer hover:bg-slate-100 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-slate-500" />
          <span>{date ? new Date(date).toLocaleDateString() : 'Select Date'}</span>
        </div>
        <div className="flex items-center gap-2 border-l border-slate-300 pl-4">
          <ClockIcon className="size-4 text-slate-500" />
          <span>{time ? `${hour12}:${minuteStr} ${ampm}` : 'Select Time'}</span>
        </div>
      </div>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 w-full sm:w-[460px] bg-white rounded-3xl shadow-xl border border-slate-200 z-50 p-4 animate-scale-in flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-6">
          
          {/* Calendar Section */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeftIcon className="size-5" /></button>
              <div className="font-bold text-slate-900">{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</div>
              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRightIcon className="size-5" /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                <div key={d} className="text-[10px] font-bold text-slate-400 uppercase">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = date === `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 w-full rounded-lg text-sm font-medium transition-colors flex items-center justify-center ${isSelected ? 'bg-slate-900 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={handleSetToday}
                className="w-full h-9 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                Today
              </button>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-slate-200" />

          {/* Time Scroll Section */}
          <div className="flex-1 flex gap-2 h-[260px]">
            {/* Hours */}
            <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar snap-y snap-mandatory border-r border-slate-100 pr-2 pb-[200px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 sticky top-0 bg-white/90 backdrop-blur-sm pb-1">Hour</div>
              {hours.map(h => (
                <button
                  key={h}
                  type="button"
                  onClick={() => handleHourSelect(h, ampm)}
                  className={`snap-center shrink-0 h-10 w-full rounded-xl text-lg font-bold transition-all mb-1 ${hour12 === h ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {String(h).padStart(2, '0')}
                </button>
              ))}
            </div>
            {/* Minutes */}
            <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar snap-y snap-mandatory border-r border-slate-100 px-2 pb-[200px]">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2 sticky top-0 bg-white/90 backdrop-blur-sm pb-1">Min</div>
              {minutes.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMinuteSelect(m)}
                  className={`snap-center shrink-0 h-10 w-full rounded-xl text-lg font-bold transition-all mb-1 ${parseInt(minuteStr, 10) === m ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {String(m).padStart(2, '0')}
                </button>
              ))}
            </div>
            {/* AM/PM */}
            <div className="w-16 flex flex-col gap-2 pt-6 pl-2">
              <button type="button" onClick={() => handleHourSelect(hour12, 'AM')} className={`h-12 w-full rounded-xl font-bold transition-all ${ampm === 'AM' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>AM</button>
              <button type="button" onClick={() => handleHourSelect(hour12, 'PM')} className={`h-12 w-full rounded-xl font-bold transition-all ${ampm === 'PM' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>PM</button>
            </div>
          </div>
          </div>

          <div className="border-t border-slate-100 pt-3 flex justify-end">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="px-8 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-md transition-all hover:bg-slate-800 hover:-translate-y-0.5 active:translate-y-0"
            >
              Done
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
