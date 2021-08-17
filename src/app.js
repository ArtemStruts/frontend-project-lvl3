import * as yup from 'yup';
import onChange from 'on-change';

const schema = yup.string().trim().required('Поле обязательно для заполнения.').url('Ссылка должна быть валидным URL');

const render = (elements, val, preVal) => {
  if (val === '' && preVal !== '') {
    elements.input.classList.remove('is-invalid');
    elements.container.removeChild(elements.container.lastChild);
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

const app = () => {
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

  const validator = (field) => {
    schema
      .validate(field)
      .then((valid) => {
        if (state.feeds.includes(field)) {
          state.error = 'RSS уже существует';
        } else {
          state.feeds.push(valid);
          state.error = '';
        }
      })
      .catch((e) => {
        state.error = e.message;
      });
  };

  DOMelements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const value = formData.get('url');
    validator(value);
  });
};

export default app;
