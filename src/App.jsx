import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BarChart3, ChevronLeft, ChevronRight, Save, Eye, User } from 'lucide-react';

const ShiftManagementApp = () => {
  const [currentView, setCurrentView] = useState('employee-select');
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [monthlyShifts, setMonthlyShifts] = useState({});
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [customStartTime, setCustomStartTime] = useState('09:00');
  const [customEndTime, setCustomEndTime] = useState('17:00');
  const [showRules, setShowRules] = useState(false);

 const [employees, setEmployees] = useState([]);
const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
const [systemSettings, setSystemSettings] = useState(null);

  // Google Sheetsから従業員データを取得
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const response = await fetch('https://script.google.com/macros/s/AKfycbxOnFb08nprh73C4LeNNpyILYPeojZEQX_ypaERlCN4myKspZ_GYffyWbJdbwwcpNEscQ/exec');
        const result = await response.json();
        
     if (result.success) {
  setEmployees(result.employees);
  setSystemSettings(result.systemSettings);
} else {
          console.error('従業員データ取得エラー:', result.message);
          // フォールバック: 最小限のテストデータ
          setEmployees([
            { id: 'test', name: 'テストユーザー', contractTime: '09:00-17:00' }
          ]);
        }
      } catch (error) {
        console.error('通信エラー:', error);
        // フォールバック: 最小限のテストデータ
        setEmployees([
          { id: 'test', name: 'テストユーザー', contractTime: '09:00-17:00' }
        ]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };
    
    fetchEmployees();
  }, []);

  const shiftTypes = [
    { id: 'normal', name: '通常勤務', time: '09:00-17:00', color: 'bg-blue-500' },
    { id: 'contract', name: '契約時間', time: '', color: 'bg-green-500' },
    { id: 'custom', name: '自由時間', time: '', color: 'bg-purple-500' },
    { id: 'off', name: '休み', time: '', color: 'bg-gray-400' }
  ];

  const timeOptions = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeOptions.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }

const isInputPeriodValid = () => {
  if (!systemSettings) return true;
  
  const now = new Date();
  const currentDate = now.getDate();
  
  return currentDate >= systemSettings.inputStartDate && 
         currentDate <= systemSettings.inputEndDate;
};

  const getInputPeriodMessage = () => {
  if (!systemSettings) return "設定読み込み中...";
  
  const now = new Date();
  const currentDate = now.getDate();
  
  if (isInputPeriodValid()) {
    return `入力期間中です（${systemSettings.inputStartDate}日〜${systemSettings.inputEndDate}日）`;
  } else {
    return `入力期間外です（${systemSettings.inputStartDate}日〜${systemSettings.inputEndDate}日に入力可能）`;
  }
};

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getShiftForDate = (date) => {
    const dateStr = formatDate(date);
    const employeeId = currentEmployee?.id;
    return monthlyShifts[`${employeeId}-${dateStr}`];
  };

const setShiftForDate = (date, shiftType, startTime = '', endTime = '') => {
  const dateStr = formatDate(date);
  const employeeId = currentEmployee?.id;
  const key = `${employeeId}-${dateStr}`;
  
  console.log('=== setShiftForDate デバッグ ===');
  console.log('日付:', dateStr);
  console.log('シフトタイプ:', shiftType);
  console.log('開始時間:', startTime);
  console.log('終了時間:', endTime);
  console.log('キー:', key);
  
  const shiftData = { type: shiftType, startTime, endTime, date: dateStr, employee: currentEmployee.name };
  console.log('保存するシフトデータ:', shiftData);
  
  setMonthlyShifts(prev => ({
    ...prev,
    [key]: shiftData
  }));
  console.log('=== setShiftForDate 終了 ===');
};

  const handleEmployeeSelect = (employee) => {
    setCurrentEmployee(employee);
    setCurrentView('input');
  };

const handleShiftTypeSelect = (date, shiftType) => {
  console.log('=== handleShiftTypeSelect デバッグ ===');
  console.log('選択されたシフトタイプ:', shiftType);
  console.log('現在の従業員:', currentEmployee);
  
  if (shiftType === 'normal') {
    setShiftForDate(date, shiftType, '09:00', '17:00');
    console.log('通常勤務を設定: 09:00-17:00');
  } else if (shiftType === 'contract') {
    const [start, end] = currentEmployee.contractTime.split('-');
    console.log('契約時間を分割:', start, '-', end);
    setShiftForDate(date, shiftType, start, end);
    console.log('契約シフトを設定:', start, '-', end);
  } else if (shiftType === 'off') {
    setShiftForDate(date, shiftType);
    console.log('休みを設定');
  } else if (shiftType === 'custom') {
    setSelectedDate(date);
    setShowTimeModal(true);
    console.log('カスタム時間モーダルを表示');
  }
  console.log('=== デバッグ終了 ===');
};

  const handleCustomTimeSubmit = () => {
    if (customStartTime >= customEndTime) {
      alert('終了時間は開始時間より後に設定してください');
      return;
    }
    
    setShiftForDate(selectedDate, 'custom', customStartTime, customEndTime);
    setShowTimeModal(false);
    setSelectedDate(null);
  };

  const cancelCustomTime = () => {
    setShowTimeModal(false);
    setSelectedDate(null);
  };

const calculateTotalHours = (employeeId) => {
  let totalMinutes = 0;
  console.log('=== calculateTotalHours デバッグ ===');
  console.log('employeeId:', employeeId);
  console.log('employees:', employees);
  console.log('monthlyShifts:', monthlyShifts);
  
  Object.values(monthlyShifts).forEach(shift => {
    console.log('処理中のシフト:', shift);
    
    // 対象の従業員で、休み以外のシフトを対象にする
    if (shift.employee === employees.find(e => e.id === employeeId)?.name && 
        shift.type !== 'off') {
      
      let startTime = '';
      let endTime = '';
      
      console.log('対象シフト見つかりました:', shift.type);
      
      // シフトタイプに応じて時間を設定
      if (shift.type === 'normal') {
        startTime = '09:00';
        endTime = '17:00';
        console.log('通常勤務:', startTime, '-', endTime);
      } else if (shift.type === 'contract') {
        // 契約時間の場合は、従業員の契約時間を使用
        const employee = employees.find(e => e.id === employeeId);
        console.log('契約シフト - 従業員情報:', employee);
        if (employee && employee.contractTime) {
          [startTime, endTime] = employee.contractTime.split('-');
          console.log('契約時間:', startTime, '-', endTime);
        }
      } else if (shift.type === 'custom') {
        startTime = shift.startTime;
        endTime = shift.endTime;
        console.log('自由時間:', startTime, '-', endTime);
      }
      
// 時間計算
if (startTime && endTime) {
  // 時間フォーマットを統一 (HH:MM形式に変換)
  const formatTime = (time) => {
    const parts = time.split(':');
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1] || '00';
    return `${hours}:${minutes.padStart(2, '0')}`;
  };
  
  const formattedStart = formatTime(startTime);
  const formattedEnd = formatTime(endTime);
  
  console.log('フォーマット前:', startTime, '-', endTime);
  console.log('フォーマット後:', formattedStart, '-', formattedEnd);
  
  const start = new Date(`2000-01-01T${formattedStart}`);
  const end = new Date(`2000-01-01T${formattedEnd}`);
  
  console.log('Date オブジェクト:', start, end);
  
  const diffMinutes = (end - start) / (1000 * 60);
  console.log('計算結果:', diffMinutes, '分');
  if (!isNaN(diffMinutes) && diffMinutes > 0) {
    totalMinutes += diffMinutes;
  }
}
    }
  });
  const hours = totalMinutes / 60;
  console.log('合計:', hours, '時間');
  console.log('=== デバッグ終了 ===');
  return isNaN(hours) ? 0 : Math.round(hours * 10) / 10;
};

  const submitMonthlyShift = () => {
    const employeeShifts = Object.values(monthlyShifts).filter(
      shift => shift.employee === currentEmployee.name
    );
    
    if (employeeShifts.length === 0) {
      alert('シフトを入力してください');
      return;
    }

    setCurrentView('confirm');
  };

const confirmSubmit = async () => {
  const employeeShifts = Object.values(monthlyShifts).filter(
    shift => shift.employee === currentEmployee.name
  );

  try {
const shiftData = {
  employeeId: currentEmployee.id,
  shifts: employeeShifts.map(shift => ({
    date: shift.date,
    type: shift.type,
    startTime: shift.startTime,
    endTime: shift.endTime
  }))
};

const params = new URLSearchParams({
  method: 'POST',
  data: JSON.stringify(shiftData)
});

const response = await fetch(`https://script.google.com/macros/s/AKfycbxOnFb08nprh73C4LeNNpyILYPeojZEQX_ypaERlCN4myKspZ_GYffyWbJdbwwcpNEscQ/exec?${params}`, {
  method: 'GET'
});

    const result = await response.json();
    
    if (result.success) {
      alert(`${currentEmployee.name}さんの月間シフトが登録されました！`);
      setCurrentView('employee-select');
      setCurrentEmployee(null);
      const newShifts = employeeShifts.map(shift => ({
        id: Date.now() + Math.random(),
        employee: shift.employee,
        date: shift.date,
        startTime: shift.startTime || '',
        endTime: shift.endTime || '',
        type: shift.type
      }));
      setShifts(prev => [...prev.filter(s => s.employee !== currentEmployee.name), ...newShifts]);
    } else {
      alert('エラーが発生しました: ' + result.message);
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('通信エラーが発生しました');
  }
};

  const cancelSubmit = () => {
    setCurrentView('input');
  };

  const renderTimeModal = () => {
    if (!showTimeModal) return null;
    
    const dateObj = new Date(selectedDate);
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][dateObj.getDay()];
    
    const calculateHours = () => {
      const start = new Date(`2000-01-01T${customStartTime}`);
      const end = new Date(`2000-01-01T${customEndTime}`);
      const hours = (end - start) / (1000 * 60 * 60);
      return hours > 0 ? `${hours}時間` : '時間が正しくありません';
    };
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {dateObj.getDate()}日({dayOfWeek}) 勤務時間設定
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                開始時間
              </label>
              <select
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                終了時間
              </label>
              <select
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timeOptions.map(time => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              勤務時間: {calculateHours()}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={cancelCustomTime}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleCustomTimeSubmit}
              className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              設定
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRulesModal = () => {
    if (!showRules) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            シフトタイプ説明
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-blue-500 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-800">通常勤務</div>
                <div className="text-sm text-gray-600">9:00-17:00の固定勤務</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-green-500 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-800">契約時間</div>
                <div className="text-sm text-gray-600">あなたの契約時間での勤務</div>
                <div className="text-xs text-gray-500">({currentEmployee?.contractTime})</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-purple-500 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-800">自由時間</div>
                <div className="text-sm text-gray-600">開始・終了時間を自由に設定</div>
                <div className="text-xs text-gray-500">(6:00-23:30の間で30分刻み)</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-4 h-4 bg-gray-400 rounded mt-1"></div>
              <div>
                <div className="font-medium text-gray-800">休み</div>
                <div className="text-sm text-gray-600">勤務なし</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowRules(false)}
            className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    );
  };

const renderEmployeeSelect = () => (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <User className="text-blue-600" size={24} />
        <h2 className="text-xl font-bold text-gray-800">従業員選択</h2>
      </div>
      
      {isLoadingEmployees ? (
        <div className="text-center py-8">
          <div className="text-gray-500">従業員データを読み込み中...</div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-8 text-red-500">
          従業員データが見つかりません
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map(employee => (
            <button
              key={employee.id}
              onClick={() => handleEmployeeSelect(employee)}
              className="w-full p-4 text-left bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
            >
              <div className="font-semibold text-gray-800">{employee.name}</div>
              <div className="text-sm text-gray-600">契約時間: {employee.contractTime}</div>
              {employee.department && (
                <div className="text-xs text-gray-500">所属: {employee.department}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderCalendarInput = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const firstDayOfWeek = days[0].getDay();

    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentView('employee-select')}
            className="text-blue-600 text-sm"
          >
            ← 従業員選択に戻る
          </button>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-800">
              {currentEmployee?.name}
            </div>
            <div className="text-sm text-gray-600">
              契約時間: {currentEmployee?.contractTime}
            </div>
          </div>
        </div>

        {isInputPeriodValid() && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg">
            <p className="text-sm text-green-800">
              {getInputPeriodMessage()}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-gray-800">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </h2>
          <button
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="mb-4 flex justify-center">
          <button
            onClick={() => setShowRules(true)}
            className="text-xs text-blue-600 hover:text-blue-800 underline"
          >
            シフトタイプの説明を見る
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array(firstDayOfWeek).fill(null).map((_, index) => (
            <div key={`empty-${index}`} className="h-44"></div>
          ))}
          
          {days.map(day => {
            const shift = getShiftForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={day.toISOString()}
                className={`h-44 border border-gray-200 rounded-lg p-1 ${
                  isToday ? 'ring-2 ring-blue-400' : ''
                }`}
              >
                <div className="text-xs font-medium text-gray-600 mb-1">
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {shiftTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => handleShiftTypeSelect(day, type.id)}
                      className={`w-full text-xs py-1 px-1 rounded text-white ${
                        shift?.type === type.id ? type.color : 'bg-gray-300'
                      }`}
                    >
                      {type.name === '契約時間' ? '契約' : 
                       type.name === '通常勤務' ? '通常' :
                       type.name === '自由時間' ? '自由' : '休み'}
                    </button>
                  ))}
                  {/* 自由時間の場合は時刻表示 */}
                  {shift?.type === 'custom' && shift.startTime && shift.endTime && (
                    <div className="text-xs text-gray-700 px-1 text-center bg-gray-100 rounded py-0.5 mt-1">
                      {shift.startTime}-{shift.endTime}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">今月の予定労働時間</h3>
          <div className="text-2xl font-bold text-blue-600">
            {calculateTotalHours(currentEmployee?.id)}時間
          </div>
        </div>

        <button
          onClick={submitMonthlyShift}
          className="w-full mt-4 py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          <Eye size={20} />
          確認画面へ
        </button>
      </div>
    );
  };

  const renderConfirmScreen = () => {
    const employeeShifts = Object.values(monthlyShifts).filter(
      shift => shift.employee === currentEmployee.name
    );

    const sortedShifts = employeeShifts.sort((a, b) => new Date(a.date) - new Date(b.date));

    const getShiftTypeDisplay = (shift) => {
      switch (shift.type) {
        case 'normal':
          return { name: '通常勤務', time: '09:00-17:00', color: 'bg-blue-500' };
        case 'contract':
          return { name: '契約時間', time: `${shift.startTime}-${shift.endTime}`, color: 'bg-green-500' };
        case 'custom':
          return { name: '自由時間', time: `${shift.startTime}-${shift.endTime}`, color: 'bg-purple-500' };
        case 'off':
          return { name: '休み', time: '', color: 'bg-gray-400' };
        default:
          return { name: '未設定', time: '', color: 'bg-gray-300' };
      }
    };

    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-6">
          <Eye className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">シフト確認</h2>
        </div>

        <div className="mb-6">
          <div className="text-lg font-semibold text-gray-800 mb-2">
            {currentEmployee?.name}さんのシフト
          </div>
          <div className="text-sm text-gray-600 mb-4">
            {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedShifts.map((shift, index) => {
              const shiftDisplay = getShiftTypeDisplay(shift);
              // 日付のズレを修正：UTC時間として正しく解釈
              const [year, month, day] = shift.date.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-700">
                      {date.getMonth() + 1}月{date.getDate()}日({dayOfWeek})
                    </div>
                    <div className={`px-2 py-1 rounded text-white text-xs ${shiftDisplay.color}`}>
                      {shiftDisplay.name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {shiftDisplay.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">月間労働時間</h3>
          <div className="text-2xl font-bold text-blue-600">
            {calculateTotalHours(currentEmployee?.id)}時間
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            この内容でシフトを提出してもよろしいですか？
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={cancelSubmit}
            className="flex-1 py-3 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            いいえ（修正する）
          </button>
          <button
            onClick={confirmSubmit}
            className="flex-1 py-3 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            はい（提出する）
          </button>
        </div>
      </div>
    );
  };

  const renderGanttChart = () => {
    const shiftsByDate = {};
    shifts.forEach(shift => {
      if (!shiftsByDate[shift.date]) {
        shiftsByDate[shift.date] = [];
      }
      shiftsByDate[shift.date].push(shift);
    });

    const dates = Object.keys(shiftsByDate).sort();
    const timeSlots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }

    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const getShiftWidth = (startTime, endTime) => {
      if (!startTime || !endTime) return 0;
      const start = timeToMinutes(startTime);
      const end = timeToMinutes(endTime);
      return ((end - start) / 30) * 20;
    };

    const getShiftLeft = (startTime) => {
      if (!startTime) return 0;
      const start = timeToMinutes(startTime);
      const baseTime = timeToMinutes('06:00');
      return ((start - baseTime) / 30) * 20;
    };

    return (
      <div className="p-4 bg-white rounded-lg shadow-lg overflow-x-auto">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="text-green-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">シフト管理画面</h2>
        </div>

        {dates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            シフトデータがありません
          </div>
        ) : (
          <div className="space-y-6">
            {dates.map(date => (
              <div key={date} className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {(() => {
                    // 日付のズレを修正：UTC時間として正しく解釈
                    const [year, month, day] = date.split('-').map(Number);
                    const dateObj = new Date(year, month - 1, day);
                    return dateObj.toLocaleDateString('ja-JP', { 
                      month: 'long', 
                      day: 'numeric',
                      weekday: 'short'
                    });
                  })()}
                </h3>
                
                <div className="flex items-center mb-2">
                  <div className="w-32 text-sm font-medium text-gray-600"></div>
                  <div className="flex-1 flex relative min-w-max">
                    {timeSlots.filter((_, index) => index % 2 === 0).map(time => (
                      <div key={time} className="w-10 text-xs text-gray-500 text-center">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {shiftsByDate[date].map(shift => (
                    <div key={shift.id} className="flex items-center">
                      <div className="w-32 text-sm text-gray-700 truncate pr-2">
                        {shift.employee}
                      </div>
                      <div className="flex-1 relative h-8 bg-gray-100 rounded min-w-max">
                        {shift.startTime && shift.endTime ? (
                          <div
                            className="absolute top-1 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center"
                            style={{
                              left: `${getShiftLeft(shift.startTime)}px`,
                              width: `${getShiftWidth(shift.startTime, shift.endTime)}px`
                            }}
                          >
                            <span className="truncate px-1">
                              {shift.startTime}-{shift.endTime}
                            </span>
                          </div>
                        ) : (
                          <div className="absolute top-1 h-6 bg-gray-400 rounded text-white text-xs flex items-center justify-center left-0 w-12">
                            休み
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-4">従業員別月間労働時間</h3>
          <div className="grid grid-cols-2 gap-4">
            {employees.map(employee => {
              const totalHours = calculateTotalHours(employee.id);
              return (
                <div key={employee.id} className="text-sm">
                  <span className="font-medium">{employee.name}</span>: {totalHours}時間
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="text-blue-600" size={24} />
              シフト管理システム
            </h1>
            {currentView !== 'employee-select' && currentView !== 'confirm' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('input')}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    currentView === 'input' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar size={16} />
                  シフト入力
                </button>
                <button
                  onClick={() => setCurrentView('chart')}
                  className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                    currentView === 'chart' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Eye size={16} />
                  管理画面
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {currentView === 'employee-select' && renderEmployeeSelect()}
        {currentView === 'input' && renderCalendarInput()}
        {currentView === 'confirm' && renderConfirmScreen()}
        {currentView === 'chart' && renderGanttChart()}
        {renderTimeModal()}
        {renderRulesModal()}
      </main>
    </div>
  );
};

export default ShiftManagementApp;
