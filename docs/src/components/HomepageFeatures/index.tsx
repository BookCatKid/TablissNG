import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.sass";

type FeatureItem = {
  title: string;
  description: ReactNode;
  icon: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: "Beautiful Backgrounds",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "40px", height: "40px" }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    description: (
      <>
        Choose from millions of high-quality photos from Unsplash, NASA, Bing,
        and more. Or use your own custom images, videos, and gradients.
      </>
    ),
  },
  {
    title: "Powerful Widgets",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "40px", height: "40px" }}
      >
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    description: (
      <>
        Stay productive with widgets for time, weather, notes, todos, and system
        information. All fully customizable to fit your workflow.
      </>
    ),
  },
  {
    title: "Privacy Focused",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ width: "40px", height: "40px" }}
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    description: (
      <>
        TablissNG respects your privacy. No tracking, no unnecessary
        permissions, and open source under GPL-3.0 for full transparency.
      </>
    ),
  },
];

function Feature({ title, description, icon }: FeatureItem) {
  return (
    <div className={clsx("col col--4")}>
      <div className={styles.featureCard}>
        <span className={styles.featureIcon}>{icon}</span>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
