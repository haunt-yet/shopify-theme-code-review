 function addHiddenExtraFeeInForm(value) {
      // check if hidden input with id=extra-fee is already in product form class product__info-container.
      const productInfoContainer = document.querySelector('.product__info-container');
      const extraFeeInput = productInfoContainer.querySelector('input[id="extra-fee"]');
      if (extraFeeInput) {
        return;
      }
      const sectionId = productInfoContainer.querySelector('input[name="section-id"]').value;
      console.log('sectionId', sectionId);
      const newInput = document.createElement('input');
      newInput.class = 'field__input';
      newInput.setAttribute('form', 'product-form-' + sectionId);
      newInput.type = 'hidden';
      newInput.id = 'extra-fee';
      newInput.value = value;
      newInput.name = 'properties[extra fee]';
      productInfoContainer.appendChild(newInput);
   }

   function changeValueOfHiddenInput(value) {
    const productInfoContainer = document.querySelector('.product__info-container');
    const extraFeeInput = productInfoContainer.querySelector('input[id="extra-fee"]');
    extraFeeInput.value = value;
   }
    document.addEventListener('DOMContentLoaded', function() {
      const radioButtons = document.querySelectorAll('input[name="add_price"]');
      radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
          const value = this.value + '円';
          addHiddenExtraFeeInForm(value);
          changeValueOfHiddenInput(value);
        });
      });
  });