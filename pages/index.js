import fs from "fs";
import path from "path";
import Head from "next/head";

export async function getServerSideProps() {
  const htmlPath = path.join(process.cwd(), "pages", "index.html");
  let rawHtml = "";
  try {
    rawHtml = await fs.promises.readFile(htmlPath, "utf8");
  } catch (err) {
    // Fallback simples caso o arquivo não exista
    return {
      props: {
        title: "Página",
        body: "<h1>Conteúdo não encontrado</h1>",
        css: "",
      },
    };
  }

  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1] : "Página";

  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : rawHtml;

  // Inliner de CSS para evitar problemas de servir arquivo estático
  const cssPath = path.join(process.cwd(), "pages", "styles.css");
  let css = "";
  try {
    css = await fs.promises.readFile(cssPath, "utf8");
  } catch (_) {
    // Sem CSS, segue sem estilos
  }

  return { props: { title, body, css } };
}

export default function Home({ title, body, css }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      </Head>
      <div dangerouslySetInnerHTML={{ __html: body }} />
    </>
  );
}
