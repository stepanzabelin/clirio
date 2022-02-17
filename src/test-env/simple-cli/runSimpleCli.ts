import { simpleCli } from './simpleCli';

simpleCli(
  (err) => {
    console.log(err.message);
  },
  () => {}
);
