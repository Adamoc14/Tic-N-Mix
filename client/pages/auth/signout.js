// Imports and Package Declarations
import { useEffect } from "react";
import useRequest from "../../hooks/use-request";
import Router from 'next/router'

// Sign Out Component
const SignOut = () => {

  // Make Sign Out Request
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/')
  }) 

  // Call Method on first load
  useEffect(() => {
    doRequest();
  }, [])   

  return <div>Signing you out....</div>;
};

// Export
export default SignOut;
