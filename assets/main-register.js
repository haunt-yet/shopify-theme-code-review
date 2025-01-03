function showError(fields) {
    const phoneFields = [
        'RegisterForm-CustomerTel1', 'RegisterForm-CustomerTel2', 'RegisterForm-CustomerTel3'
    ];
    const zipFields = ['RegisterForm-ZipCode1', 'RegisterForm-ZipCode2'];
    let shownPhoneError = false;

    fields.forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        const formField = document.getElementById(field);

        if (!formField) return;

        const fieldNameMap = {
            'RegisterForm-LastName': 'カナ',
            'RegisterForm-CustomerTel1': '電話番号',
            'RegisterForm-CustomerTel2': '電話番号',
            'RegisterForm-CustomerTel3': '電話番号',
            'RegisterForm-FirstName': '姓',
            'RegisterForm-LastNameKana': 'カナ',
            'RegisterForm-FirstNameKana': 'メイ',
            'RegisterForm-City': '市区町村番地',
            'RegisterForm-Prefecture': '都道府県',
            'RegisterForm-ZipCode1': '郵便番号',
            'RegisterForm-ZipCode1' : '郵便番号'
        };

        const fieldName = fieldNameMap[field] || field.replace('RegisterForm-', '').replace('-', ' ');

        let errorMessage = errorElement || document.createElement('p');
        errorMessage.className = 'form__box__errortext';
        errorMessage.id = `${field}-error`;
        errorMessage.style.display = 'block';

        if (formField.value.trim() === '') {
            errorMessage.innerHTML = `「${fieldName}」を入力してください。`;
        } else if (phoneFields.includes(field) && !/^\d+$/.test(formField.value.trim())) {
            errorMessage.innerHTML = `「${fieldName}」には数字を入力してください。`;
        } else if (zipFields.includes(field) && !/^\d+$/.test(formField.value.trim())) {
            errorMessage.innerHTML = `「${fieldName}」番号を入力してください`;
        } else {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            return;
        }

        if (phoneFields.includes(field)) {
            if (!shownPhoneError) {
                const firstPhoneField = document.getElementById(phoneFields[0]);
                const phoneDiv = firstPhoneField.closest('.form__tel');
                if (phoneDiv) {
                    phoneDiv.parentNode.insertBefore(errorMessage, phoneDiv.nextSibling);
                }
                shownPhoneError = true;
            }
        } else if (zipFields.includes(field)) {
            const zipDiv = formField.closest('.form__zip');
            if (zipDiv) {
                zipDiv.parentNode.insertBefore(errorMessage, zipDiv.nextSibling);
            }
        } else if (field === 'RegisterForm-Prefecture') {
            const selectDiv = formField.closest('.form__selectbox');
            if (selectDiv) {
                selectDiv.parentNode.insertBefore(errorMessage, selectDiv.nextSibling);
            }
        } else {
            formField.parentNode.appendChild(errorMessage);
        }
    });
}

function hideError(fields) {
    fields.forEach(field => {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    });
}

function validatePhone() {
    const phoneFields = [
        'RegisterForm-CustomerTel1', 'RegisterForm-CustomerTel2', 'RegisterForm-CustomerTel3'
    ];
    const zipFields = ['RegisterForm-ZipCode1'];
    const fields = [
        'RegisterForm-CustomerTel1', 'RegisterForm-CustomerTel2', 'RegisterForm-CustomerTel3',
        'RegisterForm-LastName', 'RegisterForm-FirstName', 'RegisterForm-LastNameKana',
        'RegisterForm-FirstNameKana', 'RegisterForm-Prefecture', 'RegisterForm-City', 'RegisterForm-ZipCode1', 'RegisterForm-ZipCode2'
    ];

    const invalidFields = fields.filter(field => {
        const fieldValue = document.getElementById(field)?.value.trim() || '';
        if (!fieldValue) {
            return true;
        }
        if (phoneFields.includes(field) && !/^\d+$/.test(fieldValue)) {
            return true;
        }
        if (zipFields.includes(field) && !/^\d{3}-\d{4}$/.test(fieldValue)) {
            return true;
        }
        return false;
    });

    if (invalidFields.length > 0) {
        showError(invalidFields);
    } else {
        hideError(fields);
    }

    return invalidFields.length === 0;
}

document.getElementById('create_customer').addEventListener('submit', function(e) {
    if (!validatePhone()) {
        e.preventDefault();
    }
});
