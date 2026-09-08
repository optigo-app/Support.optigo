import { Helmet } from "react-helmet-async";
import { META_CONFIG } from "./index";

const MetaWrapper = ({ page }) => {
  const meta = META_CONFIG[page] || META_CONFIG.NotFound;
  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:site_name" content="Optifo Central System" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
    </Helmet>
  );
};

export default MetaWrapper;
