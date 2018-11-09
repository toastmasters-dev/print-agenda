import React from 'react';
import Helmet from 'react-helmet';
import {StaticQuery, graphql, withPrefix} from 'gatsby';

import css from '../styles/layout.module.css';
import banner_img from '../images/tmi-banner.png';

const render = (children, data) => (
  <>
    <Helmet>
      <title>{data.site.siteMetadata.title}</title>
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={withPrefix('/favicon-32x32.png')}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={withPrefix('/favicon-16x16.png')}
      />
      <link
        rel="mask-icon"
        href={withPrefix('/safari-pinned-tab.svg')}
        color="#5bbad5"
      />
      <link
        rel="shortcut icon"
        href={withPrefix('/favicon.ico')}
      />
      <meta name="msapplication-TileColor" content="#da532c" />
      <meta name="theme-color" content="#ffffff" />
    </Helmet>
    <div className={css.header}>
      <img src={banner_img} alt="Toastmasters International" />
      <hr />
    </div>
    <div className={css.body}>
      {children}
    </div>
  </>
);

const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

export default ({children}) => (
  <StaticQuery query={query} render={data => render(children, data)} />
);
