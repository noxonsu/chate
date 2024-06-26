const constants = require('./constants')
const utils = require('./utils')

const express = require('express')
const { body, validationResult } = require('express-validator')
const { exec } = require('node:child_process')
const fs = require('node:fs')

const router = new express.Router();

let fileName = 'components/Chat/Chat.tsx';

const regex = new RegExp(
  `          <div className="text-center text-4xl font-bold text-black dark:text-white">
            (.*?)
          </div>
          <div className="text-center text-lg text-black dark:text-white">
            <div className="mb-8">.*?</div>
            <div className="mb-2 font-bold">
              .*?
            </div>
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">
              .*?
            </div>
            <div className="mb-2">
              .*?
            </div>
            <div className="mb-2">
              (.*?)
            </div>
            <div>
              (.*?)
            </div>
          </div>`,
  's',
);

const accessCodeRegex = new RegExp(constants.accessCode);

router.post(
  '/',
  [
    body('access_code')
      .trim()
      .notEmpty()
      .escape()
      .matches(accessCodeRegex)
      .withMessage('Enter a valid code'),
  ],
  (req, res) => {
    const result = validationResult(req);

    if (result.errors.length) {
      return res.status(401).send(
        utils.returnErrorsHtmlPage({
          title: 'Not allowed',
        }),
      );
    }

    return res.send(
      utils.wrapInHtmlTemplate(`
        <header>
          <h1>Configure interface and deploy your widget</h1>
        </header>
        <main>
          <form method="post" action="/submit-form">
            <div class="form-group">
              <label for="">OpenAI API key.</label>
              <input id="" placeholder="" required />
            </div>
            
            <h2>Interface</h2>
          
            <div class="form-group">
              <label for="h1text">1. Main title.</label>
              <input type="text" class="form-control" name="h1text" id="h1text" placeholder="Welcome!" value="Your welcome message">
            </div>
            
            <div class="form-group">
              <label for="main_text">2. Main description.</label>
              <textarea class="form-control" style="width:500px;height:300px" required name="main_text" id="main_text">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</textarea>
            </div>
            
            <h2>Monetization</h2>
          
            <div class="form-group">
              <label for="link">3. Link to get an access code. Without it he won't be able to use your widget.</label>
              <input type="text" name="link" id="link" placeholder="https://www.buymeacoffee.com/onoutorg/e/123456">
            </div>
            
            <div class="form-group">
              <label for="linkText">4. Text of the link for an access code.</label>
              <input type="text" name="linkText" id="linkText" placeholder="Buy access code here" value="Buy access">
            </div>
            <input type="submit" class="btn btn-primary" value="Deploy">
          </form>
          <div>
            <img class="rounded-lg-3" src="https://onout.org/Chate/mainimage.png" alt="" width="720">
          </div>
        </main>
      `)
    );
  },
);

router.post(
  '/submit-form',
  [body('main_text').notEmpty().withMessage('Please specify main text')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }

    let main_text = utils.escapeAttr(req.body.main_text);

    let api_response;
    let reponame = 'chate';
    //telegram api get bit name by api key
    const nm = `i${new Date().getMinutes()}${new Date().getDate()}${new Date().getMonth()}${new Date().getFullYear()}`;
    console.log('nm:' + nm);

    exec(`git checkout -b ${nm}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`git checkout -b err: ${error}`);
        return res.status(400).json({
          error: `Failed to checkout. ${error}`,
        });
      }

      console.log(stdout);

      if (req.body.open_ai_key) {
        //open_ai_key key is provided by admin
      }

      fs.readFile(fileName, 'utf8', function (err, data) {
        if (err) {
          console.error(err);
          return;
        }
        let link = '';

        //if request.body.link is not empty
        if (req.body.link) {
          link = `<a href="${utils.escapeAttr(
            req.body.link,
          )}" target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:underline">${utils.escapeAttr(
              req.body.linkText,
            )}</a>`;
        }
        let h1text = utils.escapeAttr(req.body.h1text);
        let description = utils.escapeAttr(req.body.main_text);
        const str_new = `<div className="text-center text-4xl font-bold text-black dark:text-white">
          ${h1text}
        </div>
        <div className="text-center text-lg text-black dark:text-white">
          <div className="mb-8">${description}</div>
          <div className="mb-2 font-bold">
            
          </div>
        </div>
        <div className="text-center text-gray-500 dark:text-gray-400">
         
          <div className="mb-2">
            
          </div>
          <div>
            ${link}
          </div>
        </div>`;

        const updatedData = data.replace(regex, str_new); //это строка для замены прямо в файле

        fs.writeFile(`${fileName}`, updatedData, 'utf8', function (err) {
          if (err) {
            console.error(err);
            return;
          }
          console.log('File updated successfully');
        });

        //load ghkey from .env

        exec(
          `git add . && git commit -a -m "replace chat welcome screen" && git push https://${process.argv[2]}@github.com/marsiandeployer/${reponame}.git && git checkout main`,
          (error, stdout, stderr) => {
            if (error) {
              console.error(`84: ${error}`);
              return res.status(400).json({
                error: '156',
              });
            }
            console.log(stdout);
            res.send(
              `<!doctype html>
                <html lang="en">
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>deploy</title>
                    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-rbsA2VBKQhggwzxH7pPCaAqO46MgnOM80zW1RWuH61DGLwZJEdK2Kadq2F9CUG65" crossorigin="anonymous">
                    <link rel="stylesheet" href="styles.css">
                  </head>
                  <body>
                  
                  
                  <div class="container my-5">
                  <div class="row p-4 pb-0 pe-lg-0 pt-lg-5 align-items-center rounded-3 border shadow-lg">
                    <div class="col-lg-7 p-3 p-lg-5 pt-lg-3">
                  
                  
                    <div class="">
                    
                    <Br>  <bR><br>
                    <h1><a href="https://chate-git-${nm}-marsiandeployer.vercel.app/" target=_blank>✅ https://chate-git-${nm}-marsiandeployer.vercel.app/</a></h1>
                    <br>
                    <div class="alert alert-success" role="alert">
                Success. Your app will be availabe in <span id='incomeTicker'>70</span>s. Enjoy :) Plesae note if you send form again domain will be changed . 
                </div>
                <br><script>var incomeTicker = 70;

                window.setInterval(function(){
                 if (incomeTicker > 0)
                   incomeTicker--;
                      document.getElementById("incomeTicker").innerHTML = incomeTicker;
                if (incomeTicker <= 0)
                  incomeTicker = 30;
                }, 1000);
                </script><Br><br>
                <h2>Widget HTML code to embed on your site:</h2>
                
                <textarea class="form-control" id="exampleFormControlTextarea1" rows="3">
<!-- iframe with 100% height -->
<iframe style='border:0;min-width:400px;min-height:800px' src="https://chate-git-${nm}-marsiandeployer.vercel.app/" class='' id="onoutiframe" width="100%" height="100%"></iframe>
<!-- fix 100% onoutiframe iframe height on pure js -->
<script>
var iframe = document.getElementById('onoutiframe');
iframe.onload = function() {
iframe.height = iframe.contentWindow.document.body.scrollHeight + 'px';
};
</script></textarea>
                <h2>zip archive with site:</h2>
                <form id="iframe-generator-form">
        <input type="hidden" value="https://chate-git-${nm}-marsiandeployer.vercel.app/" id="site-url" name="site-url" required>
        <input type="hidden" value="${h1text}" id="site-title" name="site-title" required>
        <button type="submit">Download zip archive</button>
    </form>

    <script>
        document.getElementById('iframe-generator-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const siteUrl = document.getElementById('site-url').value;
            const siteTitle = document.getElementById('site-title').value; 
            const response = await fetch('https://zips.onout.org/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ siteUrl, siteTitle})
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'iframe-generator.zip';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Error generating iframe: ' + await response.text());
            }
        });
    </script>
                
                </div>
                
                </div>
    <div class="col-lg-5 p-0 overflow-hidden shadow-lg">
        <img class="rounded-lg-3" src="https://onout.org/Chate/mainimage.png" alt="" width="720">
    </div>
  </div>
</div>
                </body>
                </html>
                `,
            );
          },
        );
      });
    });
  },
);

module.exports = router
