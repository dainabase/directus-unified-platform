import React from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: '60+ Production-Ready Components',
    icon: '🎨',
    description: (
      <>
        Comprehensive component library with everything you need to build modern applications.
        From basic inputs to complex data grids, all thoroughly tested with 93%+ coverage.
      </>
    ),
  },
  {
    title: 'Lightning Fast Performance',
    icon: '⚡',
    description: (
      <>
        50KB bundle size with tree-shaking support. 0.8s load time and lazy loading ensure
        your applications stay fast. Optimized for Core Web Vitals with 95+ Lighthouse score.
      </>
    ),
  },
  {
    title: 'Enterprise-Grade Quality',
    icon: '🏢',
    description: (
      <>
        Built for production with TypeScript, comprehensive testing, and full accessibility.
        WCAG 2.1 AA compliant components with complete keyboard navigation support.
      </>
    ),
  },
  {
    title: 'Beautiful by Default',
    icon: '✨',
    description: (
      <>
        Modern design system with automatic dark mode, comprehensive theming, and design tokens.
        Customize everything with CSS variables and Tailwind integration.
      </>
    ),
  },
  {
    title: 'Developer Experience First',
    icon: '💻',
    description: (
      <>
        Full TypeScript support with IntelliSense, detailed documentation, and live examples.
        Get started in minutes with our comprehensive guides and patterns.
      </>
    ),
  },
  {
    title: 'Global Ready',
    icon: '🌍',
    description: (
      <>
        Built-in internationalization support for 5+ languages. RTL support and locale-aware
        components make it perfect for global applications.
      </>
    ),
  },
];

function Feature({ title, icon, description }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.feature}>
        <div className={styles.featureIcon}>{icon}</div>
        <div className="padding-horiz--md">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        
        <div className={styles.statsSection}>
          <h2 className="text--center margin-bottom--lg">
            By the Numbers
          </h2>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statNumber}>60+</div>
              <div className={styles.statLabel}>Components</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>93%</div>
              <div className={styles.statLabel}>Test Coverage</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>50KB</div>
              <div className={styles.statLabel}>Bundle Size</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>100%</div>
              <div className={styles.statLabel}>TypeScript</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statNumber}>0.8s</div>
              <div className={styles.statLabel}>Load Time</div>
            </div>
          </div>
        </div>

        <div className={styles.showcaseSection}>
          <h2 className="text--center margin-bottom--lg">
            Trusted by Developers Worldwide
          </h2>
          <div className={styles.testimonials}>
            <div className={styles.testimonial}>
              <p>
                "Dainabase UI has transformed how we build applications. The component quality
                and documentation are exceptional."
              </p>
              <div className={styles.author}>
                <strong>Sarah Chen</strong>
                <span>Senior Frontend Engineer</span>
              </div>
            </div>
            <div className={styles.testimonial}>
              <p>
                "The best React component library I've worked with. Performance is incredible
                and the DX is unmatched."
              </p>
              <div className={styles.author}>
                <strong>Marcus Johnson</strong>
                <span>Tech Lead</span>
              </div>
            </div>
            <div className={styles.testimonial}>
              <p>
                "Finally, a component library that just works. Great accessibility, theming,
                and the TypeScript support is perfect."
              </p>
              <div className={styles.author}>
                <strong>Elena Rodriguez</strong>
                <span>Full Stack Developer</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.ecosystem}>
          <h2 className="text--center margin-bottom--lg">
            Part of a Complete Ecosystem
          </h2>
          <div className={styles.ecosystemGrid}>
            <div className={styles.ecosystemItem}>
              <h4>🎯 Directus Integration</h4>
              <p>Seamlessly integrates with Directus CMS for content management</p>
            </div>
            <div className={styles.ecosystemItem}>
              <h4>📚 Storybook</h4>
              <p>Browse all components in our interactive Storybook</p>
            </div>
            <div className={styles.ecosystemItem}>
              <h4>🧪 Testing Suite</h4>
              <p>Comprehensive testing with Jest, Playwright, and Chromatic</p>
            </div>
            <div className={styles.ecosystemItem}>
              <h4>🚀 CI/CD Ready</h4>
              <p>Automated workflows for testing, building, and deployment</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
