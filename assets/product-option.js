$(async function(){
  //const getProductOptionUrl = 'apps/mall/admin/event-reminders';
  //const getProductOptionUrl = 'http://localhost:8480/api/admin/product-option';
  //console.log(getProductOptionUrl);

  const fetchProductOptionData = () => {
     return new Promise((resolve, _reject) => {
       fetchBase(mallDomain + "/admin/product-option", (data) => {
         resolve (data);
       });
     });
  }
  
  // 商品のオプション情報取得
  const productOptionData = await fetchProductOptionData();
  console.log(productOptionData);

  const stepInfo = {
    1:'ご利用の用途',
    2:'立札・カード',
    3:'立札タイプ',
    4:'記載内容',
  };

  doOption1();

  // 第1階層
  function doOption1() {
    let arrOption = productOptionData.productOption1s;
    let retOption = "";
    let stepName = stepInfo[1];
    let inputName = "properties['"+stepName+"']";
    arrOption.forEach((option,index) => {
      checked = (index === 0) ? 'checked' : '';
      retOption += '<label>';
      retOption += '<input type="radio" name="'+inputName+'" value="'+option.select_list_name+'" data-option="'+option.id+'" '+checked+'>';
      retOption += '<div class="form__radio__content">';
      retOption += '<p>'+option.select_list_name+'</p>';
      retOption += '</div>';
      retOption += '</label>';
    });
  
    $('#product_option1').html(retOption);
    delete arrOption;
    delete retOption;
    // 第1階層end
  
    // 第1階層の次へをクリック
    let checkedOption = '';
    $(document).on('click', '#btn_next_option1', function(){
      checkedOption = $('input[name="'+inputName+'"]:checked').attr('data-option');
      if (checkedOption == '') return;
      // 第2階層
      doOption2(checkedOption);
    });
  }

  // 第2階層
  function doOption2(checkedOption) {
    let arrOption = productOptionData.productOption2s[checkedOption];
    let retOption = "";
    let stepName = stepInfo[2];
    let inputName = "properties['"+stepName+"']";
    if (arrOption === undefined) {
      // 無しの処理
      console.log('nothing');
      $('#product_option2').html('ないです');
      return;
    }
    arrOption.forEach((option,index) => {
      checked = (index === 0) ? 'checked' : '';
      retOption += '<label>';
      retOption += '<input type="radio" name="'+inputName+'" value="'+option.select_list_name+'" data-option="'+option.id+'" '+checked+'>';
      retOption += '<div class="form__radio__content">';
      retOption += '<p>'+option.select_list_name+'</p>';
      retOption += '</div>';
      retOption += '</label>';
    });
    $('#product_option2').html(retOption);

    // 初期表示
    doOption3_1($('input[name="'+inputName+'"]:checked').attr('data-option'));

    $(document).on('click', 'input[name="'+inputName+'"]', function(){
      // 第3-1階層
      doOption3_1($(this).attr('data-option'));
    });
  }

  // 第3-1階層
  function doOption3_1(checkedOption) {
    let arrOption = productOptionData.productOption3s[checkedOption];
    let retOption = "";
    let stepName = stepInfo[3];
    let inputName = "properties['"+stepName+"']";
    if (arrOption === undefined) {
      // 無しの処理
      console.log('nothing');
      $('#product_option3_1').html('ないです');
      return;
    }
    arrOption.forEach((option,index) => {
      checked = (index === 0) ? 'checked' : '';
      retOption += '<label>';
      retOption += '<input type="radio" name="'+inputName+'" value="'+option.select_list_name+'" data-option="'+option.id+'" '+checked+'>';
      retOption += '<div class="form__radio__content">';
      retOption += '<p>'+option.select_list_name+'</p>';
      retOption += '</div>';
      retOption += '</label>';
    });
    $('#product_option3_1').html(retOption);

    // 初期表示
    doOption3_2($('input[name="'+inputName+'"]:checked').attr('data-option'));

    $(document).on('click', 'input[name="'+inputName+'"]', function(){
      // 第3-2階層
      doOption3_2($(this).attr('data-option'));
    });
  }

  // 第3-2階層
  function doOption3_2(checkedOption) {
    let arrOption = productOptionData.productOption4s[checkedOption];
    let retOption = "";
    let retForm = "";
    let stepName = stepInfo[4];
    let inputName = "properties['"+stepName+"']";
    if (arrOption === undefined) {
      // 無しの処理
      console.log('nothing');
      $('#product_option3_2').html('ないです');
      return;
    }
    arrOption.forEach((option,index) => {
      checked = (index === 0) ? 'checked' : '';
      retOption += '<label>';
      retOption += '<input type="radio" name="'+inputName+'" value="'+option.select_list_name+'" data-option="'+option.id+'" '+checked+'>';
      retOption += '<div class="form__radio__content">';
      retOption += '<p>'+option.select_list_name+'</p>';
      retOption += '</div>';
      retOption += '</label>';
    });
    $('#product_option3_2').html(retOption);

    // // 初期表示
    doOption3_2Form(checkedOption, $('input[name="'+inputName+'"]:checked').attr('data-option'));

    $(document).on('click', 'input[name="'+inputName+'"]', function(){
      // 第3階層
      doOption3_2Form(checkedOption, $(this).attr('data-option'));
    });
  }

  function doOption3_2Form(checkedOption, checkedId) {
    let arrOption = productOptionData.productOption4s[checkedOption];
    let retOption = "";
    let retForm = "";
    let stepName = stepInfo[4];
    let inputName = "";
    if (arrOption === undefined) {
      // 無しの処理
      console.log('nothing');
      $('#product_option3_2_form').html('ないです');
      return;
    }

    arrOption.forEach((option,index) => {
      if (option.id != checkedId) {
        return true;
      }
      let inputObject = JSON.parse(option.input_object);
      for (let i=1; i<=10; i++) {
        if (inputObject[i].name == null) {
          return true;
        }
        inputRow = inputObject[i];
        inputName = "properties['"+inputRow.name+"']";
        retForm += '<fieldset class="form__box form__text">';
        retForm += '<legend class="form__title">'+inputRow.name+'</legend>';
        if (inputRow.type === 'textbox') {
          retForm += '<input type="text" name="'+inputName+'" placeholder="'+inputRow.value+'">';
        } else if (inputRow.type === 'selectbox') {
          retForm += '<select name="'+inputName+'">';
          inputRow.value.split(',').forEach((val,key) => {
            retForm += '<option value="'+val+'">'+val+'</option>';
          });
          retForm += '</select>';
        } else if (inputRow.type === 'textarea') {
          retForm += '<textarea name="'+inputName+'" placeholder="'+inputRow.value+'"></textarea>';
        }
        retForm += '</fieldset>';
      }
    });

    $('#product_option3_2_form').html(retForm);

    // // 初期表示
    // doOption4($('input[name="'+inputName+'"]:checked').attr('data-option'));

    // $(document).on('click', 'input[name="'+inputName+'"]', function(){
    //   // 第3階層
    //   doOption4($(this).attr('data-option'));
    // });    
  }
});

