function formValidator() {
    var inputs = this.querySelectorAll('input, select');
    var fieldNameMap = {
        'RegisterForm-CustomerTel1': '「電話番号1」',
        'RegisterForm-CustomerTel2': '「電話番号2」',
        'RegisterForm-CustomerTel3': '「電話番号3」',
        'RegisterForm-LastName': '「姓」',
        'RegisterForm-FirstName': '「名」',
        'RegisterForm-LastNameKana': '「カナ」',
        'RegisterForm-FirstNameKana': '「カナ」',
        'RegisterForm-Prefecture': '「都道府県」',
        'RegisterForm-City': '「市区町村番地」',
        'RegisterForm-ZipCode1': '「郵便番号1」',
        'RegisterForm-ZipCode2': '「郵便番号2」',
        'RegisterForm-email': '「メールアドレス」',
    };

    var phoneFields = [
        'RegisterForm-CustomerTel1', 'RegisterForm-CustomerTel2', 'RegisterForm-CustomerTel3'
    ];

    var zipFields = ['RegisterForm-ZipCode1', 'RegisterForm-ZipCode2'];

    var faxFields = [
        'RegisterForm-CustomerFax1', 'RegisterForm-CustomerFax2', 'RegisterForm-CustomerFax3'
    ];
    var shownPhoneError = false;
    var shownZipCodeError = false;

    for (var i = 0; i < inputs.length; i++) {
        var fieldId = inputs[i].id;
        var errorElement = document.getElementById(`${fieldId}-error`);
        if (errorElement) {
            errorElement.remove();
        }
    }

    var isValid = true;

    for (var i = 0; i < inputs.length; i++) {
        var el = inputs[i];
        var fieldId = el.id;

        if (fieldNameMap[fieldId]) {
            let errorMessage = '';
            const trimmedValue = el.value.trim();

            if (trimmedValue === '') {
                errorMessage = `${fieldNameMap[fieldId]}を入力してください。`;
            } else if (phoneFields.includes(fieldId)) {
                if (trimmedValue.length > 4) {
                    errorMessage = `${fieldNameMap[fieldId]}は4文字以下で入力してください。`;
                }
            } else if (fieldId === 'RegisterForm-ZipCode1') {
                if (!/^\d+$/.test(trimmedValue)) {
                    errorMessage = `${fieldNameMap[fieldId]}には数字を入力してください。`;
                } else if (trimmedValue.length !== 3) {
                    errorMessage = `${fieldNameMap[fieldId]}は3文字で入力してください。`;
                }
            } else if (fieldId === 'RegisterForm-ZipCode2') {
                if (!/^\d+$/.test(trimmedValue)) {
                    errorMessage = `${fieldNameMap[fieldId]}には数字を入力してください。`;
                } else if (trimmedValue.length !== 4) {
                    errorMessage = `${fieldNameMap[fieldId]}は4文字で入力してください。`;
                }
            }

            if (errorMessage) {
                var errorElement = document.createElement('p');
                errorElement.id = `${fieldId}-error`;
                errorElement.className = 'form__box__errortext';
                errorElement.style.display = 'block';
                errorElement.style.color = 'red';
                errorElement.style.whiteSpace = 'nowrap';
                errorElement.textContent = errorMessage;

                if (phoneFields.includes(fieldId)) {
                    if (!shownPhoneError) {
                        const firstPhoneField = document.getElementById(phoneFields[0]);
                        const phoneDiv = firstPhoneField.closest('.form__tel');
                        if (phoneDiv) {
                            phoneDiv.parentNode.insertBefore(errorElement, phoneDiv.nextSibling);
                        }
                        shownPhoneError = true;
                    }
                } else if (zipFields.includes(fieldId)) {
                    if (!shownZipCodeError) {
                        const firstZipField = document.getElementById(zipFields[0]);
                        const zipDiv = firstZipField.closest('.form__zip');
                        if (zipDiv) {
                            zipDiv.parentNode.insertBefore(errorElement, zipDiv.nextSibling);
                        }
                        shownZipCodeError = true;
                    }
                } else if (fieldId === 'RegisterForm-Prefecture') {
                    const selectDiv = el.closest('.form__selectbox');
                    if (selectDiv) {
                        selectDiv.parentNode.insertBefore(errorElement, selectDiv.nextSibling);
                    }
                } else {
                    el.parentNode.appendChild(errorElement);
                }

                isValid = false;
            }
        }
    }

    var password = document.getElementById('RegisterForm-password').value.trim();
    var passwordConfirm = document.getElementById('RegisterForm-passwordConfirm').value.trim();
    if (password !== passwordConfirm) {
        var passwordErrorElement = document.createElement('p');
        passwordErrorElement.id = `RegisterForm-passwordConfirm-error`;
        passwordErrorElement.className = 'form__box__errortext';
        passwordErrorElement.style.display = 'block';
        passwordErrorElement.style.color = 'red';
        passwordErrorElement.style.whiteSpace = 'nowrap';
        passwordErrorElement.textContent = '「パスワード」と「パスワード確認」が一致しません。';

        var passwordField = document.getElementById('RegisterForm-passwordConfirm');
        passwordField.parentNode.appendChild(passwordErrorElement);
        isValid = false;
    }

    var customerFax1 = document.getElementById('RegisterForm-CustomerFax1').value.trim();
    var customerFax2 = document.getElementById('RegisterForm-CustomerFax2').value.trim();
    var customerFax3 = document.getElementById('RegisterForm-CustomerFax3').value.trim();

    var faxFields = [
        { id: 'RegisterForm-CustomerFax1', value: customerFax1 },
        { id: 'RegisterForm-CustomerFax2', value: customerFax2 },
        { id: 'RegisterForm-CustomerFax3', value: customerFax3 }
    ];

    faxFields.forEach(function(fax) {
        if (fax.value && !/^\d+$/.test(fax.value)) {
            var faxErrorElement = document.createElement('p');
            faxErrorElement.id = `${fax.id}-error`;
            faxErrorElement.className = 'form__box__errortext';
            faxErrorElement.style.display = 'block';
            faxErrorElement.style.color = 'red';
            faxErrorElement.style.whiteSpace = 'nowrap';
            faxErrorElement.textContent = '「FAX番号」には数字を入力してください。';

            var faxField = document.getElementById(fax.id);

            // Find the closest form__tel div and append the error under it
            var formTelDiv = faxField.closest('.form__tel');
            if (formTelDiv) {
                formTelDiv.parentNode.insertBefore(faxErrorElement, formTelDiv.nextSibling);
            }

            isValid = false;
        }
    });

    return isValid;
}

document.forms['create_customer'].onsubmit = formValidator;