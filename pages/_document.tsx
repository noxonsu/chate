import { DocumentProps, Head, Html, Main, NextScript } from 'next/document';

import i18nextConfig from '../next-i18next.config';

type Props = DocumentProps & {
  // add custom document props
};
//<script dangerouslySetInnerHTML={{ __html: ' window.sensorica_client_id = "5";window.post_id = "26"; window.chatUniqId = sensorica_client_id+"_"+post_id; window.main_title = "Welcome to Sensorica AI Presale Consultant. Ready to Guide You!";window.sensorica_openaiproxy = "https://apisensorica13015.onout.org/";' }}></script>
export default function Document(props: Props) {
  const currentLocale =
    props.__NEXT_DATA__.locale ?? i18nextConfig.i18n.defaultLocale;
  return (
    <Html lang={currentLocale}>
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Chatbot UI"></meta>
        {process.env.NODE_ENV === 'development' && (
          <script dangerouslySetInnerHTML={{ __html: ' window.sensorica_client_id = "5";window.post_id = "136"; window.chatUniqId = sensorica_client_id+"_"+post_id; window.main_title = "Welcome to Sensorica AI Presale Consultant. Ready to Guide You!";window.sensorica_openaiproxy = "https://sensorica.onout.org/wp-json/sensorica/v1/openaiapi/";' }}></script>
        )}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
