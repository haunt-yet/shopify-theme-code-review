const validations = {
    isKana: function (value) {
        return /^[\u3040-\u309F\u30A0-\u30FF]+$/.test(value);
    },
    isNumeric: function (value) {
        return /^\d+$/.test(value);
    },
    isTelephone: function (value) {
        return value.length <= 4 && this.isNumeric(value);
    },
    validateZipCode: function (value, length) {
        return value.length === length && this.isNumeric(value);
    },
};

const fieldNameMap = {
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

const phoneFields = [
    'RegisterForm-CustomerTel1',
    'RegisterForm-CustomerTel2',
    'RegisterForm-CustomerTel3'
];

const zipFields = ['RegisterForm-ZipCode1', 'RegisterForm-ZipCode2'];

const createErrorElement = (id, message) => {
    const errorElement = document.createElement('p');
    errorElement.id = `${id}-error`;
    errorElement.className = 'form__box__errortext';
    errorElement.style.display = 'block';
    errorElement.style.color = 'red';
    errorElement.style.whiteSpace = 'nowrap';
    errorElement.textContent = message;
    return errorElement;
};

function formValidator(event) {
    event.preventDefault();

    const inputs = this.querySelectorAll('input, select');
    let isValid = true;
    let shownPhoneError = false;
    let shownZipCodeError = false;

    for (const input of inputs) {
        const errorElement = document.getElementById(`${input.id}-error`);
        if (errorElement) {
            errorElement.remove();
        }
    }

    for (const el of inputs) {
        const fieldId = el.id;
        const trimmedValue = el.value.trim();
        let errorMessage = '';

        if (fieldNameMap[fieldId]) {
            if (trimmedValue === '') {
                errorMessage = `${fieldNameMap[fieldId]}を入力してください。`;
            } else if (phoneFields.includes(fieldId) && !validations.isTelephone(trimmedValue)) {
                errorMessage = `${fieldNameMap[fieldId]}は4文字以下の数字で入力してください。`;
            } else if (fieldId === 'RegisterForm-ZipCode1' && !validations.validateZipCode(trimmedValue, 3)) {
                errorMessage = `${fieldNameMap[fieldId]}は3文字の数字で入力してください。`;
            } else if (fieldId === 'RegisterForm-ZipCode2' && !validations.validateZipCode(trimmedValue, 4)) {
                errorMessage = `${fieldNameMap[fieldId]}は4文字の数字で入力してください。`;
            } else if ((fieldId === 'RegisterForm-LastNameKana' || fieldId === 'RegisterForm-FirstNameKana') && !validations.isKana(trimmedValue)) {
                errorMessage = `${fieldNameMap[fieldId]}はカナ文字のみ。`;
            }
        }

        if (errorMessage) {
            const errorElement = createErrorElement(fieldId, errorMessage);

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

    const password = document.getElementById('RegisterForm-password').value.trim();
    const passwordConfirm = document.getElementById('RegisterForm-passwordConfirm').value.trim();
    if (password !== passwordConfirm) {
        const passwordErrorElement = createErrorElement('RegisterForm-passwordConfirm', '「パスワード」と「パスワード確認」が一致しません。');
        document.getElementById('RegisterForm-passwordConfirm').parentNode.appendChild(passwordErrorElement);
        isValid = false;
    }

    const faxFields = [
        'RegisterForm-CustomerFax1',
        'RegisterForm-CustomerFax2',
        'RegisterForm-CustomerFax3'
    ];

    for (const faxId of faxFields) {
        const faxValue = document.getElementById(faxId).value.trim();
        if (faxValue && !validations.isNumeric(faxValue)) {
            const faxErrorElement = createErrorElement(faxId, '「FAX番号」には数字を入力してください。');
            const formTelDiv = document.getElementById(faxId).closest('.form__tel');
            if (formTelDiv) {
                formTelDiv.parentNode.insertBefore(faxErrorElement, formTelDiv.nextSibling);
            }
            isValid = false;
        }
    }

    return isValid;
}

document.forms['create_customer'].onsubmit = formValidator;