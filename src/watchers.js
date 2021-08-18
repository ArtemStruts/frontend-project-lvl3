import onChange from 'on-change';

const render = (elements, val, preVal) => {
  if (val === '' && preVal !== '') {
    elements.input.classList.remove('is-invalid');
    elements.container.removeChild(elements.container.lastChild);
    elements.form.reset();
    elements.form.focus();
  }
  if (val !== '' && preVal === '') {
    elements.input.classList.add('is-invalid');
    const errorFeedback = document.createElement('div');
    errorFeedback.classList.add('text-danger');
    errorFeedback.textContent = val;
    elements.container.append(errorFeedback);
  }
  if (val !== '' && preVal !== '') {
    const feedback = document.querySelector('.text-danger');
    feedback.textContent = val;
  }
};

const DOMelements = {
  container: document.querySelector('#container'),
  form: document.querySelector('form'),
  input: document.querySelector('input'),
  button: document.querySelector('button'),
};

const state = onChange({
  feeds: [],
  error: '',
}, (path, value, prevValue) => {
  if (path === 'error') {
    render(DOMelements, value, prevValue);
  }
});

export default state;
