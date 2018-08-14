import React from 'react';
import Link from 'gatsby-link';

import css from '../styles/header.module.css';
import banner_img from '../images/tmi-banner.png';

const Header = () => (
  <div className={css.root}>
    <img src={banner_img} alt="Toastmasters International" />
    <hr />
  </div>
);

export default Header;
