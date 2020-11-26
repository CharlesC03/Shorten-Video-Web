import { createApp } from 'vue';
import Shortener from './Shortener.vue';
import Title from './Title.vue';

const main = createApp(Shortener);
const title = createApp(Title);
title.mount('#title');
main.mount('#main');

// Hot Module Replacement (HMR) - Remove this snippet to remove HMR.
// Learn more: https://www.snowpack.dev/#hot-module-replacement
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(() => {
    title.unmount();
    main.unmount();
  });
}
