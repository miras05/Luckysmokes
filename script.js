
const faqItems = document.querySelectorAll('#faq-item');

faqItems.forEach(faqItem => {
    const faqAnswer = faqItem.querySelector('p');

    faqItem.addEventListener('click', function () {
      if (faqAnswer.style.display === 'none' || faqAnswer.style.display === '') {
        faqAnswer.style.marginBottom = "10px";
        faqAnswer.style.display = 'block';
      } else {
        faqAnswer.style.display = 'none';
      }
    });
});
