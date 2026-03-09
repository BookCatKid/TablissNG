import type { ReactNode } from "react";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";
import useBaseUrl from "@docusaurus/useBaseUrl";
import styles from "./index.module.sass";

export default function Gallery(): ReactNode {
  const screenshots = [
    "screenshot_1.png",
    "screenshot_2.png",
    "screenshot_3.png",
    "screenshot_4.png",
    "screenshot_5.png",
    "screenshot_6.png",
    "screenshot_7.png",
    "screenshot_8.png",
  ];

  return (
    <Layout title="Gallery" description="View all screenshots of TablissNG.">
      <main className={styles.showcaseSection}>
        <div className="container">
          <Heading
            as="h1"
            style={{ textAlign: "center", marginBottom: "3rem" }}
          >
            Screenshot Gallery
          </Heading>
          <div
            className={styles.showcaseGrid}
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            }}
          >
            {screenshots.map((src, index) => (
              <div key={index}>
                <img
                  src={useBaseUrl(`img/screenshots/${src}`)}
                  alt={`Tabliss Screenshot ${index + 1}`}
                  className={styles.showcaseImage}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
