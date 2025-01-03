$(function(){
  $(document).on('click', '#btn_option_regist', function(){
    // Check customer login through ShopifyAnalytics
    const customerId = window.ShopifyAnalytics?.meta?.page?.customerId;
    
    if (!customerId) {
      alert('この機能を実行するにはログインしてください');
      return;
    }

    const optionRegistUrl = 'admin/user-option';
    const requestBody = {
      option_object: {
        option1: $('input[name="properties[option1]"]:checked').val(),
        option2: $('input[name="properties[option2]"]:checked').val(),
        option3: $('input[name="properties[option3]"]:checked').val(),
        option4: $('input[name="properties[option4]"]').val()?.toString() || ''
      }
    };

    fetchBase(
      `${mallDomain}/${optionRegistUrl}`,
      (response) => {
        if (response.success) {
          alert('オプションを登録しました');
        } else {
          alert('オプションの登録に失敗しました');
        }
      },
      'POST',
      requestBody,
      true
    );
  });
});