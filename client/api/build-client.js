// Imports and Package Declarations
import axios from "axios";

// Export
export default async ({ req }) => {
  /* 
        Check whether request origin is server or browser
        Server request URL's need to go through ingress service - http://ingress-nginx.ingress-nginx.local.srv/api/users/?
        Browser request URL's need to stay the same as if made through component - /api/users/?
    */

  // Variables for process
  const baseAxiosURL =
    typeof window === "undefined"
      ? "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local"
      : "";
  // console.log(baseAxiosURL);

  return axios.create({
    baseURL: baseAxiosURL,
    headers: req?.headers,
  });
};
