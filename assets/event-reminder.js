(function () {
  const getEventReminderUrl = 'apps/mall/admin/event-reminders';
  // const getEventReminderUrl = 'http://localhost:8888/api/admin/event-reminders';
  const EVENT_TYPE_USER_INPUT = 3;

  function resetEventReminderForm() {
    const form = document.querySelector('#event-reminder-form');
    if (!form) return;
    
    const eventDaysBeforeInput = form.querySelector('[name="event_days_before"]');
    const remarkInput = form.querySelector('[name="remark"]');

    if (eventDaysBeforeInput) eventDaysBeforeInput.value = '';
    if (remarkInput) remarkInput.value = '';
  
    fetchAndDisplayReminders();
  }

  function clearErrorMessages() {
    const errorMessages = document.querySelectorAll('.mall-reminder-error');
    errorMessages.forEach(message => message.remove());
  }

  function submitEventReminder(form) {
    const formData = {
      id: parseInt(form.querySelector('[name="id"]').value),
      admin_event_reminder_id: parseInt(form.querySelector('[name="admin_event_reminder_id"]').value),
      user_key: form.querySelector('[name="user_key"]').value,
      event_date_month: form.querySelector('[name="event_date_month"]').value,
      event_date_day: form.querySelector('[name="event_date_day"]').value,
      event_date_before: parseInt(form.querySelector('[name="event_date_before"]').value),
      remark: form.querySelector('[name="remark"]').value || ""
    };

    const fetchOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    const url = getEventReminderUrl;

    return fetch(url, fetchOptions);
  }

  async function fetchAndDisplayReminders() {
    try {
      const response = await fetch(getEventReminderUrl + `?user_key=${userKey}`);

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const arrReminders = await response.json();
      const adminReminders = arrReminders['adminEventReminders'];
      const reminders = arrReminders['eventReminders']

      // マスタ情報
      let arrData;
      let arrEventData = [];

      // セレクトボックス初期化
      $('select.admin_event_reminder_id').empty();
      $('#event_date_display').html();

      let optionAdminEventReminderId = '<option value="">選択してください</option>';
      if(adminReminders && adminReminders.length > 0) {
        adminReminders.forEach((row,index) => {
          // イベントのセレクトボックス
          optionAdminEventReminderId = optionAdminEventReminderId + '<option value="'+row.id+'">'+row.event_name+'</option>';
          arrEventData[row.id] = row;
        });
      }
      $('#admin_event_reminder_id').html(optionAdminEventReminderId);

      // マスターの値からdateを表示
      $("#admin_event_reminder_id").change(function() {
        $('#event-reminder-form input[name="admin_event_reminder_id"]').val(arrEventData[$(this).val()].id);
        if (arrEventData[$(this).val()].event_type == EVENT_TYPE_USER_INPUT) {
          $('#event_date_display').empty();
          $('#event_date_month_day').show();
          $("#event_date_day").prop("required", true);
          $("#event_date_month").prop("required", true);
        } else {
          $('#event_date_display').html(arrEventData[$(this).val()].formatted_date);
          $('#event_date_month_day').hide();
          $("#event_date_day").prop("required", false);
          $("#event_date_month").prop("required", false);
        }
      });

      let optionEventMonth =  '<option value="">月を選択</option>';
      let optionEventDay =  '<option value="">月を選択</option>';
      // 月セレクトボックスに1〜12月を追加
      for (let month = 1; month <= 12; month++) {
        optionEventMonth = optionEventMonth + '<option value="'+month+'">'+month+'</option>';
      }
  
      for (let day = 1; day <= 31; day++) {
        optionEventDay = optionEventDay + '<option value="'+day+'">'+day+'</option>';
      }
      
      if(reminders && reminders.length > 0) {
        const ul = document.getElementById('reminder-list-body');
        ul.innerHTML = '';

        reminders.forEach(reminder => {
          const li = document.createElement('li');
          let eventData = arrEventData[reminder.admin_event_reminder_id];
          let eventName = eventData.event_name ?? '';
          let formattedDate = eventData.formatted_date ?? '';
          let adminEventReminderId = reminder.admin_event_reminder_id ?? '';
          let eventDateBefore = reminder.event_date_before ?? '';
          let remark = reminder.remark ?? '';
          let eventDate = '';
          if (eventData.event_type == EVENT_TYPE_USER_INPUT) {
            eventDate = formatToJapaneseDate(reminder.event_date);
          } else {
            eventDate = eventData.formatted_date ?? '';
          }
          
          li.innerHTML = `
            <div class="my-plate__list--box_section">
            <div class="my-plate__list--box">
              <div class="my-plate__list-boxsub">
                <dl>
                  <dt>イベント名</dt>
                  <dd>${eventName}</dd>
                </dl>

                <dl>
                  <dt>イベント対象日</dt>
                  <dd>${eventDate}</dd>
                </dl>

                <dl>
                  <dt>リマインダー日</dt>
                  <dd>${eventDateBefore}日前</dd>
                </dl>

                <dl>
                  <dt>備考</dt>
                  <dd>${remark}</dd>
                </dl>
              </div>          
              <div>
                <div class="my-plate__btns">
                  <div class="btns btns-1 js-accordion">編集</div>
                  <button type="button" class="btns btns-2">削除</button>
                </div>
              </div>
            </div><!-- ./my-plate__list--box -->
            <div class="js-accordion-cnt">
              <div class="my-plate__form">
                <div class="my-plate__form__inner">  
                <form autocomplete="off" class="mall-summary__form event-reminder-form" id='event-reminder-form${reminder.id}'>
                  <input type="hidden" name="id" value="${reminder.id}">
                  <input type="hidden" name="user_key" value="${userKey}">
                  <div class="option">
                    <fieldset class="option__box option__select">
                      <legend class="option__title">イベント名</legend>
                      <div class="option__selectbox">
                        <select name="admin_event_reminder_id" id="admin_event_reminder_id${reminder.id}">
                        ${optionAdminEventReminderId}
                        </select>
                      </div>
                    </fieldset>

                    <fieldset class="option__box option__text">
                      <legend class="option__title">イベント対象日</legend>
                      <div id="event_date_display${reminder.id}"></div>
                      <div id="event_date_month_day${reminder.id}" hidden>
                        <div class="option__selectbox"   style="width:150px">
                          <select id="event_date_month${reminder.id}" name="event_date_month" >
                            ${optionEventMonth}
                          </select>
                        </div>
                          月
                        <div class="option__selectbox"  style="width:150px; margin-left: 10px;">
                          <select id="event_date_day${reminder.id}" name="event_date_day">
                            ${optionEventDay}
                          </select>
                        </div>
                          日
                      </div>
                    </fieldset>

                    <fieldset class="option__box option__select">
                      <legend class="option__title">リマインダー日</legend>
                      <div class="option__selectbox">
                        <select name="event_date_before" id="event_date_before${reminder.id}">
                          <option value="20">20日前</option>
                          <option value="15">15日前</option>
                          <option value="10">10日前</option>
                          <option value="7">7日前</option>
                          <option value="5">5日前</option>
                          <option value="3">3日前</option>
                        </select>
                      </div>
                      <p>※リマインダー日の18:00にメールが届きます。</p>
                    </fieldset>

                    <fieldset class="option__box option__textarea">
                      <legend class="option__title">備考</legend>
                      <textarea name="remark">${remark}</textarea>
                      <p>※リマインダーメールには表示されません。</p>
                    </fieldset>

                     <div class="option__btn">
                       <a class="btns btns-1 btn-update${reminder.id}">更新</a>
                       <button type="button" class="btns btns-2 js-accordion-close">キャンセル</button>
                     </div>
                       
                  </div><!-- ./option -->
                </div><!-- ./my-plate__form__inner -->
              </div><!-- ./my-plate__form -->
            </div><!-- ./js-accordion-cnt" -->
            </div>
          `;

            
            ul.appendChild(li);
            $('.user_key').val(userKey);
            $('#admin_event_reminder_id'+reminder.id+' option[value="'+reminder.admin_event_reminder_id+'"').prop('selected', true);
            $('#event_date_before'+reminder.id+' option[value="'+reminder.event_date_before+'"').prop('selected', true);
            if (eventData.event_type == EVENT_TYPE_USER_INPUT) {
                const [month, day] = reminder.event_date.split("-"); // 月と日を分解
                $('#event_date_month'+reminder.id+' option[value="'+parseInt(month)+'"').prop('selected', true);
                $('#event_date_day'+reminder.id+' option[value="'+parseInt(day)+'"').prop('selected', true);
                $('#event_date_display'+reminder.id).empty();
                $('#event_date_month_day'+reminder.id).show();
                $("#event_date_day"+reminder.id).prop("required", true);
                $("#event_date_month"+reminder.id).prop("required", true);
            } else {
                $('#event_date_display'+reminder.id).html(eventData.formatted_date);
                $('#event_date_month_day'+reminder.id).hide();
                $("#event_date_day"+reminder.id).prop("required", false);
                $("#event_date_month"+reminder.id).prop("required", false);
            }
            
            $('#reminder-list-body').on('change', '#admin_event_reminder_id' + reminder.id, function () {
              $('#event-reminder-form input[name="admin_event_reminder_id"]').val(arrEventData[$(this).val()].id);
              if (arrEventData[$(this).val()].event_type == EVENT_TYPE_USER_INPUT) {
                $('#event_date_display'+reminder.id).empty();
                $('#event_date_month_day'+reminder.id).show();
                $("#event_date_day"+reminder.id).prop("required", true);
                $("#event_date_month"+reminder.id).prop("required", true);
              } else {
                $('#event_date_display'+reminder.id).html(arrEventData[$(this).val()].formatted_date);
                $('#event_date_month_day'+reminder.id).hide();
                $("#event_date_day"+reminder.id).prop("required", false);
                $("#event_date_month"+reminder.id).prop("required", false);
              }
            });
          
            $(document).on('click', '.btn-update'+reminder.id, function(){
              updateEventReminder(reminder.id);
            });
          });
          $('.user_key').val(userKey);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }


  function parseDate(input) {
    const currentYear = new Date().getFullYear(); // 現在の年を取得
    const [month, day] = input.split("-"); // 月と日を分解
    const date = new Date(currentYear, parseInt(month) - 1, parseInt(day)); // Dateオブジェクトを作成
    return date;
  }

  function formatToJapaneseDate(input) {
    const date = parseDate(input); // 方法 1 の `parseDate` を再利用
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  async function deleteReminder(id) {
    if (confirm('このリマインダーを削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/apps/mall/event-reminder/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Delete failed');
        }

        await fetchAndDisplayReminders();
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('削除中にエラーが発生しました。後でもう一度お試しください。');
      }
    }
  }
async function updateEventReminder(id) {
    // Form submit handler
    const form = document.querySelector('#event-reminder-form'+id);
  
    if (form) {
      //form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // const submitButton = event.target.querySelector('button[type="submit"]');
        // submitButton.disabled = true;
        // submitButton.textContent = isEditing ? "送信中" : "送信中";
        // submitButton.classList.add("mall-form__submit--loading");

        try {
          const response = await submitEventReminder(form);
          const responseData = await response.json();
          console.log(responseData);
          if (responseData.status === 200) {
            fetchAndDisplayReminders();
            // resetEventReminderForm();
            
            // submitButton.textContent = "登録"
            
            // await fetchAndDisplayReminders();
            $('html, body').animate({
                scrollTop: $(".my-plate").offset().top
            }, 200);
            
            const listTitle = document.querySelector('.js-accordion-add');
            if (listTitle) {
              const successMessage = document.createElement('div');
              successMessage.className = 'mall-reminder-success';
              successMessage.textContent = 'リマインダーの更新が完了しました';
              listTitle.parentNode.insertBefore(successMessage, listTitle);
              
              setTimeout(() => {
                successMessage.remove();
              }, 3000);
            }
          } else {
            throw new Error(responseData.error || 'Operation failed');
          }
        } catch (error) {
          console.error('Error submitting form:', error);
          create({
            tag: "p",
            attributes: {
              textContent: "エラーが発生しました。後でもう一度お試しください。",
              className: "mall-reminder-error"
            },
            appendTo: form
          });
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "更新" ;
            submitButton.classList.remove("mall-form__submit--loading");
          }
        }
      //});
    }
  }  

  function initEventHandlers() {  
    // 月セレクトボックスに1〜12月を追加
    for (let month = 1; month <= 12; month++) {
      $("[name=event_date_month]").append(`<option value="${month}">${month}</option>`);
    }

    for (let day = 1; day <= 31; day++) {
      $("[name=event_date_day]").append(`<option value="${day}">${day}</option>`);
    }

    $("#event-reminder-form").on("submit", async function(event) {
        event.preventDefault();
        const submitButton = event.target.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = isEditing ? "送信中" : "送信中";
        submitButton.classList.add("mall-form__submit--loading");
        try {
          const form = document.querySelector('#event-reminder-form');
          const response = await submitEventReminder(form);
          const responseData = await response.json();
          console.log(responseData);

          // if (responseData.status === "success") {
          //   resetEventReminderForm();
            
          //   submitButton.textContent = "登録";
            
          //   await fetchAndDisplayReminders();
            
          //   const listTitle = document.querySelector('.mall-reminder-list__title');
          //   if (listTitle) {
          //     const successMessage = document.createElement('div');
          //     successMessage.className = 'mall-reminder-success';
          //     successMessage.textContent = 'リマインダーの登録が完了しました';
          //     listTitle.parentNode.insertBefore(successMessage, listTitle);
              
          //     setTimeout(() => {
          //       successMessage.remove();
          //     }, 3000);
          //   }
          // } else {
          //   throw new Error(responseData.error || 'Operation failed');
          // }
        } catch (error) {
          console.error('Error submitting form:', error);
          create({
            tag: "p",
            attributes: {
              textContent: "エラーが発生しました。後でもう一度お試しください。",
              className: "mall-reminder-error"
            },
            appendTo: form
          });
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "登録";
            submitButton.classList.remove("mall-form__submit--loading");
          }
        }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayReminders();
    initEventHandlers();
  });

  // アコーディオン - 新規登録
  $(document).on('click', '.js-accordion-add', function(){
    const content = document.querySelector('.js-accordion-cnt-add');
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        content.style.maxHeight = null; // 閉じる
    } else {
        content.classList.add('open');
        content.style.maxHeight = content.scrollHeight + 'px'; // 開く
    }
  });

  // アコーディオンを閉じる処理
  $(document).on('click', '.js-accordion-close-add', function(){
    const content = document.querySelector('.js-accordion-cnt-add');
    if (content.classList.contains('open')) {
        content.classList.remove('open');
        content.style.maxHeight = null; // 閉じる
    } 
  });

  //--- アコーディオン - リスト
  $(document).on('click', '.js-accordion', function(){
    $(this).closest(".my-plate__list--box_section").find('.js-accordion-cnt').slideToggle();
    if (accordionContent) {
      if (accordionContent.style.maxHeight) {
        accordionContent.style.maxHeight = null;
      } else {
        accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
      }
    }
  });

  // // アコーディオンを閉じる処理
  $(document).on('click', '.js-accordion-cnt', function(){
      const content = $(this).closest('li').querySelector('.js-accordion-cnt');
      if (content) {
        content.style.maxHeight = null;
      }
  });

})();
