import React from "react";
import { AyngalLogo, AyngalLogoProps } from "./AyngalLogo";

export interface ShuaybLogoProps extends AyngalLogoProps {}

export const ShuaybLogo: React.FC<ShuaybLogoProps> = (props) => {
  return <AyngalLogo {...props} />;
};

export default ShuaybLogo;
