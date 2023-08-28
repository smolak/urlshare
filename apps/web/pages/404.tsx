import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import { NextPage } from "next";

const Custom404: NextPage = () => {
  return <ThreeColumnLayout mainContent={<h2>404...</h2>} />;
};

export default Custom404;
