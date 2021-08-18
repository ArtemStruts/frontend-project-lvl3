import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import state from './watchers.js';
import resources from './locales/index.js';

const app = () => {
  i18next.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => {
    setLocale({
      string: {
        required: i18next.t('errors.emptyField'),
        url: i18next.t('errors.invalidUrl'),
      },
    });
    const schema = yup.string().trim().required().url();
    const validator = (field) => {
      schema
        .validate(field)
        .then((valid) => {
          if (state.feeds.includes(field)) {
            state.error = i18next.t('errors.feedAlreadyExist');
          } else {
            state.feeds.push(valid);
            state.error = '';
          }
        })
        .catch((e) => {
          state.error = e.message;
        });
    };

    const form = document.querySelector('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const value = formData.get('url');
      validator(value);
    });
  });
};

export default app;
