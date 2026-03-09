import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";
import DownloadButtons from "@site/src/components/DownloadButtons";

import useBaseUrl from "@docusaurus/useBaseUrl";

import styles from "./index.module.sass";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <img
          src={useBaseUrl("img/logo.svg")}
          alt="TablissNG Logo"
          className={styles.heroLogo}
        />
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <DownloadButtons height={60} />
        <div className={styles.buttons} style={{ gap: "1rem" }}>
          <Link className="button button--primary button--lg" to="/intro">
            View Documentation
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://bookcatkid.github.io/TablissNG/"
          >
            Try in Browser
          </Link>
        </div>
        <div className={styles.showcase} style={{ marginTop: "4rem" }}>
          <img
            src={useBaseUrl("img/screenshots/screenshot_1.png")}
            alt="Tabliss Showcase"
            className={styles.showcaseImage}
            style={{ maxWidth: "1000px" }}
          />
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="TablissNG - A beautiful, private, and customizable new tab page for your browser."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.showcaseSection}>
          <div className="container">
            <div className={styles.showcase} style={{ gap: "2rem" }}>
              <div className={styles.showcaseGrid}>
                <img
                  src={useBaseUrl("img/screenshots/screenshot_2.png")}
                  alt="Screenshot 2"
                  className={styles.showcaseImage}
                />
                <img
                  src={useBaseUrl("img/screenshots/screenshot_3.png")}
                  alt="Screenshot 3"
                  className={styles.showcaseImage}
                />
              </div>
              <div className={styles.buttons}>
                <Link
                  className="button button--secondary button--lg"
                  to="/gallery"
                >
                  View All Screenshots
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
