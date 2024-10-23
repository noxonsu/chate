import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from '@/utils/app/const';
import { OpenAIError, OpenAIStream } from '@/utils/server';

import { ChatBody, Message } from '@/types/chat';

import { parse } from 'url';
// @ts-expect-error
import wasm from '../../node_modules/@dqbd/tiktoken/lite/tiktoken_bg.wasm?module';

import tiktokenModel from '@dqbd/tiktoken/encoders/cl100k_base.json';
import { Tiktoken, init } from '@dqbd/tiktoken/lite/init';
import { url } from 'inspector';
export const config = {
  runtime: 'edge',
};

const handler = async (req: Request): Promise<Response> => {
    let { model, messages, key, prompt, temperature } = (await req.json()) as ChatBody;
    
    
    await init((imports) => WebAssembly.instantiate(wasm, imports));
    const encoding = new Tiktoken(
      tiktokenModel.bpe_ranks,
      tiktokenModel.special_tokens,
      tiktokenModel.pat_str,
    );

    let promptToSend

    try {
      const { query } = parse(req.url, true);
      let sensorica_client_id = query.sensorica_client_id || 0;
      let post_id = query.post_id || 0;
      let backsensorica='http://localhost:3011'
      //backsensorica = 'https://telegram.onout.org'
      let url = backsensorica+`/proxyChat?sensorica_client_id=`+sensorica_client_id+`&post_id=`+post_id;
      console.log(url);
      const response = await fetch(url);
      /* {"data":{"MAIN_TITLE":"Welcome to WordPress Help Center. Ask me anything!","API_KEY":"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","SYSTEM_PROMPT":"Answer questions about WordPress"},"encrypted":"NacgZhhS1sM9T10IsATS85Du7XMJN+puxYotc5KbN4WVOm2k2UPsCZ6CT1MSbJzrjWDYbTjQ9jt7CQaGrX1FlVShGjwGaRAgUtbgl0ViZAL1AB9veA1TLi4UHmrnY7uqaKvK9ip35ajOorlczulBGtyxS98r6pCwauf/YUtIakdi91q9hf1E35Sghhcs+MbXoAVb3erw+4N2hfaelcj8g9UBmsaByuEPeeRwV4ON4XqDLRBmoanOWS1tBgumI8psnHzSZ1udsEk4xdNfIS1BDOmK9JdBtGMJUwh1ziR8W+/37NBSx9poLWrOuSXSAVb1ohtXwSE21iXBuCL+KBAAE6JHlGYurg4pfHLhyOFuNK354/ODQ6lGBEM3AOY3BRI9kzIzH9pjISFCDHJUiWm8/VXZnuwgb4fnfooiDwupcjQsZasMrHc44ZPB+vZ+QvZnE0hDTDgzdpjf4X/v2G/0q/JtFd7jAJ8I9zvW5dDecxQCoFA8L+7cn/ovb0mng/kx"} */
      let responsedata = await response.json()
      key = responsedata.data.API_KEY;
      promptToSend = responsedata.data.SYSTEM_PROMPT;
      let sensorica_model = responsedata.data.sensorica_openai_model;
      
      if (sensorica_model =='gpt-4-turbo-preview') {
        model = { id: "gpt-4-turbo-preview", name: "GPT-4-turbo", maxLength: 300000, tokenLimit: 122000 }
        model = { id: "gpt-4o", name: "GPT-4o", maxLength: 300000, tokenLimit: 122000 }
      } else {
        model = { id: "gpt-3.5-turbo-1106", name: "GPT-3.5", maxLength: 16000, tokenLimit: 124000 }
      }
      console.log("model", model);
      
      //console.log("promptToSend", promptToSend);
      if (!promptToSend) {
        return new Response(JSON.stringify({
          message: 'Error with promptToSend',
        }), {
            status: 502,
            statusText: 'promptToSend.',
            headers: { 'Content-Type': 'application/json' } // Set the Content-Type header to indicate a JSON response
        });
      }
    } catch (error) {
      return new Response(JSON.stringify({
          message: 'Failed to fetch data from proxyChat endpoint.',
      }), {
          status: 501,
          statusText: 'Failed to fetch data from proxyChat endpoint.',
          headers: { 'Content-Type': 'application/json' } // Set the Content-Type header to indicate a JSON response
      });
    }

    let temperatureToUse = temperature;
    if (temperatureToUse == null) {
      temperatureToUse = DEFAULT_TEMPERATURE;
    }

    const prompt_tokens = encoding.encode(promptToSend);

    let tokenCount = prompt_tokens.length;
    let messagesToSend: Message[] = [];

    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      const tokens = encoding.encode(message.content);

      if (tokenCount + tokens.length + 1000 > model.tokenLimit) {
        break;
      }
      tokenCount += tokens.length;
      messagesToSend = [message, ...messagesToSend];
    }

    encoding.free();

    try {
      //console.log("messagesToSend", messagesToSend);
      const stream = await OpenAIStream(model, promptToSend, temperatureToUse, key, messagesToSend);
      return new Response(stream);
    } catch (error) {
      return new Response(JSON.stringify({
        message: 'Failed to process the request.',
      }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    //return new Response(stream);
    try {} catch (error) {
    
    if (error instanceof OpenAIError) {
    }
  }
};

export default handler;
