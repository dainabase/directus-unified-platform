import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/introduction">
            Get Started - 5min ⏱️
          </Link>
          <Link
            className="button button--primary button--lg"
            to="/docs/components/button">
            Explore Components 🎨
          </Link>
        </div>
        <div className={styles.badges}>
          <img src="https://img.shields.io/badge/Components-60+-blue" alt="60+ Components" />
          <img src="https://img.shields.io/badge/Test%20Coverage-93%25+-green" alt="93%+ Test Coverage" />
          <img src="https://img.shields.io/badge/Bundle%20Size-50KB-orange" alt="50KB Bundle Size" />
          <img src="https://img.shields.io/badge/TypeScript-100%25-blue" alt="100% TypeScript" />
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`Welcome to ${siteConfig.title}`}
      description="A modern, accessible, and performant React component library for building enterprise applications">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        
        <section className={styles.demo}>
          <div className="container">
            <h2>See It In Action</h2>
            <p>Experience the power and flexibility of Dainabase UI components</p>
            <div className={styles.demoGrid}>
              <div className={styles.demoCard}>
                <h3>🎯 Production Ready</h3>
                <p>60+ thoroughly tested components with 93%+ test coverage</p>
              </div>
              <div className={styles.demoCard}>
                <h3>⚡ Lightning Fast</h3>
                <p>50KB bundle size with 0.8s load time and lazy loading support</p>
              </div>
              <div className={styles.demoCard}>
                <h3>🎨 Fully Customizable</h3>
                <p>Comprehensive theming system with dark mode and design tokens</p>
              </div>
              <div className={styles.demoCard}>
                <h3>♿ Accessible</h3>
                <p>WCAG 2.1 AA compliant with full keyboard navigation</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className="container">
            <h2>Ready to Build Something Amazing?</h2>
            <p>Join thousands of developers using Dainabase UI to create beautiful applications</p>
            <div className={styles.ctaButtons}>
              <Link
                className="button button--primary button--lg"
                to="/docs/getting-started/installation">
                Start Building →
              </Link>
              <Link
                className="button button--outline button--lg"
                href="https://github.com/dainabase/directus-unified-platform">
                View on GitHub
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
