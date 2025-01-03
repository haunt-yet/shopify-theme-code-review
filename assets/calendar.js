// 日付の整形
const formatDate = (date) => {
  return String(date).padStart(2, '0');
};
const formatHoliday = (holiday) => {
  return holiday.getFullYear() + "-" + formatDate(holiday.getMonth() + 1) + "-" + formatDate(holiday.getDate());
};

// 休業日情報の取得（API）
const fetchHolidayData = () => {
   return new Promise((resolve, _reject) => {
     fetchBase(mallDomain + "/admin/businessday", (data) => {
       resolve (data);
     });
   });
}

// カレンダー表示処理
document.addEventListener('DOMContentLoaded', async () => {
  // 休業日情報取得
  const holidayData = await fetchHolidayData();

  // カレンダー設定
  const today = new Date(new Date().setHours(0, 0, 0, 0)); // 今日の午前0時に設定
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const firstDayNext = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const lastDayNext = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  // 定休日（曜日情報）
  const fixedHolidayData = holidayData.businessFixedHoliday.fixedHolidays;
  const fixedHolidays = [];
  let d = new Date(firstDay);
  while (d <= lastDayNext) {
    const weekdayName = d.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
    if (fixedHolidayData.includes(weekdayName)) {
      const fixedHoliday = formatHoliday(d);
      fixedHolidays.push(fixedHoliday);
    }
    d.setDate(d.getDate() + 1);
  }

  // 祝日情報
  const nationalHolidayDate = holidayData.nationalHolidays;
  
  const nationalHolidays = nationalHolidayDate.map((item) => {
    return item.nationalHoliday
  });

  // 臨時休業日
  const temporaryHolidayData = holidayData.businessTemporaryHolidays
  const temporaryHolidays = [];
  temporaryHolidayData.forEach(({ startDate, endDate }) => {
    let baseDate = new Date(startDate);
    const lastDate = new Date(endDate);

    while (baseDate <= lastDate) {
      const temporaryHoliday = formatHoliday(baseDate);
      temporaryHolidays.push(temporaryHoliday);
      baseDate.setDate(baseDate.getDate() + 1);
    }
  });

  // 定休日＋祝日＋臨時休業日
  const fixedAndNationalAndTemporaryHolidays = [...new Set([...fixedHolidays, ...nationalHolidays, ...temporaryHolidays])];

  // 定休日取消（特別営業日）
  const specialdayData = holidayData.businessSpecialDays;
  const specialdays = specialdayData.map(({ specialOpeningDate }) => specialOpeningDate);

  // 有効な定休日
  const holidays = fixedAndNationalAndTemporaryHolidays.filter(item => !specialdays.includes(item));
  
  // 営業日カレンダー設定（今月）
  flatpickr("#calendar", {
    inline: true,
    mode: "single",
    showMonths: 1,
    minDate: "today",
    maxDate: lastDay,
    static: true,
    prevArrow: "",
    nextArrow: "",
    monthSelectorType: "static",
    locale: "ja",
    dateFormat: "Y-m-d",
    onDayCreate: function (dObj, dStr, fp, dayElem) {
      const d = dayElem.dateObj;
      if (d < today || d > lastDay) {
        return;
      }
      if (holidays.includes(formatHoliday(d))) {
        dayElem.classList.add('business-holiday');
      }
    },
    onReady: function(selectedDates, dateStr, instance) {
      const yearInput = instance.currentYearElement;
      const numInputWrapper = yearInput.parentElement;
      const yearLabel = document.createElement('span');
      yearLabel.className = 'year-label';
      yearLabel.textContent = '年';
      numInputWrapper.insertAdjacentElement('afterend', yearLabel);
    },
  });

  // 営業日カレンダー設定（翌月）
  flatpickr("#calendar-next", {
    inline: true,
    mode: "single",
    showMonths: 1,
    minDate: firstDayNext,
    maxDate: lastDayNext,
    static: true,
    prevArrow: "",
    nextArrow: "",
    monthSelectorType: "static",
    locale: "ja",
    dateFormat: "Y-m-d",
    onDayCreate: function (dObj, dStr, fp, dayElem) {
      const d = dayElem.dateObj;
      if (d < firstDayNext || d > lastDayNext) {
        return;
      }
      if (holidays.includes(formatHoliday(d))) {
        dayElem.classList.add('business-holiday');
      }
    },
    onReady: function(selectedDates, dateStr, instance) {
      const yearInput = instance.currentYearElement;
      const numInputWrapper = yearInput.parentElement;
      const yearLabel = document.createElement('span');
      yearLabel.className = 'year-label';
      yearLabel.textContent = '年';
      numInputWrapper.insertAdjacentElement('afterend', yearLabel);
    },
  });
});