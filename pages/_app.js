import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/file.png" />
        <title>DocTrac</title>
      </Head>

      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
