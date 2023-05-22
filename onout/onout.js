import appRouter from './appRouter.js';
import constants from './constants.js';
import utils from './utils.js';

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/*
git commit main
node onout.js ghp_FsX...qn (github user key)
DO NOT RUN WITHOUT COMMIT FROM "main" branch (git can delete your unsaved changes)
*/

if (!process.argv[2]) {
  throw new Error('Github key is required');
}

// Fix ReferenceError, because we cannot set __dirname directly in ES module.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/app', appRouter);
app.disable('x-powered-by');

app.get('/', (req, res) => {
  res.send(
    utils.wrapInHtmlTemplate(`
    <header class="">
      <h2>Log into deployment page</h2>
    </header>
    <main>
      <section class="accessSection">
        <p>Enter your license code</p>
        <form method="post" action="app" class='accessForm'>
          <input type='text' name='access_code' placeholder='License' required>
          <br />
          <input type='submit' value='Login' class='primaryBtn'>
        </form>

        <p>
          Do not have a license?
          <a href="${constants.accessCodePaymentLink}" target=_blank>
            <strong>Get it here</strong>
          </a>
        </p>
      </section>
    </main>
  `),
  );
});

const PORT = 3006;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
