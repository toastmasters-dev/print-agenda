module.exports = {
  siteMetadata: {
    title: 'Print Toastmasters Agenda',
  },
  pathPrefix: '/print-agenda',
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-typography',
      options: {
        pathToConfigModule: 'src/utils/typography.js',
      },
    },
  ],
};
